import {
  AlertTriangle,
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  ClipboardCheck,
  ClipboardList,
  Package,
  Truck,
  Warehouse,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ProfileMenu } from "@/components/ProfileMenu";
import { userRole } from "@/lib/rbac";

const managerKpiData = [
  {
    label: "Total Products",
    value: "1,847",
    change: "+12",
    trend: "up" as const,
    icon: Package,
    accent: "primary",
  },
  {
    label: "Low / Out of Stock",
    value: "23",
    change: "+3",
    trend: "up" as const,
    icon: AlertTriangle,
    accent: "destructive",
  },
  {
    label: "Pending Receipts",
    value: "14",
    change: "-2",
    trend: "down" as const,
    icon: ClipboardList,
    accent: "warning",
  },
  {
    label: "Pending Deliveries",
    value: "31",
    change: "+5",
    trend: "up" as const,
    icon: Truck,
    accent: "primary",
  },
];

const managerRecentActivity = [
  { id: "WH/IN/04521", type: "Receipt", product: "Servo Motor A12", qty: 50, status: "Validated", time: "12 min ago" },
  { id: "WH/OUT/08421", type: "Delivery", product: "Industrial Sensor Pro X", qty: 12, status: "Pending", time: "2 hours ago" },
  { id: "WH/ADJ/00112", type: "Adjustment", product: "Cable Harness CX-90", qty: -5, status: "Confirmed", time: "3 hours ago" },
  { id: "WH/IN/04520", type: "Receipt", product: "PCB Board Rev.4", qty: 200, status: "Validated", time: "5 hours ago" },
  { id: "WH/OUT/08420", type: "Delivery", product: "Thermal Paste TG-7", qty: 30, status: "Pending", time: "6 hours ago" },
  { id: "WH/OUT/08419", type: "Delivery", product: "Cooling Fan 120mm", qty: 8, status: "Validated", time: "Yesterday" },
];

const managerLowStockItems = [
  { name: "Hydraulic Pump HP-200", sku: "HYD-200-A", stock: 2, min: 10 },
  { name: "Bearing Assembly BA-44", sku: "BRG-044-C", stock: 0, min: 25 },
  { name: "O-Ring Kit ORK-15", sku: "ORK-015-B", stock: 5, min: 50 },
  { name: "Pressure Gauge PG-100", sku: "PRG-100-D", stock: 1, min: 8 },
];

const staffKpiData = [
  { label: "My Pending Picks", value: "18", icon: Truck, accent: "primary" },
  { label: "Pending Putaways", value: "11", icon: Warehouse, accent: "warning" },
  { label: "Internal Transfers", value: "7", icon: ArrowLeftRight, accent: "primary" },
  { label: "Items to Count", value: "23", icon: ClipboardCheck, accent: "destructive" },
];

const staffTaskQueue = [
  { id: "TASK-9201", taskType: "Pick", product: "Servo Motor A12", location: "WH-B / Rack 11", qty: 4, action: "Start Pick" },
  { id: "TASK-9202", taskType: "Putaway", product: "PCB Board Rev.4", location: "Receiving Dock", qty: 60, action: "Start Putaway" },
  { id: "TASK-9203", taskType: "Transfer", product: "Industrial Sensor Pro X", location: "WH-A 14 -> WH-C 03", qty: 12, action: "Start Transfer" },
  { id: "TASK-9204", taskType: "Count", product: "Cooling Fan 120mm", location: "WH-A / Rack 07", qty: 8, action: "Confirm Count" },
  { id: "TASK-9205", taskType: "Pick", product: "Thermal Paste TG-7", location: "WH-A / Rack 05", qty: 20, action: "Start Pick" },
];

const staffRecentActions = [
  { time: "09:12", detail: "Picked 12 x Industrial Sensor Pro X" },
  { time: "09:35", detail: "Confirmed count for Cooling Fan 120mm" },
  { time: "10:04", detail: "Put away 40 x PCB Board Rev.4" },
  { time: "10:41", detail: "Transferred 6 x Servo Motor A12" },
];

export default function DashboardPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredManagerActivity = useMemo(() => {
    return managerRecentActivity.filter((a) => {
      if (typeFilter !== "all" && a.type.toLowerCase() !== typeFilter) return false;
      if (statusFilter !== "all" && a.status.toLowerCase() !== statusFilter) return false;
      return true;
    });
  }, [typeFilter, statusFilter]);

  const isManager = userRole === "Inventory Manager";

  return (
    <>
      <header className="h-14 border-b border-border flex items-center justify-between px-8">
        <span className="text-sm font-medium text-muted-foreground">Dashboard</span>
        <ProfileMenu />
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {/*
          RBAC: Wrap the branch below with backend template logic:
          if role == 'Inventory Manager' -> manager dashboard
          if role == 'Warehouse Staff' -> staff dashboard
        */}
        {isManager ? (
          <ManagerDashboardView
            typeFilter={typeFilter}
            statusFilter={statusFilter}
            setTypeFilter={setTypeFilter}
            setStatusFilter={setStatusFilter}
            filteredActivity={filteredManagerActivity}
          />
        ) : (
          <StaffDashboardView />
        )}
      </div>
    </>
  );
}

function ManagerDashboardView({
  typeFilter,
  statusFilter,
  setTypeFilter,
  setStatusFilter,
  filteredActivity,
}: {
  typeFilter: string;
  statusFilter: string;
  setTypeFilter: (value: string) => void;
  setStatusFilter: (value: string) => void;
  filteredActivity: typeof managerRecentActivity;
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {managerKpiData.map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-lg p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">{kpi.label}</span>
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
          </div>
        ))}
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
            {managerLowStockItems.map((item) => (
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
          </div>
        </div>
      </div>
    </>
  );
}

function StaffDashboardView() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {staffKpiData.map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-lg p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">{kpi.label}</span>
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
          </div>
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
              {staffTaskQueue.map((task) => (
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
    <span
      className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
        styles[status] || "bg-muted text-muted-foreground border-border"
      }`}
    >
      {status}
    </span>
  );
}
