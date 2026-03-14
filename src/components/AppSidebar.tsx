import {
  ArrowLeftRight,
  ChevronDown,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Truck,
  UserRound,
  Warehouse,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { NavLink } from "@/components/NavLink";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { userRole } from "@/lib/rbac";
import { useLocation } from "react-router-dom";

type LinkItem = {
  title: string;
  url: string;
  icon?: React.ElementType;
  managerOnly?: boolean;
};

const baseMainLinks: LinkItem[] = [{ title: "Dashboard", url: "/", icon: LayoutDashboard }];

const productSubLinks: LinkItem[] = [
  // BACKEND_CONDITIONAL_START: if role == 'Inventory Manager'
  { title: "Create and update products", url: "/products/create-update", managerOnly: true },
  // BACKEND_CONDITIONAL_END
  { title: "Stock availability per location", url: "/products/availability" },
  { title: "Product categories", url: "/products/categories" },
  { title: "Reordering rules", url: "/products/reordering-rules" },
];

const managerOperationLinks: LinkItem[] = [
  { title: "Receipts", url: "/operations/receipts", icon: Warehouse },
  { title: "Delivery Orders", url: "/operations/delivery-orders", icon: Truck },
  { title: "Inventory Adjustment", url: "/operations/adjustments", icon: ArrowLeftRight },
  { title: "Move History", url: "/operations/move-history", icon: History },
];

const staffOperationLinks: LinkItem[] = [
  { title: "Internal Transfers", url: "/operations/internal-transfers", icon: ArrowLeftRight },
  { title: "Pending Picks", url: "/operations/delivery-orders", icon: Truck },
  { title: "Stock Adjustments", url: "/operations/adjustments", icon: Warehouse },
];

export function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [productsOpen, setProductsOpen] = useState(true);

  const isManager = userRole === "Inventory Manager";

  const visibleProductLinks = useMemo(
    () => productSubLinks.filter((link) => isManager || !link.managerOnly),
    [isManager],
  );

  const operationLinks = isManager ? managerOperationLinks : staffOperationLinks;

  return (
    <aside
      className={`${collapsed ? "w-14" : "w-64"} border-r border-border bg-sidebar flex flex-col shrink-0 transition-all duration-250`}
      style={{ transitionTimingFunction: "cubic-bezier(0.2,0,0,1)" }}
    >
      <div className="h-14 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && <span className="font-bold tracking-tighter text-lg text-sidebar-foreground">CORE_IMS</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded hover:bg-sidebar-accent ims-press">
          <Menu className="h-4 w-4 text-sidebar-muted" />
        </button>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {baseMainLinks.map((item) => (
          <SidebarLink key={item.url} item={item} collapsed={collapsed} currentPath={location.pathname} />
        ))}

        {!collapsed && (
          <button
            type="button"
            onClick={() => setProductsOpen((prev) => !prev)}
            className="w-full mt-2 flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm font-medium text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <span className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${productsOpen ? "rotate-180" : ""}`} />
          </button>
        )}

        {collapsed && (
          <div className="mt-2">
            <SidebarLink
              item={{ title: "Products", url: "/products/availability", icon: Package }}
              collapsed={collapsed}
              currentPath={location.pathname}
            />
          </div>
        )}

        {!collapsed && productsOpen && (
          <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
            {visibleProductLinks.map((item) => (
              <SidebarSubLink key={item.url} item={item} currentPath={location.pathname} />
            ))}
          </div>
        )}

        <div className={`pt-5 pb-2 ${collapsed ? "px-1" : "px-3"}`}>
          {!collapsed ? (
            <span className="text-[10px] uppercase tracking-widest text-sidebar-muted font-bold">Operations</span>
          ) : (
            <div className="border-t border-border" />
          )}
        </div>

        {operationLinks.map((item) => (
          <SidebarLink key={item.url} item={item} collapsed={collapsed} currentPath={location.pathname} />
        ))}
      </nav>

      <div className="px-2 pb-3 space-y-1 border-t border-border pt-3">
        <SidebarProfileMenu collapsed={collapsed} />

        {/* BACKEND_CONDITIONAL_START: if role == 'Inventory Manager' */}
        {isManager && (
          <SidebarLink
            item={{ title: "Settings", url: "/settings", icon: Settings, managerOnly: true }}
            collapsed={collapsed}
            currentPath={location.pathname}
          />
        )}
        {/* BACKEND_CONDITIONAL_END */}
      </div>
    </aside>
  );
}

function SidebarProfileMenu({ collapsed }: { collapsed: boolean }) {
  const accountName = "Arham Bhansali";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`w-full flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5 text-left ims-hover ${
            collapsed ? "justify-center px-1" : ""
          }`}
        >
          <Avatar className="h-7 w-7 border border-border">
            <AvatarImage src="https://api.dicebear.com/9.x/adventurer/svg?seed=Arham-Bhansali" alt={accountName} />
            <AvatarFallback className="text-[10px] font-bold">AB</AvatarFallback>
          </Avatar>
          {!collapsed && <span className="text-xs font-medium text-foreground">{accountName}</span>}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onSelect={() => toast.info("My profile clicked")}> 
          <UserRound className="h-4 w-4" />
          My profile
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast.info("Signout clicked")}> 
          <LogOut className="h-4 w-4" />
          Signout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarLink({
  item,
  collapsed,
  currentPath,
}: {
  item: LinkItem;
  collapsed: boolean;
  currentPath: string;
}) {
  const isActive = item.url === "/" ? currentPath === "/" : currentPath.startsWith(item.url);
  const ItemIcon = item.icon;

  return (
    <NavLink
      to={item.url}
      end={item.url === "/"}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ims-hover ${
        isActive ? "bg-sidebar-accent text-sidebar-foreground" : "text-sidebar-muted hover:text-sidebar-foreground"
      } ${collapsed ? "justify-center px-2" : ""}`}
      activeClassName=""
    >
      {ItemIcon && <ItemIcon className="h-4 w-4 shrink-0" />}
      {!collapsed && <span>{item.title}</span>}
    </NavLink>
  );
}

function SidebarSubLink({ item, currentPath }: { item: LinkItem; currentPath: string }) {
  const isActive = currentPath.startsWith(item.url);

  return (
    <NavLink
      to={item.url}
      className={`block rounded px-2 py-1.5 text-xs font-medium ${
        isActive ? "text-sidebar-foreground bg-sidebar-accent" : "text-sidebar-muted hover:text-sidebar-foreground"
      }`}
      activeClassName=""
    >
      {item.title}
    </NavLink>
  );
}
