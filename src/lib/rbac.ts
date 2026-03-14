export type UserRole = "Inventory Manager" | "Warehouse Staff";

// Replace this with backend/session injected role during integration.
export const userRole: UserRole = "Inventory Manager";

const roleRouteAccess: Record<UserRole, string[]> = {
  "Inventory Manager": [
    "/",
    "/products",
    "/operations/receipts",
    "/operations/delivery-orders",
    "/operations/adjustments",
    "/operations/move-history",
    "/settings",
  ],
  "Warehouse Staff": [
    "/",
    "/operations/internal-transfers",
    "/operations/delivery-orders",
    "/operations/adjustments",
  ],
};

export function canAccessRoute(role: UserRole, routePath: string) {
  return roleRouteAccess[role].includes(routePath);
}

export function getDefaultRouteForRole(_role: UserRole) {
  return "/";
}
