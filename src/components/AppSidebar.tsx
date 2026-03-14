import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Truck,
  ArrowLeftRight,
  History,
  Settings,
  Menu,
  ArrowDownLeft,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import React, { useState } from "react";

const mainLinks = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Products", url: "/products", icon: Package },
];

const operationsLinks = [
  { title: "Receipts", url: "/operations/receipts", icon: ClipboardList },
  { title: "Stock Receipt", url: "/operations/stock-receipt", icon: ArrowDownLeft },
  { title: "Delivery Orders", url: "/operations/delivery-orders", icon: Truck },
  { title: "Inventory Adjustment", url: "/operations/adjustments", icon: ArrowLeftRight },
  { title: "Move History", url: "/operations/move-history", icon: History },
];

const bottomLinks = [
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${collapsed ? "w-14" : "w-60"
        } border-r border-border bg-sidebar flex flex-col shrink-0 transition-all duration-250`}
      style={{ transitionTimingFunction: "cubic-bezier(0.2,0,0,1)" }}
    >
      <div className="h-14 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <span className="font-bold tracking-tighter text-lg text-sidebar-foreground">
            CORE_IMS
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-sidebar-accent ims-press"
        >
          <Menu className="h-4 w-4 text-sidebar-muted" />
        </button>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-1 overflow-hidden">
        {mainLinks.map((item) => (
          <SidebarLink key={item.url} item={item} collapsed={collapsed} currentPath={location.pathname} />
        ))}

        <div className={`pt-5 pb-2 ${collapsed ? "px-1" : "px-3"}`}>
          {!collapsed && (
            <span className="text-[10px] uppercase tracking-widest text-sidebar-muted font-bold">
              Operations
            </span>
          )}
          {collapsed && <div className="border-t border-border" />}
        </div>

        {operationsLinks.map((item) => (
          <SidebarLink key={item.url} item={item} collapsed={collapsed} currentPath={location.pathname} />
        ))}
      </nav>

      <div className="px-2 pb-3 space-y-1 border-t border-border pt-3">
        {bottomLinks.map((item) => (
          <SidebarLink key={item.url} item={item} collapsed={collapsed} currentPath={location.pathname} />
        ))}
      </div>
    </aside>
  );
}

interface SidebarLinkProps {
  item: { title: string; url: string; icon: React.ElementType };
  collapsed: boolean;
  currentPath: string;
}

function SidebarLink({
  item,
  collapsed,
  currentPath,
}: SidebarLinkProps) {
  const isActive = item.url === "/" ? currentPath === "/" : currentPath.startsWith(item.url);

  return (
    <NavLink
      to={item.url}
      end={item.url === "/"}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ims-hover ${isActive
        ? "bg-sidebar-accent text-sidebar-foreground"
        : "text-sidebar-muted hover:text-sidebar-foreground"
        } ${collapsed ? "justify-center px-2" : ""}`}
      activeClassName=""
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{item.title}</span>}
    </NavLink>
  );
}
