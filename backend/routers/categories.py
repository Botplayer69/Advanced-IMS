"""
GET    /api/categories       — list all
POST   /api/categories       — create (Manager)
PUT    /api/categories/{id}  — update (Manager)
DELETE /api/categories/{id}  — delete (Manager)
"""
from fastapi import APIRouter, Depends, HTTPException, status

from backend.database import get_db
from backend.dependencies import get_current_user, require_manager
from backend.schemas import CategoryCreate, CategoryOut

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=list[CategoryOut])
def list_categories(_user=Depends(get_current_user)):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute('SELECT id, name, createdat AS "createdAt" FROM "Category" ORDER BY name')
        return [dict(r) for r in cur.fetchall()]


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(body: CategoryCreate, _user=Depends(require_manager)):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute('SELECT id FROM "Category" WHERE name = %s', (body.name,))
        if cur.fetchone():
            raise HTTPException(status_code=409, detail="Category already exists")
        cur.execute(
            'INSERT INTO "Category" (name) VALUES (%s) RETURNING id, name, createdat AS "createdAt"',
            (body.name,),
        )
        return dict(cur.fetchone())


@router.put("/{category_id}", response_model=CategoryOut)
def update_category(category_id: str, body: CategoryCreate, _user=Depends(require_manager)):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute('SELECT id FROM "Category" WHERE name = %s AND id <> %s', (body.name, category_id))
        if cur.fetchone():
            raise HTTPException(status_code=409, detail="Category already exists")

        cur.execute(
            'UPDATE "Category" SET name = %s, updatedat = CURRENT_TIMESTAMP WHERE id = %s RETURNING id, name, createdat AS "createdAt"',
            (body.name, category_id),
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Category not found")
        return dict(row)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: str, _user=Depends(require_manager)):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute('DELETE FROM "Category" WHERE id = %s RETURNING id', (category_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Category not found")
