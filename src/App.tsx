import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { canAccessRoute, getDefaultRouteForRole, userRole } from "@/lib/rbac";
import { AppLayout } from "./components/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import ProductCreateUpdatePage from "./pages/ProductCreateUpdatePage";
import ProductAvailabilityPage from "./pages/ProductAvailabilityPage";
import ProductCategoriesPage from "./pages/ProductCategoriesPage";
import ReorderingRulesPage from "./pages/ReorderingRulesPage";
import DeliveryOrdersPage from "./pages/DeliveryOrdersPage";
import ReceiptsPage from "./pages/ReceiptsPage";
import StockReceipt from "./pages/StockReceipt";
import AdjustmentsPage from "./pages/AdjustmentsPage";
import MoveHistoryPage from "./pages/MoveHistoryPage";
import InternalTransfersPage from "./pages/InternalTransfersPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function withRoleAccess(path: string, element: JSX.Element) {
  // BACKEND_RBAC: if role has access to route, render page; else redirect.
  if (canAccessRoute(userRole, path)) {
    return element;
  }

  return <Navigate to={getDefaultRouteForRole(userRole)} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route
              path="/products/create-update"
              element={withRoleAccess("/products/create-update", <ProductCreateUpdatePage />)}
            />
            <Route
              path="/products/availability"
              element={withRoleAccess("/products/availability", <ProductAvailabilityPage />)}
            />
            <Route
              path="/products/categories"
              element={withRoleAccess("/products/categories", <ProductCategoriesPage />)}
            />
            <Route
              path="/products/reordering-rules"
              element={withRoleAccess("/products/reordering-rules", <ReorderingRulesPage />)}
            />
            <Route
              path="/operations/internal-transfers"
              element={withRoleAccess("/operations/internal-transfers", <InternalTransfersPage />)}
            />
            <Route
              path="/operations/delivery-orders"
              element={withRoleAccess("/operations/delivery-orders", <DeliveryOrdersPage />)}
            />
            <Route
              path="/operations/receipts"
              element={withRoleAccess("/operations/receipts", <ReceiptsPage />)}
            />
            <Route path="/operations/stock-receipt" element={<StockReceipt />} />
            <Route
              path="/operations/adjustments"
              element={withRoleAccess("/operations/adjustments", <AdjustmentsPage />)}
            />
            <Route
              path="/operations/move-history"
              element={withRoleAccess("/operations/move-history", <MoveHistoryPage />)}
            />
            <Route path="/settings" element={withRoleAccess("/settings", <SettingsPage />)} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
