import { apiFetch } from "@/lib/api/client";

export interface StockLevel {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  warehouseId?: string | null;
  warehouseName?: string | null;
}

/**
 * Calculates the real-time stock quantity for a single product
 * by calling the calculate_stock() PostgreSQL function.
 *
 * @param productId  The product UUID.
 * @param locationId Optional — scope to a specific warehouse/rack.
 *                   Omit for total stock across all locations.
 * @returns Current available quantity (can be 0; never below 0 by design).
 */
export async function calculateStock(
  productId: string,
  warehouseId?: string
): Promise<number> {
  const params = warehouseId ? `?warehouse_id=${warehouseId}` : "";
  const rows = await apiFetch<StockLevel[]>(`/api/stock/${productId}${params}`);
  return rows[0]?.quantity ?? 0;
}

/**
 * Returns a stock summary for ALL products by aggregating the
 * stock_moves ledger on the client side.
 *
 * @param locationId Optional — scope to a specific location.
 *
 * Note: For large datasets, replace this with a dedicated Postgres
 * view or RPC that returns pre-aggregated rows.
 */
export async function getStockSummary(
  warehouseId?: string
): Promise<StockLevel[]> {
  if (warehouseId) {
    return apiFetch<StockLevel[]>(`/api/stock/warehouse/${warehouseId}`);
  }
  return apiFetch<StockLevel[]>("/api/stock");
}
