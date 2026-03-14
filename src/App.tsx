import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { canAccessRoute, getDefaultRouteForRole } from "@/lib/rbac";
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
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function RoleRoute({ path, element }: { path: string; element: JSX.Element }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (canAccessRoute(user.role, path)) {
    return element;
  }

  return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={getDefaultRouteForRole(user.role)} replace /> : <LoginPage />}
      />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route
          path="/products/create-update"
          element={<RoleRoute path="/products/create-update" element={<ProductCreateUpdatePage />} />}
        />
        <Route
          path="/products/availability"
          element={<RoleRoute path="/products/availability" element={<ProductAvailabilityPage />} />}
        />
        <Route
          path="/products/categories"
          element={<RoleRoute path="/products/categories" element={<ProductCategoriesPage />} />}
        />
        <Route
          path="/products/reordering-rules"
          element={<RoleRoute path="/products/reordering-rules" element={<ReorderingRulesPage />} />}
        />
        <Route
          path="/operations/internal-transfers"
          element={<RoleRoute path="/operations/internal-transfers" element={<InternalTransfersPage />} />}
        />
        <Route
          path="/operations/delivery-orders"
          element={<RoleRoute path="/operations/delivery-orders" element={<DeliveryOrdersPage />} />}
        />
        <Route
          path="/operations/receipts"
          element={<RoleRoute path="/operations/receipts" element={<ReceiptsPage />} />}
        />
        <Route
          path="/operations/stock-receipt"
          element={<RoleRoute path="/operations/stock-receipt" element={<StockReceipt />} />}
        />
        <Route
          path="/operations/adjustments"
          element={<RoleRoute path="/operations/adjustments" element={<AdjustmentsPage />} />}
        />
        <Route
          path="/operations/move-history"
          element={<RoleRoute path="/operations/move-history" element={<MoveHistoryPage />} />}
        />
        <Route path="/settings" element={<RoleRoute path="/settings" element={<SettingsPage />} />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
