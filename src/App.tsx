import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "./components/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import DeliveryOrdersPage from "./pages/DeliveryOrdersPage";
import ReceiptsPage from "./pages/ReceiptsPage";
import StockReceipt from "./pages/StockReceipt";
import AdjustmentsPage from "./pages/AdjustmentsPage";
import MoveHistoryPage from "./pages/MoveHistoryPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/operations" element={<StockReceipt />} />
            <Route path="/operations/delivery-orders" element={<DeliveryOrdersPage />} />
            <Route path="/operations/receipts" element={<ReceiptsPage />} />
            <Route path="/operations/stock-receipt" element={<StockReceipt />} />
            <Route path="/operations/adjustments" element={<AdjustmentsPage />} />
            <Route path="/operations/move-history" element={<MoveHistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
