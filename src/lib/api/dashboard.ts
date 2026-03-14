import { apiFetch } from "@/lib/api/client";
import type { OperationRow } from "@/lib/database.types";

export interface DashboardFilters {
  /** Warehouse UUID filter */
  warehouseId?: string;
  /** Category UUID filter */
  categoryId?: string;
}

export interface DashboardData {
  /** Count of distinct products matching the optional category filter. */
  totalDistinctProducts: number;
  /** Pending operations, newest first. */
  pendingOperations: OperationRow[];
}

export async function fetchDashboardData(
  filters: DashboardFilters = {}
): Promise<DashboardData> {
  const params = new URLSearchParams();
  if (filters.warehouseId) params.set("warehouse_id", filters.warehouseId);
  if (filters.categoryId)  params.set("category_id",  filters.categoryId);

  const data = await apiFetch<{ kpis: { totalProducts: number }; pendingOperations: OperationRow[] }>(
    `/api/dashboard/data?${params}`
  );

  return {
    totalDistinctProducts: data.kpis.totalProducts,
    pendingOperations:     data.pendingOperations,
  };
}

/**
 * Lightweight version: returns just the KPI counts for dashboard cards.
 * Runs all queries in parallel — call this for fast card rendering.
 */
export async function fetchDashboardKpis(filters: DashboardFilters = {}) {
  const params = new URLSearchParams();
  if (filters.warehouseId) params.set("warehouse_id", filters.warehouseId);
  if (filters.categoryId)  params.set("category_id",  filters.categoryId);

  return apiFetch<{ totalProducts: number; waitingOperations: number; readyOperations: number; lowStockProducts: number }>(
    `/api/dashboard/kpis?${params}`
  );
}
