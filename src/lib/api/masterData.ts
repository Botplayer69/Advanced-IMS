import { apiFetch } from "@/lib/api/client";

export interface CategoryDto {
  id: string;
  name: string;
  createdAt?: string;
}

export interface CreateCategoryInput {
  name: string;
}

export interface WarehouseDto {
  id: string;
  name: string;
  location?: string | null;
}

export interface ProductDto {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  categoryName?: string | null;
  uom: string;
  initialStock: number;
}

export interface CreateProductInput {
  sku: string;
  name: string;
  categoryId: string;
  uom: string;
  initialStock?: number;
}

export async function getCategories() {
  return apiFetch<CategoryDto[]>("/api/categories");
}

export async function createCategory(input: CreateCategoryInput) {
  return apiFetch<CategoryDto>("/api/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCategory(categoryId: string, input: CreateCategoryInput) {
  return apiFetch<CategoryDto>(`/api/categories/${categoryId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteCategory(categoryId: string) {
  return apiFetch<void>(`/api/categories/${categoryId}`, {
    method: "DELETE",
  });
}

export async function getWarehouses() {
  return apiFetch<WarehouseDto[]>("/api/warehouses");
}

export async function getProducts(categoryId?: string) {
  const params = new URLSearchParams();
  if (categoryId) params.set("category_id", categoryId);
  const qs = params.toString();
  return apiFetch<ProductDto[]>(`/api/products${qs ? `?${qs}` : ""}`);
}

export async function createProduct(input: CreateProductInput) {
  return apiFetch<ProductDto>("/api/products", {
    method: "POST",
    body: JSON.stringify({
      ...input,
      initialStock: input.initialStock ?? 0,
    }),
  });
}

export async function updateProduct(productId: string, patch: Partial<CreateProductInput>) {
  return apiFetch<ProductDto>(`/api/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
}

export async function deleteProduct(productId: string) {
  return apiFetch<void>(`/api/products/${productId}`, {
    method: "DELETE",
  });
}
