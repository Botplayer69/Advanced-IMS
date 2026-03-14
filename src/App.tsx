import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { canAccessRoute, getDefaultRouteForRole, userRole } from "@/lib/rbac";
import { AppLayout } from "./components/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import DeliveryOrdersPage from "./pages/DeliveryOrdersPage";
import ReceiptsPage from "./pages/ReceiptsPage";
import AdjustmentsPage from "./pages/AdjustmentsPage";
import MoveHistoryPage from "./pages/MoveHistoryPage";
import SettingsPage from "./pages/SettingsPage";
import InternalTransfersPage from "./pages/InternalTransfersPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function withRoleAccess(path: string, element: JSX.Element) {
  // RBAC: Wrap each route element with role check (if role == manager vs if role == staff).
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
            <Route path="/products" element={withRoleAccess("/products", <ProductsPage />)} />
            <Route
              path="/operations/delivery-orders"
              element={withRoleAccess("/operations/delivery-orders", <DeliveryOrdersPage />)}
            />
            <Route
              path="/operations/receipts"
              element={withRoleAccess("/operations/receipts", <ReceiptsPage />)}
            />
            <Route
              path="/operations/adjustments"
              element={withRoleAccess("/operations/adjustments", <AdjustmentsPage />)}
            />
            <Route
              path="/operations/move-history"
              element={withRoleAccess("/operations/move-history", <MoveHistoryPage />)}
            />
            <Route
              path="/operations/internal-transfers"
              element={withRoleAccess("/operations/internal-transfers", <InternalTransfersPage />)}
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
