"""
GET    /api/products              — list (optional ?category_id=&warehouse_id=)
POST   /api/products              — create (Manager)
GET    /api/products/{id}         — single with live stock
PUT    /api/products/{id}         — update (Manager)
DELETE /api/products/{id}         — delete (Manager)
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from backend.database import get_db
from backend.dependencies import get_current_user, require_manager
from backend.schemas import ProductCreate, ProductOut, ProductUpdate

router = APIRouter(prefix="/api/products", tags=["products"])


def _row_to_product(row) -> dict:
    d = dict(row)
    d.setdefault("categoryName", None)
    return d


@router.get("", response_model=list[ProductOut])
def list_products(
    category_id: Optional[str] = Query(None),
    _user=Depends(get_current_user),
):
    with get_db() as conn:
        cur = conn.cursor()
        if category_id:
            cur.execute(
                """
                SELECT p.id, p.sku, p.name, p.categoryid AS "categoryId", p.uom, p.initialstock AS "initialStock", p.createdat AS "createdAt",
                       c.name AS "categoryName"
                FROM   "Product" p
                LEFT JOIN "Category" c ON c.id = p.categoryid
                WHERE  p.categoryid = %s
                ORDER BY p.name
                """,
                (category_id,),
            )
        else:
            cur.execute(
                """
                SELECT p.id, p.sku, p.name, p.categoryid AS "categoryId", p.uom, p.initialstock AS "initialStock", p.createdat AS "createdAt",
                       c.name AS "categoryName"
                FROM   "Product" p
                LEFT JOIN "Category" c ON c.id = p.categoryid
                ORDER BY p.name
                """
            )
        return [_row_to_product(r) for r in cur.fetchall()]


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(body: ProductCreate, _user=Depends(require_manager)):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute('SELECT id FROM "Product" WHERE sku = %s', (body.sku,))
        if cur.fetchone():
            raise HTTPException(status_code=409, detail="SKU already exists")

        cur.execute(
            """
            INSERT INTO "Product" (sku, name, categoryid, uom, initialstock)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, sku, name, categoryid AS "categoryId", uom, initialstock AS "initialStock", createdat AS "createdAt"
            """,
            (body.sku, body.name, body.categoryId, body.uom, body.initialStock),
        )
        row = dict(cur.fetchone())

        cur.execute('SELECT name FROM "Category" WHERE id = %s', (body.categoryId,))
        cat = cur.fetchone()
        row["categoryName"] = cat["name"] if cat else None

    return row


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: str, _user=Depends(get_current_user)):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT p.id, p.sku, p.name, p.categoryid AS "categoryId", p.uom, p.initialstock AS "initialStock", p.createdat AS "createdAt",
                   c.name AS "categoryName"
            FROM   "Product" p
            LEFT JOIN "Category" c ON c.id = p.categoryid
            WHERE  p.id = %s
            """,
            (product_id,),
        )
        row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")
    return _row_to_product(row)


@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: str, body: ProductUpdate, _user=Depends(require_manager)):
    fields = {k: v for k, v in body.model_dump(exclude_unset=True).items() if v is not None}
    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Map Python camelCase keys to quoted SQL column names
    col_map = {
        "name": "name",
        "categoryId": "categoryid",
        "uom": "uom",
        "initialStock": "initialstock",
    }
    set_clauses = ", ".join(f'{col_map[k]} = %s' for k in fields)
    values = list(fields.values()) + [product_id]

    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            f'UPDATE "Product" SET {set_clauses}, updatedat=CURRENT_TIMESTAMP WHERE id = %s RETURNING id',
            values,
        )
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Product not found")

    return get_product(product_id, _user)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: str, _user=Depends(require_manager)):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute('DELETE FROM "Product" WHERE id = %s RETURNING id', (product_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Product not found")
