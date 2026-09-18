// client/src/pages/dashboard/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { StatCard } from "../../components/dashboard/StatCard.jsx";
import { RevenueChart } from "../../components/dashboard/RevenueChart.jsx";
import { reportApi } from "../../services/api/reportApi.js";
import { userApi } from "../../services/api/userApi.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { useAppContext } from "../../context/AppContext.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { Button } from "../../components/common/Button.jsx";
import {
  Ticket,
  DollarSign,
  AlertTriangle,
  BadgeCheck,
  Users,
  ShieldCheck,
  UserCog,
  ArrowRight,
  MapPin,
} from "lucide-react";

/**
 * Admin-only landing dashboard. Rendered instead of the standard staff
 * Dashboard whenever the authenticated user's role (verified by the
 * server on login / GET /auth/me) is ADMIN. Surfaces system-wide
 * figures (all tickets/revenue, not just "my" activity) plus a staff
 * & access-control snapshot, since only ADMIN can manage users.
 */
export function AdminDashboard() {
  const { navigateTo } = useAppContext();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [userSummary, setUserSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadAdminOverview() {
      setIsLoading(true);
      try {
        const [statsRes, usersRes] = await Promise.all([
          reportApi.getDashboardStats(),
          userApi.getAllUsers(),
        ]);

        if (cancelled) return;

        if (statsRes.success) setStats(statsRes.data);

        const users = usersRes.data || [];
        const byRole = users.reduce((acc, u) => {
          acc[u.role] = (acc[u.role] || 0) + 1;
          return acc;
        }, {});
        const activeCount = users.filter((u) => u.status === "ACTIVE").length;
        setUserSummary({
          total: usersRes.pagination?.totalItems ?? users.length,
          byRole,
          activeCount,
          suspendedCount: users.length - activeCount,
        });
      } catch (err) {
        console.error("Failed to load admin dashboard data", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadAdminOverview();
    return () => {
      cancelled = true;
    };
  }, []);

  const overview = stats?.overview;
  const revenueSeries = (stats?.revenueByDay || []).map((d) => ({
    label: new Date(d.date).toLocaleDateString(undefined, { weekday: "short" }),
    revenue: d.revenue,
    citations: d.tickets,
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Administrator Console — {user?.name || "Admin"}
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> {user?.role || "ADMIN"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            System-wide oversight · all zones, all officers, all revenue
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            colorScheme="brand"
            onClick={() => navigateTo("users")}
            leftIcon={<UserCog className="w-4 h-4" />}
          >
            Manage Staff
          </Button>
          <Button
            size="sm"
            colorScheme="teal"
            variant="outline"
            onClick={() => navigateTo("reports")}
            leftIcon={<ArrowRight className="w-4 h-4" />}
          >
            Executive Analytics
          </Button>
        </div>
      </div>

      {/* System-wide Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Citations"
          value={isLoading ? "…" : (overview?.totalTickets ?? 0)}
          colorScheme="blue"
          icon={<Ticket className="w-4 h-4" />}
          helperText="All citations issued system-wide"
          onClick={() => navigateTo("tickets")}
        />
        <StatCard
          title="Total Revenue Collected"
          value={isLoading ? "…" : formatCurrency(overview?.totalRevenue ?? 0)}
          colorScheme="teal"
          icon={<DollarSign className="w-4 h-4" />}
          helperText={`Collection rate: ${overview?.collectionRate ?? 0}%`}
          onClick={() => navigateTo("payments")}
        />
        <StatCard
          title="Outstanding Fines"
          value={isLoading ? "…" : formatCurrency(overview?.outstandingFines ?? 0)}
          colorScheme="red"
          icon={<AlertTriangle className="w-4 h-4" />}
          helperText={`${overview?.overdueTickets ?? 0} overdue · ${overview?.disputedTickets ?? 0} disputed`}
          onClick={() => navigateTo("tickets")}
        />
        <StatCard
          title="Active Staff Accounts"
          value={isLoading ? "…" : (userSummary?.activeCount ?? 0)}
          colorScheme="purple"
          icon={<Users className="w-4 h-4" />}
          helperText={`${userSummary?.total ?? 0} total · ${userSummary?.suspendedCount ?? 0} suspended`}
          onClick={() => navigateTo("users")}
        />
      </div>

      {/* Revenue Chart & Staff Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueSeries} />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Staff by Role
                </h3>
                <p className="text-xs text-slate-500">
                  Access control snapshot
                </p>
              </div>
              <BadgeCheck className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-3.5">
              {["ADMIN", "SUPERVISOR", "OFFICER", "CASHIER", "CITIZEN"].map(
                (role) => {
                  const count = userSummary?.byRole?.[role] || 0;
                  const total = userSummary?.total || 1;
                  const pct = Math.round((count / total) * 100) || 0;
                  return (
                    <div key={role} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-800">{role}</span>
                        <span className="text-slate-500">{count} accounts</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Only Admins can manage staff</span>
            <button
              onClick={() => navigateTo("users")}
              className="text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Staff Management <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Zone Occupancy across the whole system */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              System-wide Zone Occupancy
            </h3>
            <p className="text-xs text-slate-500">
              Live bay occupancy across every enforcement zone
            </p>
          </div>
          <MapPin className="w-4 h-4 text-slate-400" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(stats?.zoneBreakdown || []).map((zone) => (
            <div
              key={zone.id}
              className="p-3 rounded-lg border border-slate-200 space-y-2"
            >
              <div className="flex justify-between text-xs font-semibold text-slate-800">
                <span>{zone.name}</span>
                <span className="text-slate-500">{zone.occupancyRate}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    zone.occupancyRate > 85
                      ? "bg-red-500"
                      : zone.occupancyRate > 60
                        ? "bg-amber-500"
                        : "bg-blue-600"
                  }`}
                  style={{ width: `${zone.occupancyRate}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {zone.count} citations issued · {zone.occupiedSpots}/{zone.totalSpots} spots
              </p>
            </div>
          ))}
          {!isLoading && (!stats?.zoneBreakdown || stats.zoneBreakdown.length === 0) && (
            <p className="text-xs text-slate-400 col-span-full text-center py-4">
              No zone data available yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
