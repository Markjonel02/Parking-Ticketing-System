// client/src/components/layout/Sidebar.jsx
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Ticket,
  Car,
  CreditCard,
  AlertOctagon,
  BarChart3,
  Users,
  Settings,
  Shield,
  PlusCircle,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAppContext } from "../../context/AppContext.jsx";
import { useAuth } from "../../hooks/useAuth.js";

/**
 * Tooltip that only renders when `show` is true (i.e. sidebar collapsed).
 * Uses its own named group (`group/tip`) so it never clashes with the
 * `group` used for icon hover colouring on the button itself.
 */
function Tooltip({ label, show, children }) {
  if (!show) return children;

  return (
    <div className="relative group/tip">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-md border border-slate-700 bg-slate-800/95 px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-lg shadow-black/40 backdrop-blur-sm transition-all duration-150 group-hover/tip:translate-x-0 group-hover/tip:opacity-100"
      >
        {label}
      </span>
    </div>
  );
}

export function Sidebar() {
  const { activeTab, navigateTo, setIsCreateTicketOpen, setIsQuickPayOpen } =
    useAppContext();
  const { user } = useAuth();

  // Desktop collapse state, persisted across reloads.
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("pg:sidebar-collapsed") === "1";
  });

  useEffect(() => {
    window.localStorage.setItem("pg:sidebar-collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  const userRole = user?.role || "ADMIN";

  const navItems = [
    {
      id: "dashboard",
      label: userRole === "ADMIN" ? "Admin Dashboard" : "Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      roles: ["all"],
    },
    {
      id: "tickets",
      label: "Citations & Tickets",
      icon: <Ticket className="w-4 h-4" />,
      roles: ["all"],
    },
    {
      id: "vehicles",
      label: "Vehicle Registry",
      icon: <Car className="w-4 h-4" />,
      roles: ["ADMIN", "OFFICER", "SUPERVISOR"],
    },
    {
      id: "payments",
      label: "Fee Collections",
      icon: <CreditCard className="w-4 h-4" />,
      roles: ["all"],
    },
    {
      id: "violations",
      label: "Infraction Codes",
      icon: <AlertOctagon className="w-4 h-4" />,
      roles: ["ADMIN", "SUPERVISOR"],
    },
    {
      id: "reports",
      label: "Executive Analytics",
      icon: <BarChart3 className="w-4 h-4" />,
      roles: ["ADMIN", "SUPERVISOR"],
    },
    {
      id: "users",
      label: "Staff Management",
      icon: <Users className="w-4 h-4" />,
      roles: ["ADMIN"],
    },
    {
      id: "settings",
      label: "System Settings",
      icon: <Settings className="w-4 h-4" />,
      roles: ["all"],
    },
  ];

  const filteredNav = navItems.filter(
    (item) => item.roles.includes("all") || item.roles.includes(userRole),
  );

  const canIssue = ["ADMIN", "OFFICER", "SUPERVISOR"].includes(userRole);

  return (
    <aside
      data-collapsed={collapsed}
      className={`${
        collapsed ? "w-[72px]" : "w-64"
      } group/sidebar relative shrink-0 flex flex-col h-screen sticky top-0 select-none
        border-r border-slate-700/40
        backdrop-blur-xl backdrop-saturate-150
        text-slate-200
        shadow-2xl shadow-black/40
        transition-[width] duration-300 ease-in-out`}
    >
      {/* Collapse toggle — desktop only */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        className="hidden md:flex absolute -right-3 top-7 z-40 h-6 w-6 items-center justify-center
          rounded-full border border-slate-600/70 bg-slate-800 text-slate-300
          shadow-md shadow-black/40 cursor-pointer
          hover:bg-blue-600 hover:text-white hover:border-blue-500
          transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Brand Header */}
      <div
        className={`flex items-center gap-3 border-b border-slate-700/30 ${
          collapsed ? "p-4 justify-center" : "p-5"
        }`}
      >
        <Tooltip label="ParkGuard v2.4" show={collapsed}>
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
        </Tooltip>

        {!collapsed && (
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-blue-400 tracking-tight">
                ParkGuard
              </h1>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Municipal Enforcement OS
            </p>
          </div>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className={`pt-4 pb-2 space-y-2 ${collapsed ? "px-3" : "px-4"}`}>
        {canIssue && (
          <Tooltip label="Issue Citation" show={collapsed}>
            <button
              onClick={() => setIsCreateTicketOpen(true)}
              className={`w-full flex items-center gap-2 py-2 text-xs font-semibold text-white
                bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm shadow-blue-900/40
                transition-colors cursor-pointer ${
                  collapsed ? "justify-center px-0" : "justify-center px-3"
                }`}
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              {!collapsed && "Issue Citation"}
            </button>
          </Tooltip>
        )}

        <Tooltip label="Direct Citizen Pay" show={collapsed}>
          <button
            onClick={() => setIsQuickPayOpen(true)}
            className={`w-full flex items-center gap-2 py-2 text-xs font-medium
              text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-700/80
              rounded-lg border border-slate-700 transition-colors cursor-pointer ${
                collapsed ? "justify-center px-0" : "justify-center px-3"
              }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            {!collapsed && "Direct Citizen Pay"}
          </button>
        </Tooltip>
      </div>

      {/* Navigation List */}
      <nav
        className={`flex-1 py-3 space-y-1 ${collapsed ? "px-3" : "px-3"} ${
          // overflow-hidden would clip the tooltips, so only scroll when expanded
          collapsed ? "overflow-visible" : "overflow-y-auto"
        }`}
      >
        {!collapsed && (
          <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Navigation
          </div>
        )}

        {filteredNav.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <Tooltip key={item.id} label={item.label} show={collapsed}>
              <button
                onClick={() => navigateTo(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`group w-full flex items-center gap-3 py-2 rounded-lg text-xs font-medium
                  transition-colors cursor-pointer text-left ${
                    collapsed ? "justify-center px-0" : "px-3"
                  } ${
                    isActive
                      ? "bg-blue-600 text-white font-semibold shadow-sm shadow-blue-900/40"
                      : "text-slate-700 hover:bg-blue-500/80 hover:text-white"
                  }`}
              >
                <span className="shrink-0">{item.icon}</span>
                {!collapsed && <span className="flex-1">{item.label}</span>}
              </button>
            </Tooltip>
          );
        })}
      </nav>

      {/* Current Role Badge */}
      {/*      <Tooltip label={`Signed in as ${userRole}`} show={collapsed}>
        <div
          className={`mb-3 bg-slate-800/60 rounded-xl border border-slate-700/70 text-xs backdrop-blur-sm ${
            collapsed ? "mx-3 p-2 flex justify-center" : "mx-3 p-3"
          }`}
        >
          {collapsed ? (
            <Zap className="w-4 h-4 text-amber-400" />
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" /> Signed in as
              </span>
              <span className="text-[10px] text-blue-400 font-bold uppercase">
                {userRole}
              </span>
            </div>
          )}
        </div>
      </Tooltip> */}

      {/* Footer User Profile */}
      <div
        className={` flex items-center gap-3 ${
          collapsed ? "p-3 justify-center" : "p-3.5"
        }`}
      >
        <Tooltip
          label={`${user?.name || "Staff Officer"} — ${
            user?.badgeNumber || userRole
          }`}
          show={collapsed}
        >
          <div className="w-8 h-8 rounded-full bg-slate-700 text-blue-00 flex items-center justify-center font-bold text-xs shrink-0">
            {user?.name?.slice(0, 2).toUpperCase() || "PG"}
          </div>
        </Tooltip>

        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">
              {user?.name || "Staff Officer"}
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              {user?.badgeNumber || user?.role}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
