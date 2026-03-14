"""
FastAPI entry point.
Run with: uvicorn backend.main:app --reload --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from psycopg2 import OperationalError

from backend.config import settings
from backend.database import get_db
from backend.routers import auth, categories, dashboard, operations, products, stock, warehouses

app = FastAPI(
    title="Advanced IMS API",
    version="1.0.0",
    description="Inventory Management System — FastAPI + Supabase Postgres backend",
)

allowed_origins = {
    settings.FRONTEND_ORIGIN,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
}

# CORS: allow the Vite dev server (and production origin) to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(warehouses.router)
app.include_router(products.router)
app.include_router(operations.router)
app.include_router(stock.router)
app.include_router(dashboard.router)


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok"}


@app.get("/health/db", tags=["meta"])
def health_db():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT 1 AS ok")
        row = cur.fetchone()
    return {"status": "ok", "db": row["ok"] == 1}


@app.exception_handler(OperationalError)
async def db_operational_error_handler(_request, _exc: OperationalError):
    return JSONResponse(
        status_code=503,
        content={
            "detail": (
                "Database connection failed. Update backend/.env DATABASE_URL to a valid Supabase "
                "Transaction Pooler URL (port 6543) with your real password."
            )
        },
    )
