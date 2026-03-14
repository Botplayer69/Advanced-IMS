"""
GET /api/dashboard/kpis    — KPI card counts (filterable)
GET /api/dashboard/data    — KPIs + pending operations list
"""
from typing import Optional

from fastapi import APIRouter, Depends, Query

from backend.database import get_db
from backend.dependencies import get_current_user
from backend.schemas import DashboardKpis, OperationOut

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

LOW_STOCK_THRESHOLD = 10  # products with total stock <= this are "low stock"


@router.get("/kpis", response_model=DashboardKpis)
def dashboard_kpis(
    warehouse_id: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    _user=Depends(get_current_user),
):
    with get_db() as conn:
        cur = conn.cursor()

        # Total products
        if category_id:
            cur.execute('SELECT COUNT(*) FROM "Product" WHERE categoryid = %s', (category_id,))
        else:
            cur.execute('SELECT COUNT(*) FROM "Product"')
        total_products = cur.fetchone()["count"]

        # Waiting / Ready operations
        wh_filter = ""
        wh_params: list = []
        if warehouse_id:
            wh_filter = '(sourcewarehouseid = %s OR destinationwarehouseid = %s)'
            wh_params = [warehouse_id, warehouse_id]

        def count_ops(op_status: str) -> int:
            parts = [f"status = %s::operation_status"]
            params_inner = [op_status] + wh_params
            if wh_filter:
                parts.append(wh_filter)
            cur.execute(
                f'SELECT COUNT(*) FROM "Operation" WHERE {" AND ".join(parts)}',
                params_inner,
            )
            return cur.fetchone()["count"]

        waiting = count_ops("WAITING")
        ready   = count_ops("READY")

        # Low stock
        cur.execute(
            """
            SELECT COUNT(*) FROM (
                SELECT p.id,
                    COALESCE(p.initialstock, 0) + COALESCE(SUM(
                        CASE WHEN sm.type='IN'  THEN sm.quantity
                             WHEN sm.type='OUT' THEN -sm.quantity ELSE 0 END
                    ), 0) AS total_stock
                FROM "Product" p
                LEFT JOIN "StockMovement" sm ON sm.productid = p.id AND (%s IS NULL OR sm.warehouseid = %s)
                GROUP BY p.id, p.initialstock
                HAVING COALESCE(p.initialstock, 0) + COALESCE(SUM(
                    CASE WHEN sm.type='IN'  THEN sm.quantity
                         WHEN sm.type='OUT' THEN -sm.quantity ELSE 0 END
                ), 0) <= %s
            ) sub
            """,
            (warehouse_id, warehouse_id, LOW_STOCK_THRESHOLD),
        )
        low_stock = cur.fetchone()["count"]

    return DashboardKpis(
        totalProducts=total_products,
        waitingOperations=waiting,
        readyOperations=ready,
        lowStockProducts=low_stock,
    )


@router.get("/data", response_model=dict)
def dashboard_data(
    warehouse_id: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    _user=Depends(get_current_user),
):
    kpis = dashboard_kpis(warehouse_id=warehouse_id, category_id=category_id, _user=_user)

    with get_db() as conn:
        cur = conn.cursor()
        params: list = []
        clauses = ['o.status IN (\'WAITING\', \'READY\')']
        if warehouse_id:
            clauses.append('(o.sourcewarehouseid = %s OR o.destinationwarehouseid = %s)')
            params.extend([warehouse_id, warehouse_id])

        where = "WHERE " + " AND ".join(clauses)
        cur.execute(
            f"""
            SELECT
                o.id, o.type, o.status, o.reference, o.suppliername AS "supplierName",
                o.sourcewarehouseid AS "sourceWarehouseId", o.destinationwarehouseid AS "destinationWarehouseId",
                o.requestedby AS "requestedBy", o.createdat AS "createdAt", o.updatedat AS "updatedAt",
                ws.name AS "sourceWarehouseName",
                wd.name AS "destinationWarehouseName"
            FROM "Operation" o
            LEFT JOIN "Warehouse" ws ON ws.id = o.sourcewarehouseid
            LEFT JOIN "Warehouse" wd ON wd.id = o.destinationwarehouseid
            {where}
            ORDER BY o.createdat DESC
            LIMIT 50
            """,
            params,
        )
        ops = []
        for row in cur.fetchall():
            op = dict(row)
            cur2 = conn.cursor()
            cur2.execute(
                """
                  SELECT oi.id, oi.productid AS "productId", oi.quantity,
                       p.name AS "productName", p.sku AS "productSku"
                FROM   "OperationItem" oi
                  JOIN   "Product" p ON p.id = oi.productid
                  WHERE  oi.operationid = %s
                """,
                (str(op["id"]),),
            )
            op["items"] = [dict(r) for r in cur2.fetchall()]
            ops.append(op)

    return {"kpis": kpis.model_dump(), "pendingOperations": ops}
