// client/src/pages/reports/Reports.jsx
import React, { useState, useEffect } from "react";
import { reportApi } from "../../services/api/reportApi.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { StatCard } from "../../components/dashboard/StatCard.jsx";
import { Button } from "../../components/common/Button.jsx";
import {
  BarChart3,
  Download,
  Calendar,
  FileSpreadsheet,
  TrendingUp,
  PieChart as PieIcon,
  ShieldCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export function Reports() {
  const [reportType, setReportType] = useState("revenue");
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      setIsLoading(true);
      try {
        const [dashRes, revRes] = await Promise.all([
          reportApi.getDashboardStats(),
          reportApi.getRevenueReports(),
        ]);
        setData({
          dashboard: dashRes.data,
          revenue: revRes.data,
        });
      } catch (err) {
        console.error("Error fetching reports", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchReports();
  }, []);

  function handleExportCSV() {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Metric,Value\n" +
      `Total Citations Issued,${data?.dashboard?.tickets?.issuedCount || 0}\n` +
      `Delinquent Citations,${data?.dashboard?.tickets?.overdueCount || 0}\n` +
      `Total Collections Today,$${data?.dashboard?.payments?.todayRevenue || 0}\n` +
      `Vehicles Tracked,${data?.dashboard?.vehicles?.totalCount || 0}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `ParkGuard_Enforcement_Report_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const zoneColors = ["#2563EB", "#0D9488", "#F59E0B", "#9333EA"];

  const zoneData = [
    { name: "Zone A - Downtown", revenue: 4200, citations: 52 },
    { name: "Zone B - Arts District", revenue: 2600, citations: 34 },
    { name: "Zone C - Uptown Grid", revenue: 1800, citations: 23 },
    { name: "Zone D - Waterfront", revenue: 3900, citations: 46 },
  ];

  const statusPieData = [
    { name: "Paid", value: 38, color: "#0D9488" },
    { name: "Active", value: 24, color: "#2563EB" },
    { name: "Overdue", value: 12, color: "#DC2626" },
    { name: "Disputed", value: 6, color: "#9333EA" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Executive Analytics & Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Treasury collection reports, citation resolution rates, and zone
            revenue breakdown
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            colorScheme="gray"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export CSV Audit
          </Button>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Monthly Projected Revenue"
          value={formatCurrency(48500)}
          colorScheme="teal"
          helperText="Targeting $50k municipal quota"
        />
        <StatCard
          title="Adjudication Settlement Rate"
          value="84.6%"
          colorScheme="blue"
          helperText="Average 4.2 days to resolution"
        />
        <StatCard
          title="Overdue Collection Recovery"
          value={formatCurrency(7820)}
          colorScheme="amber"
          helperText="Delinquent fine recoveries"
        />
      </div>

      {/* 2-Column Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zone Revenue Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Collections by Enforcement Zone
              </h3>
              <p className="text-xs text-slate-500">
                Gross revenue distribution
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={zoneData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), "Revenue"]}
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Citation Status Distribution Pie Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Citation Resolution Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Status lifecycle proportions
              </p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`${val}%`, "Proportion"]}
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
            {statusPieData.map((s, idx) => (
              <div key={idx}>
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block mr-1"
                  style={{ backgroundColor: s.color }}
                ></span>
                <span className="text-slate-600 font-medium">
                  {s.name} ({s.value}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
