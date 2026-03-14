import {
  AlertTriangle,
  ArrowDown,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUp,
  ClipboardCheck,
  ClipboardList,
  History,
  Package,
  Truck,
  Warehouse,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const managerKpiData = [
  {
    label: "Total Products",
    value: "1,847",
    change: "+12",
    trend: "up" as const,
    icon: Package,
    accent: "primary",
    url: "/products/availability",
  },
  {
    label: "Low / Out of Stock",
    value: "23",
    change: "+3",
    trend: "up" as const,
    icon: AlertTriangle,
    accent: "destructive",
    url: "/products/reordering-rules",
  },
  {
    label: "Pending Receipts",
    value: "14",
    change: "-2",
    trend: "down" as const,
    icon: ClipboardList,
    accent: "warning",
    url: "/operations/receipts",
  },
  {
    label: "Pending Deliveries",
    value: "31",
    change: "+5",
    trend: "up" as const,
    icon: Truck,
    accent: "primary",
    url: "/operations/delivery-orders",
  },
];

const staffKpiData = [
  {
    label: "My Pending Picks",
    value: "18",
    icon: Truck,
    accent: "primary",
    url: "/operations/delivery-orders",
  },
  {
    label: "Pending Putaways",
    value: "11",
    icon: Warehouse,
    accent: "warning",
    url: "/operations/receipts",
  },
  {
    label: "Internal Transfers",
    value: "7",
    icon: ArrowLeftRight,
    accent: "primary",
    url: "/operations/internal-transfers",
  },
  {
    label: "Items to Count",
    value: "23",
    icon: ClipboardCheck,
    accent: "destructive",
    url: "/operations/adjustments",
  },
];

const managerQuickActions = [
  {
    title: "Stock Receipt",
    desc: "Process incoming goods",
    icon: ArrowDownLeft,
    url: "/operations/stock-receipt",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    title: "Inventory Adjustment",
    desc: "Correct stock levels",
    icon: ArrowLeftRight,
    url: "/operations/adjustments",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "Move History",
    desc: "View movement ledger",
    icon: History,
    url: "/operations/move-history",
    color: "text-warning",
    bg: "bg-warning/10",
  },
];

const managerRecentActivity = [
  { id: "WH/IN/04521", type: "Receipt", product: "Servo Motor A12", qty: 50, status: "Validated", time: "12 min ago", warehouse: "wh-a", category: "motors" },
  { id: "WH/OUT/08421", type: "Delivery", product: "Industrial Sensor Pro X", qty: 12, status: "Pending", time: "2 hours ago", warehouse: "wh-b", category: "sensors" },
  { id: "WH/ADJ/00112", type: "Adjustment", product: "Cable Harness CX-90", qty: -5, status: "Confirmed", time: "3 hours ago", warehouse: "wh-c", category: "consumables" },
  { id: "WH/IN/04520", type: "Receipt", product: "PCB Board Rev.4", qty: 200, status: "Validated", time: "5 hours ago", warehouse: "wh-a", category: "electronics" },
  { id: "WH/OUT/08420", type: "Delivery", product: "Thermal Paste TG-7", qty: 30, status: "Pending", time: "6 hours ago", warehouse: "wh-b", category: "consumables" },
  { id: "WH/OUT/08419", type: "Delivery", product: "Cooling Fan 120mm", qty: 8, status: "Validated", time: "Yesterday", warehouse: "wh-c", category: "electronics" },
];

const staffTaskQueue = [
  { id: "TASK-9201", taskType: "Pick", product: "Servo Motor A12", location: "WH-B / Rack 11", qty: 4, action: "Start Pick", warehouse: "wh-b", category: "motors" },
  { id: "TASK-9202", taskType: "Putaway", product: "PCB Board Rev.4", location: "Receiving Dock", qty: 60, action: "Start Putaway", warehouse: "wh-a", category: "electronics" },
  { id: "TASK-9203", taskType: "Transfer", product: "Industrial Sensor Pro X", location: "WH-A 14 -> WH-C 03", qty: 12, action: "Start Transfer", warehouse: "wh-c", category: "sensors" },
  { id: "TASK-9204", taskType: "Count", product: "Cooling Fan 120mm", location: "WH-A / Rack 07", qty: 8, action: "Confirm Count", warehouse: "wh-a", category: "electronics" },
  { id: "TASK-9205", taskType: "Pick", product: "Thermal Paste TG-7", location: "WH-A / Rack 05", qty: 20, action: "Start Pick", warehouse: "wh-b", category: "consumables" },
];

const staffRecentActions = [
  { time: "09:12", detail: "Picked 12 x Industrial Sensor Pro X" },
  { time: "09:35", detail: "Confirmed count for Cooling Fan 120mm" },
  { time: "10:04", detail: "Put away 40 x PCB Board Rev.4" },
  { time: "10:41", detail: "Transferred 6 x Servo Motor A12" },
];

const managerLowStockItems = [
  { name: "Hydraulic Pump HP-200", sku: "HYD-200-A", stock: 2, min: 10, warehouse: "wh-a", category: "motors" },
  { name: "Bearing Assembly BA-44", sku: "BRG-044-C", stock: 0, min: 25, warehouse: "wh-b", category: "motors" },
  { name: "O-Ring Kit ORK-15", sku: "ORK-015-B", stock: 5, min: 50, warehouse: "wh-c", category: "consumables" },
  { name: "Pressure Gauge PG-100", sku: "PRG-100-D", stock: 1, min: 8, warehouse: "wh-a", category: "sensors" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const isManager = user?.role === "Inventory Manager";

  const filteredManagerActivity = useMemo(() => {
    return managerRecentActivity.filter((a) => {
      if (typeFilter !== "all" && a.type.toLowerCase() !== typeFilter) return false;
      if (statusFilter !== "all" && a.status.toLowerCase() !== statusFilter) return false;
      if (warehouseFilter !== "all" && a.warehouse !== warehouseFilter) return false;
      if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
      return true;
    });
  }, [typeFilter, statusFilter, warehouseFilter, categoryFilter]);

  const filteredLowStockItems = useMemo(() => {
    return managerLowStockItems.filter((item) => {
      if (warehouseFilter !== "all" && item.warehouse !== warehouseFilter) return false;
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      return true;
    });
  }, [warehouseFilter, categoryFilter]);

  const filteredStaffTasks = useMemo(() => {
    return staffTaskQueue.filter((task) => {
      if (warehouseFilter !== "all" && task.warehouse !== warehouseFilter) return false;
      if (categoryFilter !== "all" && task.category !== categoryFilter) return false;
      return true;
    });
  }, [warehouseFilter, categoryFilter]);

  return (
    <>
      <header className="h-14 border-b border-border flex items-center justify-between px-8 gap-4">
        <span className="text-sm font-medium text-muted-foreground">Dashboard</span>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${
              isManager
                ? "border-primary/30 text-primary bg-primary/10"
                : "border-warning/30 text-warning bg-warning/10"
            }`}
          >
            Role: {user?.role ?? "Unknown"}
          </span>

          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="bg-background border border-border rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Warehouse Locations</option>
            {/* BACKEND_LOOP: warehouse locations */}
            <option value="wh-a">Main Warehouse (WH-A)</option>
            <option value="wh-b">North Annex (WH-B)</option>
            <option value="wh-c">Overflow Storage (WH-C)</option>
            {/* BACKEND_LOOP_END */}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-background border border-border rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Product Categories</option>
            {/* BACKEND_LOOP: product categories */}
            <option value="motors">Motors</option>
            <option value="sensors">Sensors</option>
            <option value="electronics">Electronics</option>
            <option value="consumables">Consumables</option>
            {/* BACKEND_LOOP_END */}
          </select>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {/*
          BACKEND_CONDITIONAL_START: if role == 'Inventory Manager'
          manager dashboard branch
        */}
        {isManager ? (
          <ManagerDashboard
            typeFilter={typeFilter}
            statusFilter={statusFilter}
            setTypeFilter={setTypeFilter}
            setStatusFilter={setStatusFilter}
            filteredActivity={filteredManagerActivity}
            filteredLowStockItems={filteredLowStockItems}
          />
        ) : (
          /* BACKEND_CONDITIONAL_ELSE: if role == 'Warehouse Staff' */
          <StaffDashboard filteredTasks={filteredStaffTasks} />
        )}
        {/* BACKEND_CONDITIONAL_END */}
      </div>
    </>
  );
}

function ManagerDashboard({
  typeFilter,
  statusFilter,
  setTypeFilter,
  setStatusFilter,
  filteredActivity,
  filteredLowStockItems,
}: {
  typeFilter: string;
  statusFilter: string;
  setTypeFilter: (value: string) => void;
  setStatusFilter: (value: string) => void;
  filteredActivity: typeof managerRecentActivity;
  filteredLowStockItems: typeof managerLowStockItems;
}) {
  const managerKpis = useMemo(
    () => [
      {
        ...managerKpiData[0],
        value: String(new Set(filteredActivity.map((item) => item.product)).size),
      },
      {
        ...managerKpiData[1],
        value: String(filteredLowStockItems.filter((item) => item.stock <= item.min).length),
      },
      {
        ...managerKpiData[2],
        value: String(filteredActivity.filter((item) => item.type === "Receipt" && item.status === "Pending").length),
      },
      {
        ...managerKpiData[3],
        value: String(filteredActivity.filter((item) => item.type === "Delivery" && item.status === "Pending").length),
      },
    ],
    [filteredActivity, filteredLowStockItems],
  );

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {managerKpis.map((kpi) => (
          <Link
            to={kpi.url}
            key={kpi.label}
            className="bg-card border border-border rounded-lg p-5 flex flex-col gap-3 hover:border-primary/50 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold group-hover:text-foreground transition-colors">
                {kpi.label}
              </span>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold font-mono tracking-tight">{kpi.value}</span>
              <span
                className={`flex items-center gap-0.5 text-xs font-mono ${
                  kpi.accent === "destructive"
                    ? "text-destructive"
                    : kpi.accent === "warning"
                    ? "text-warning"
                    : "text-primary"
                }`}
              >
                {kpi.trend === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {kpi.change}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Quick Operations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {managerQuickActions.map((action) => (
            <Link
              to={action.url}
              key={action.title}
              className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary/50 transition-all group shadow-sm active:scale-[0.98]"
            >
              <div className={`w-12 h-12 ${action.bg} ${action.color} rounded-lg flex items-center justify-center transition-transform group-hover:scale-110`}>
                <action.icon size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">{action.title}</h3>
                <p className="text-[11px] text-muted-foreground">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border flex items-center justify-between gap-4 flex-wrap">
            <span className="text-sm font-bold">Recent Activity</span>
            <div className="flex gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-background border border-border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Types</option>
                <option value="receipt">Receipt</option>
                <option value="delivery">Delivery</option>
                <option value="adjustment">Adjustment</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-background border border-border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="validated">Validated</option>
                <option value="confirmed">Confirmed</option>
              </select>
            </div>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                <th className="py-3 px-4">Document</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4 text-right">Qty</th>
                <th className="py-3 px-4 text-right">Status</th>
                <th className="py-3 px-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredActivity.map((row) => (
                <tr key={row.id} className="border-b border-border/50 hover:bg-accent/30 ims-hover">
                  <td className="py-3 px-4 font-mono text-xs font-bold text-primary">{row.id}</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">{row.type}</td>
                  <td className="py-3 px-4">{row.product}</td>
                  <td className="py-3 px-4 text-right font-mono">{row.qty > 0 ? `+${row.qty}` : row.qty}</td>
                  <td className="py-3 px-4 text-right">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="py-3 px-4 text-right text-xs text-muted-foreground">{row.time}</td>
                </tr>
              ))}
              {filteredActivity.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    No matching activity found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border">
            <span className="text-sm font-bold">Low Stock Alerts</span>
          </div>
          <div className="divide-y divide-border/50">
            {filteredLowStockItems.map((item) => (
              <div key={item.sku} className="p-4 hover:bg-accent/30 ims-hover">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className={`text-xs font-mono font-bold ${item.stock === 0 ? "text-destructive" : "text-warning"}`}>
                    {item.stock === 0 ? "OUT" : item.stock}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-muted-foreground font-mono">{item.sku}</span>
                  <span className="text-[10px] text-muted-foreground">Min: {item.min}</span>
                </div>
                <div className="mt-2 h-1 bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.stock === 0 ? "bg-destructive" : "bg-warning"}`}
                    style={{ width: `${Math.min((item.stock / item.min) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}

            {filteredLowStockItems.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">No low stock items for selected filters.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function StaffDashboard({ filteredTasks }: { filteredTasks: typeof staffTaskQueue }) {
  const staffKpis = useMemo(
    () => [
      {
        ...staffKpiData[0],
        value: String(filteredTasks.filter((task) => task.taskType === "Pick").length),
      },
      {
        ...staffKpiData[1],
        value: String(filteredTasks.filter((task) => task.taskType === "Putaway").length),
      },
      {
        ...staffKpiData[2],
        value: String(filteredTasks.filter((task) => task.taskType === "Transfer").length),
      },
      {
        ...staffKpiData[3],
        value: String(filteredTasks.filter((task) => task.taskType === "Count").length),
      },
    ],
    [filteredTasks],
  );

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {staffKpis.map((kpi) => (
          <Link
            to={kpi.url}
            key={kpi.label}
            className="bg-card border border-border rounded-lg p-5 flex flex-col gap-3 hover:border-primary/50 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold group-hover:text-foreground transition-colors">
                {kpi.label}
              </span>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold font-mono tracking-tight">{kpi.value}</span>
              <span
                className={`text-[10px] uppercase tracking-wider font-bold ${
                  kpi.accent === "destructive"
                    ? "text-destructive"
                    : kpi.accent === "warning"
                    ? "text-warning"
                    : "text-primary"
                }`}
              >
                Active
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border">
            <span className="text-sm font-bold">My Task Queue</span>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                <th className="py-3 px-4">Task Type</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Location / Rack</th>
                <th className="py-3 px-4 text-right">Qty</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="border-b border-border/50 hover:bg-accent/20 ims-hover">
                  <td className="py-3 px-4 text-xs font-bold text-primary">{task.taskType}</td>
                  <td className="py-3 px-4">{task.product}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{task.location}</td>
                  <td className="py-3 px-4 text-right font-mono">{task.qty}</td>
                  <td className="py-3 px-4 text-right">
                    <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 rounded text-xs font-semibold ims-press">
                      {task.action}
                    </button>
                  </td>
                </tr>
              ))}

              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    No tasks match selected warehouse/category filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border">
            <span className="text-sm font-bold">Daily Progress</span>
          </div>
          <div className="divide-y divide-border/50">
            {staffRecentActions.map((item) => (
              <div key={`${item.time}-${item.detail}`} className="p-4">
                <div className="text-xs font-mono text-primary mb-1">{item.time}</div>
                <div className="text-sm text-muted-foreground">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Validated: "bg-success/10 text-success border-success/20",
    Pending: "bg-warning/10 text-warning border-warning/20",
    Confirmed: "bg-primary/10 text-primary border-primary/20",
  };

  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${styles[status] || "bg-muted text-muted-foreground border-border"}`}>
      {status}
    </span>
  );
}
