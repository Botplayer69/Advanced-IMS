"""
GET    /api/operations                  — list, ?type=&status=
POST   /api/operations                  — create with items
GET    /api/operations/{id}             — detail with items
PATCH  /api/operations/{id}/status      — update status
POST   /api/operations/{id}/validate    — validate receipt (atomic)
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from backend.database import get_db
from backend.dependencies import get_current_user, require_manager
from backend.schemas import (
    OperationCreate,
    OperationOut,
    OperationItemOut,
    OperationStatusUpdate,
    ValidateReceiptRequest,
)

router = APIRouter(prefix="/api/operations", tags=["operations"])


def _fetch_operation(cur, operation_id: str) -> dict:
    cur.execute(
        """
        SELECT
            o.id, o.type, o.status, o.reference, o.suppliername AS "supplierName",
            o.sourcewarehouseid AS "sourceWarehouseId", o.destinationwarehouseid AS "destinationWarehouseId",
            o.requestedby AS "requestedBy", o.createdat AS "createdAt", o.updatedat AS "updatedAt",
            ws.name AS "sourceWarehouseName",
            wd.name AS "destinationWarehouseName"
        FROM   "Operation" o
        LEFT JOIN "Warehouse" ws ON ws.id = o.sourcewarehouseid
        LEFT JOIN "Warehouse" wd ON wd.id = o.destinationwarehouseid
        WHERE  o.id = %s
        """,
        (operation_id,),
    )
    return cur.fetchone()


def _fetch_items(cur, operation_id: str) -> list[dict]:
    cur.execute(
        """
        SELECT oi.id, oi.productid AS "productId", oi.quantity,
               p.name AS "productName", p.sku AS "productSku"
        FROM   "OperationItem" oi
        JOIN   "Product" p ON p.id = oi.productid
        WHERE  oi.operationid = %s
        """,
        (operation_id,),
    )
    return [dict(r) for r in cur.fetchall()]


@router.get("", response_model=list[OperationOut])
def list_operations(
    type: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    requested_by: Optional[str] = Query(None),
    warehouse_id: Optional[str] = Query(None),
    _user=Depends(get_current_user),
):
    clauses = []
    params: list = []

    if type:
        clauses.append("o.type = %s::operation_type")
        params.append(type)
    if status_filter:
        clauses.append("o.status = %s::operation_status")
        params.append(status_filter)
    if requested_by:
        clauses.append('o.requestedby = %s')
        params.append(requested_by)
    if warehouse_id:
        clauses.append('(o.sourcewarehouseid = %s OR o.destinationwarehouseid = %s)')
        params.extend([warehouse_id, warehouse_id])

    where = ("WHERE " + " AND ".join(clauses)) if clauses else ""

    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            f"""
            SELECT
                o.id, o.type, o.status, o.reference, o.suppliername AS "supplierName",
                o.sourcewarehouseid AS "sourceWarehouseId", o.destinationwarehouseid AS "destinationWarehouseId",
                o.requestedby AS "requestedBy", o.createdat AS "createdAt", o.updatedat AS "updatedAt",
                ws.name AS "sourceWarehouseName",
                wd.name AS "destinationWarehouseName"
            FROM   "Operation" o
            LEFT JOIN "Warehouse" ws ON ws.id = o.sourcewarehouseid
            LEFT JOIN "Warehouse" wd ON wd.id = o.destinationwarehouseid
            {where}
            ORDER BY o.createdat DESC
            """,
            params,
        )
        ops = [dict(r) for r in cur.fetchall()]
        for op in ops:
            op["items"] = _fetch_items(cur, str(op["id"]))
    return ops


@router.post("", response_model=OperationOut, status_code=status.HTTP_201_CREATED)
def create_operation(body: OperationCreate, _user=Depends(get_current_user)):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO "Operation"
                (type, status, reference, suppliername,
                 sourcewarehouseid, destinationwarehouseid, requestedby)
            VALUES (%s, 'DRAFT', %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (
                body.type,
                body.reference,
                body.supplierName,
                body.sourceWarehouseId,
                body.destinationWarehouseId,
                body.requestedBy,
            ),
        )
        op_id = str(cur.fetchone()["id"])

        if body.items:
            psycopg2_values = [
                (op_id, item.productId, item.quantity) for item in body.items
            ]
            cur.executemany(
                'INSERT INTO "OperationItem" (operationid, productid, quantity) VALUES (%s, %s, %s)',
                psycopg2_values,
            )

        row = _fetch_operation(cur, op_id)
        items = _fetch_items(cur, op_id)

    result = dict(row)
    result["items"] = items
    return result


@router.get("/{operation_id}", response_model=OperationOut)
def get_operation(operation_id: str, _user=Depends(get_current_user)):
    with get_db() as conn:
        cur = conn.cursor()
        row = _fetch_operation(cur, operation_id)
        if not row:
            raise HTTPException(status_code=404, detail="Operation not found")
        result = dict(row)
        result["items"] = _fetch_items(cur, operation_id)
    return result


@router.patch("/{operation_id}/status", response_model=OperationOut)
def update_status(
    operation_id: str,
    body: OperationStatusUpdate,
    _user=Depends(get_current_user),
):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            UPDATE "Operation"
            SET status = %s::operation_status, updatedat = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING id
            """,
            (body.status, operation_id),
        )
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Operation not found")

        row = _fetch_operation(cur, operation_id)
        items = _fetch_items(cur, operation_id)

    result = dict(row)
    result["items"] = items
    return result


@router.post("/{operation_id}/validate", response_model=OperationOut)
def validate_receipt(
    operation_id: str,
    body: ValidateReceiptRequest,
    _user=Depends(require_manager),
):
    """
    Atomically validates a RECEIPT operation:
    1. Verifies type = RECEIPT and status != DONE/CANCELED.
    2. Inserts StockMovement IN rows for each line.
    3. Sets status = DONE.
    All inside one transaction — rolls back entirely on any error.
    """
    if not body.lines:
        raise HTTPException(status_code=400, detail="lines must not be empty")

    with get_db() as conn:
        cur = conn.cursor()

        # Lock and verify
        cur.execute(
            'SELECT type, status FROM "Operation" WHERE id = %s FOR UPDATE',
            (operation_id,),
        )
        op = cur.fetchone()
        if not op:
            raise HTTPException(status_code=404, detail="Operation not found")
        if op["type"] != "RECEIPT":
            raise HTTPException(status_code=400, detail=f"Operation type is {op['type']}, expected RECEIPT")
        if op["status"] in ("DONE", "CANCELED"):
            raise HTTPException(status_code=409, detail=f"Operation is already {op['status']}")

        # Insert stock movements
        for line in body.lines:
            if line.quantity <= 0:
                raise HTTPException(status_code=400, detail="quantity must be > 0")
            cur.execute(
                """
                INSERT INTO "StockMovement" (productid, warehouseid, quantity, type, operationid)
                VALUES (%s, %s, %s, 'IN', %s)
                """,
                (line.productId, line.warehouseId, line.quantity, operation_id),
            )

        # Mark done
        cur.execute(
            'UPDATE "Operation" SET status = \'DONE\', updatedat = CURRENT_TIMESTAMP WHERE id = %s',
            (operation_id,),
        )

        row = _fetch_operation(cur, operation_id)
        items = _fetch_items(cur, operation_id)

    result = dict(row)
    result["items"] = items
    return result
