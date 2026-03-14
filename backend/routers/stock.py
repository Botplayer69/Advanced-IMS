"""
GET /api/stock                           — aggregate stock per product (all warehouses)
GET /api/stock/{product_id}              — stock for one product, optional ?warehouse_id=
GET /api/stock/warehouse/{warehouse_id}  — all products at one warehouse
"""
from typing import Optional

from fastapi import APIRouter, Depends, Query

from backend.database import get_db
from backend.dependencies import get_current_user
from backend.schemas import StockLevelOut

router = APIRouter(prefix="/api/stock", tags=["stock"])


@router.get("", response_model=list[StockLevelOut])
def all_stock(_user=Depends(get_current_user)):
    """
    Returns current stock per product per warehouse, computed from
    StockMovement ledger + Product.initialStock.
    """
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT
                p.id                                          AS "productId",
                p.name                                        AS "productName",
                p.sku,
                NULL::uuid                                    AS "warehouseId",
                NULL::text                                    AS "warehouseName",
                COALESCE(p.initialstock, 0) + COALESCE(
                    SUM(CASE WHEN sm.type = 'IN'  THEN sm.quantity
                             WHEN sm.type = 'OUT' THEN -sm.quantity
                             ELSE 0 END), 0
                )                                             AS quantity
            FROM "Product" p
            LEFT JOIN "StockMovement" sm ON sm.productid = p.id
            GROUP BY p.id, p.name, p.sku, p.initialstock
            ORDER BY p.name
            """
        )
        return [dict(r) for r in cur.fetchall()]


@router.get("/warehouse/{warehouse_id}", response_model=list[StockLevelOut])
def stock_at_warehouse(warehouse_id: str, _user=Depends(get_current_user)):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT
                p.id    AS "productId",
                p.name  AS "productName",
                p.sku,
                w.id    AS "warehouseId",
                w.name  AS "warehouseName",
                COALESCE(SUM(
                    CASE WHEN sm.type = 'IN'  THEN sm.quantity
                         WHEN sm.type = 'OUT' THEN -sm.quantity
                         ELSE 0 END
                ), 0)   AS quantity
            FROM "Product" p
            CROSS JOIN "Warehouse" w
            LEFT JOIN "StockMovement" sm
                 ON sm.productid    = p.id
                AND sm.warehouseid  = w.id
            WHERE w.id = %s
            GROUP BY p.id, p.name, p.sku, w.id, w.name
            ORDER BY p.name
            """,
            (warehouse_id,),
        )
        return [dict(r) for r in cur.fetchall()]


@router.get("/{product_id}", response_model=list[StockLevelOut])
def product_stock(
    product_id: str,
    warehouse_id: Optional[str] = Query(None),
    _user=Depends(get_current_user),
):
    with get_db() as conn:
        cur = conn.cursor()
        if warehouse_id:
            cur.execute(
                """
                SELECT
                    p.id   AS "productId",
                    p.name AS "productName",
                    p.sku,
                    w.id   AS "warehouseId",
                    w.name AS "warehouseName",
                    COALESCE(p.initialstock, 0) + COALESCE(SUM(
                        CASE WHEN sm.type='IN'  THEN sm.quantity
                             WHEN sm.type='OUT' THEN -sm.quantity ELSE 0 END
                    ), 0) AS quantity
                FROM "Product" p
                JOIN "Warehouse" w ON w.id = %s
                LEFT JOIN "StockMovement" sm ON sm.productid = p.id AND sm.warehouseid = w.id
                WHERE p.id = %s
                GROUP BY p.id, p.name, p.sku, p.initialstock, w.id, w.name
                """,
                (warehouse_id, product_id),
            )
        else:
            cur.execute(
                """
                SELECT
                    p.id   AS "productId",
                    p.name AS "productName",
                    p.sku,
                    NULL::uuid AS "warehouseId",
                    NULL::text AS "warehouseName",
                    COALESCE(p.initialstock, 0) + COALESCE(SUM(
                        CASE WHEN sm.type='IN'  THEN sm.quantity
                             WHEN sm.type='OUT' THEN -sm.quantity ELSE 0 END
                    ), 0) AS quantity
                FROM "Product" p
                LEFT JOIN "StockMovement" sm ON sm.productid = p.id
                WHERE p.id = %s
                GROUP BY p.id, p.name, p.sku, p.initialstock
                """,
                (product_id,),
            )
        return [dict(r) for r in cur.fetchall()]
