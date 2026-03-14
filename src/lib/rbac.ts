export type UserRole = "Inventory Manager" | "Warehouse Staff";

// Replace this with backend/session injected role during integration.
export const userRole: UserRole = "Inventory Manager";

const roleRouteAccess: Record<UserRole, string[]> = {
  "Inventory Manager": [
    "/",
    "/products",
    "/products/create-update",
    "/products/availability",
    "/products/categories",
    "/products/reordering-rules",
    "/operations/receipts",
    "/operations/delivery-orders",
    "/operations/adjustments",
    "/operations/move-history",
    "/operations/internal-transfers",
    "/settings",
  ],
  "Warehouse Staff": [
    "/",
    "/products/availability",
    "/products/categories",
    "/products/reordering-rules",
    "/operations/receipts",
    "/operations/delivery-orders",
    "/operations/adjustments",
    "/operations/internal-transfers",
  ],
};

export function canAccessRoute(role: UserRole, routePath: string) {
  return roleRouteAccess[role].includes(routePath);
}

export function getDefaultRouteForRole(_role: UserRole) {
  return "/";
}
