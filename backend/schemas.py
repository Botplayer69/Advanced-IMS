"""
Pydantic schemas — request bodies and response shapes.
These mirror the Supabase tables exactly (camelCase field names match DB columns).
"""
from __future__ import annotations
from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, UUID4


# ── Enums (as Literal types so OpenAPI docs show allowed values) ──────────────
Role            = Literal["MANAGER", "WAREHOUSE_STAFF"]
OperationType   = Literal["RECEIPT", "DELIVERY", "TRANSFER", "ADJUSTMENT"]
OperationStatus = Literal["DRAFT", "WAITING", "READY", "DONE", "CANCELED"]
MovementType    = Literal["IN", "OUT"]


# ── Auth ──────────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None
    role: Role = "WAREHOUSE_STAFF"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: Role
    name: Optional[str]


# ── User ──────────────────────────────────────────────────────────────────────
class UserOut(BaseModel):
    id: str
    email: str
    name: Optional[str]
    role: Role
    createdAt: datetime


# ── Category ──────────────────────────────────────────────────────────────────
class CategoryCreate(BaseModel):
    name: str


class CategoryOut(BaseModel):
    id: str
    name: str
    createdAt: datetime


# ── Warehouse ─────────────────────────────────────────────────────────────────
class WarehouseCreate(BaseModel):
    name: str
    location: Optional[str] = None


class WarehouseOut(BaseModel):
    id: str
    name: str
    location: Optional[str]
    createdAt: datetime


# ── Product ───────────────────────────────────────────────────────────────────
class ProductCreate(BaseModel):
    sku: str
    name: str
    categoryId: str
    uom: str
    initialStock: float = 0.0


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    categoryId: Optional[str] = None
    uom: Optional[str] = None
    initialStock: Optional[float] = None


class ProductOut(BaseModel):
    id: str
    sku: str
    name: str
    categoryId: str
    uom: str
    initialStock: float
    createdAt: datetime
    # Joined from Category
    categoryName: Optional[str] = None


# ── Operation ─────────────────────────────────────────────────────────────────
class OperationItemIn(BaseModel):
    productId: str
    quantity: float


class OperationCreate(BaseModel):
    type: OperationType
    reference: Optional[str] = None
    supplierName: Optional[str] = None
    sourceWarehouseId: Optional[str] = None
    destinationWarehouseId: Optional[str] = None
    requestedBy: Optional[str] = None
    items: list[OperationItemIn] = []


class OperationStatusUpdate(BaseModel):
    status: OperationStatus


class OperationItemOut(BaseModel):
    id: str
    productId: str
    quantity: float
    productName: Optional[str] = None
    productSku: Optional[str] = None


class OperationOut(BaseModel):
    id: str
    type: OperationType
    status: OperationStatus
    reference: Optional[str]
    supplierName: Optional[str]
    sourceWarehouseId: Optional[str]
    destinationWarehouseId: Optional[str]
    requestedBy: Optional[str]
    createdAt: datetime
    updatedAt: datetime
    sourceWarehouseName: Optional[str] = None
    destinationWarehouseName: Optional[str] = None
    items: list[OperationItemOut] = []


# ── Receipt validation ────────────────────────────────────────────────────────
class ReceiptLine(BaseModel):
    productId: str
    warehouseId: str
    quantity: float


class ValidateReceiptRequest(BaseModel):
    lines: list[ReceiptLine]


# ── Stock ─────────────────────────────────────────────────────────────────────
class StockLevelOut(BaseModel):
    productId: str
    productName: str
    sku: str
    warehouseId: Optional[str]
    warehouseName: Optional[str]
    quantity: float


# ── Dashboard ─────────────────────────────────────────────────────────────────
class DashboardKpis(BaseModel):
    totalProducts: int
    waitingOperations: int
    readyOperations: int
    lowStockProducts: int
