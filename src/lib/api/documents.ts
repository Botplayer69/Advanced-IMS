import { apiFetch } from "@/lib/api/client";
import type {
  OperationRow,
  OperationStatus,
  OperationType,
  ReceiptStockLine,
} from "@/lib/database.types";

export interface OperationWithWarehouses extends OperationRow {
  sourceWarehouseName?: string | null;
  destinationWarehouseName?: string | null;
  items?: Array<{ id: string; productId: string; quantity: number; productName?: string; productSku?: string }>;
}

// ── Read ──────────────────────────────────────────────────────

export async function getDocuments(filters?: {
  type?: OperationType;
  status?: OperationStatus;
  requestedBy?: string;
}): Promise<OperationWithWarehouses[]> {
  const params = new URLSearchParams();
  if (filters?.type)        params.set("type",          filters.type);
  if (filters?.status)      params.set("status",        filters.status);
  if (filters?.requestedBy) params.set("requested_by",  filters.requestedBy);
  const qs = params.toString();

  return apiFetch<OperationWithWarehouses[]>(`/api/operations${qs ? `?${qs}` : ""}`);
}

export async function getOperation(operationId: string): Promise<OperationWithWarehouses> {
  return apiFetch<OperationWithWarehouses>(`/api/operations/${operationId}`);
}

// ── Write ─────────────────────────────────────────────────────

export async function createDocument(
  type: OperationType,
  requestedBy?: string,
  sourceWarehouseId?: string,
  destinationWarehouseId?: string,
  supplierName?: string,
  items: Array<{ productId: string; quantity: number }> = []
): Promise<OperationWithWarehouses> {
  return apiFetch<OperationWithWarehouses>("/api/operations", {
    method: "POST",
    body: JSON.stringify({
      type,
      requestedBy:            requestedBy            ?? null,
      sourceWarehouseId:      sourceWarehouseId      ?? null,
      destinationWarehouseId: destinationWarehouseId ?? null,
      supplierName:           supplierName           ?? null,
      items,
    }),
  });
}

export async function updateDocumentStatus(
  documentId: string,
  status: OperationStatus
): Promise<OperationWithWarehouses> {
  return apiFetch<OperationWithWarehouses>(`/api/operations/${documentId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ── Validate Receipt (atomic transaction) ────────────────────────────────────

export async function validateReceipt(
  documentId: string,
  lines: ReceiptStockLine[]
): Promise<void> {
  if (lines.length === 0) {
    throw new Error("Cannot validate a receipt with no product lines.");
  }
  await apiFetch(`/api/operations/${documentId}/validate`, {
    method: "POST",
    body: JSON.stringify({ lines }),
  });
}

// ── Convenience helper ────────────────────────────────────────────────────────

/** Adds items to an existing operation (separate call if needed). */
export async function addOperationItems(
  _operationId: string,
  _items: Array<{ productId: string; quantity: number }>
) {
  // Items are now included at creation time via createDocument() items[].
  // This function is kept for backward-compat; use createDocument() instead.
  throw new Error("Pass items directly to createDocument() instead.");
}
