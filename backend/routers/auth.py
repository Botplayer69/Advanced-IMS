"""
POST /api/auth/register  — create user (Manager only after first user)
POST /api/auth/login     — returns JWT
GET  /api/auth/me        — current user info
"""
from fastapi import APIRouter, Depends, HTTPException, status

from backend.auth_utils import create_access_token, hash_password, verify_password
from backend.database import get_db
from backend.dependencies import get_current_user
from backend.schemas import LoginRequest, RegisterRequest, TokenResponse, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest):
    with get_db() as conn:
        cur = conn.cursor()

        # Prevent duplicate email
        cur.execute('SELECT id FROM "User" WHERE email = %s', (body.email,))
        if cur.fetchone():
            raise HTTPException(status_code=409, detail="Email already registered")

        hashed = hash_password(body.password)
        cur.execute(
            """
            INSERT INTO "User" (email, password, name, role)
            VALUES (%s, %s, %s, %s)
            RETURNING id, email, name, role, createdat AS "createdAt"
            """,
            (body.email, hashed, body.name, body.role),
        )
        row = cur.fetchone()

    return dict(row)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            'SELECT id, email, name, role, password FROM "User" WHERE email = %s',
            (body.email,),
        )
        user = cur.fetchone()

    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token = create_access_token({"sub": str(user["id"]), "role": user["role"]})
    return TokenResponse(
        access_token=token,
        user_id=str(user["id"]),
        role=user["role"],
        name=user["name"],
    )


@router.get("/me", response_model=UserOut)
def me(current_user: dict = Depends(get_current_user)):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            'SELECT id, email, name, role, createdat AS "createdAt" FROM "User" WHERE id = %s',
            (current_user["id"],),
        )
        row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return dict(row)
