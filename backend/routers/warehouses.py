"""
GET    /api/warehouses          — list all
POST   /api/warehouses          — create (Manager)
GET    /api/warehouses/{id}     — single
PUT    /api/warehouses/{id}     — update (Manager)
DELETE /api/warehouses/{id}     — delete (Manager)
"""
from fastapi import APIRouter, Depends, HTTPException, status

from backend.database import get_db
from backend.dependencies import get_current_user, require_manager
from backend.schemas import WarehouseCreate, WarehouseOut

router = APIRouter(prefix="/api/warehouses", tags=["warehouses"])


@router.get("", response_model=list[WarehouseOut])
def list_warehouses(_user=Depends(get_current_user)):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute('SELECT id, name, location, createdat AS "createdAt" FROM "Warehouse" ORDER BY name')
        return [dict(r) for r in cur.fetchall()]


@router.post("", response_model=WarehouseOut, status_code=status.HTTP_201_CREATED)
def create_warehouse(body: WarehouseCreate, _user=Depends(require_manager)):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            'SELECT id FROM "Warehouse" WHERE name = %s', (body.name,)
        )
        if cur.fetchone():
            raise HTTPException(status_code=409, detail="Warehouse name already exists")

        cur.execute(
            'INSERT INTO "Warehouse" (name, location) VALUES (%s, %s) RETURNING id, name, location, createdat AS "createdAt"',
            (body.name, body.location),
        )
        return dict(cur.fetchone())


@router.get("/{warehouse_id}", response_model=WarehouseOut)
def get_warehouse(warehouse_id: str, _user=Depends(get_current_user)):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            'SELECT id, name, location, createdat AS "createdAt" FROM "Warehouse" WHERE id = %s',
            (warehouse_id,),
        )
        row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return dict(row)


@router.put("/{warehouse_id}", response_model=WarehouseOut)
def update_warehouse(warehouse_id: str, body: WarehouseCreate, _user=Depends(require_manager)):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            'UPDATE "Warehouse" SET name=%s, location=%s, updatedat=CURRENT_TIMESTAMP WHERE id=%s RETURNING id, name, location, createdat AS "createdAt"',
            (body.name, body.location, warehouse_id),
        )
        row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return dict(row)


@router.delete("/{warehouse_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_warehouse(warehouse_id: str, _user=Depends(require_manager)):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute('DELETE FROM "Warehouse" WHERE id = %s RETURNING id', (warehouse_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Warehouse not found")
