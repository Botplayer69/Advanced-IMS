// ============================================================
// TypeScript types for the current IMS Supabase schema.
// Mirrors quoted table names exactly: "User", "Product", etc.
// ============================================================

export type Role = "MANAGER" | "WAREHOUSE_STAFF";
export type OperationType = "RECEIPT" | "DELIVERY" | "TRANSFER" | "ADJUSTMENT";
export type OperationStatus = "DRAFT" | "WAITING" | "READY" | "DONE" | "CANCELED";
export type MovementType = "IN" | "OUT";

export interface UserRow {
  id: string;
  email: string;
  password: string;
  name: string | null;
  role: Role;
  otp: string | null;
  otpExpiry: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseRow {
  id: string;
  name: string;
  location: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRow {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  uom: string;
  initialStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface OperationRow {
  id: string;
  type: OperationType;
  status: OperationStatus;
  reference: string | null;
  supplierName: string | null;
  sourceWarehouseId: string | null;
  destinationWarehouseId: string | null;
  requestedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OperationItemRow {
  id: string;
  operationId: string;
  productId: string;
  quantity: number;
}

export interface StockMovementRow {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  type: MovementType;
  operationId: string | null;
  createdAt: string;
}

export interface ReceiptStockLine {
  productId: string;
  warehouseId: string;
  quantity: number;
}

export interface Database {
  public: {
    Tables: {
      User: {
        Row: UserRow;
        Insert: Omit<UserRow, "id" | "createdAt" | "updatedAt"> & { role?: Role };
        Update: Partial<Omit<UserRow, "id" | "createdAt">>;
      };
      Category: {
        Row: CategoryRow;
        Insert: Omit<CategoryRow, "id" | "createdAt" | "updatedAt">;
        Update: Partial<Omit<CategoryRow, "id" | "createdAt">>;
      };
      Warehouse: {
        Row: WarehouseRow;
        Insert: Omit<WarehouseRow, "id" | "createdAt" | "updatedAt">;
        Update: Partial<Omit<WarehouseRow, "id" | "createdAt">>;
      };
      Product: {
        Row: ProductRow;
        Insert: Omit<ProductRow, "id" | "createdAt" | "updatedAt"> & { initialStock?: number };
        Update: Partial<Omit<ProductRow, "id" | "createdAt">>;
      };
      Operation: {
        Row: OperationRow;
        Insert: Omit<OperationRow, "id" | "createdAt" | "updatedAt"> & { status?: OperationStatus };
        Update: Partial<Omit<OperationRow, "id" | "createdAt">>;
      };
      OperationItem: {
        Row: OperationItemRow;
        Insert: Omit<OperationItemRow, "id">;
        Update: Partial<Omit<OperationItemRow, "id">>;
      };
      StockMovement: {
        Row: StockMovementRow;
        Insert: Omit<StockMovementRow, "id" | "createdAt" | "operationId"> & { operationId?: string | null };
        Update: never;
      };
    };
    Functions: {
      calculate_current_stock: {
        Args: { p_product_id: string; p_warehouse_id?: string | null };
        Returns: number;
      };
      validate_receipt: {
        Args: { p_operation_id: string; p_lines: ReceiptStockLine[] };
        Returns: void;
      };
    };
  };
}
