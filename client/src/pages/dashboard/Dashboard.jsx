// client/src/pages/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/dashboard/StatCard.jsx';
import { RevenueChart } from '../../components/dashboard/RevenueChart.jsx';
import { RecentTickets } from '../../components/dashboard/RecentTickets.jsx';
import { reportApi } from '../../services/api/reportApi.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { useAppContext } from '../../context/AppContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { Button } from '../../components/common/Button.jsx';
import {
  Ticket,
  DollarSign,
  AlertTriangle,
  Car,
  PlusCircle,
  CreditCard,
  Shield,
  Activity,
  ArrowRight
} from 'lucide-react';

export function Dashboard() {
  const { navigateTo, setIsCreateTicketOpen, setIsQuickPayOpen, refreshKey } = useAppContext();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      try {
        const res = await reportApi.getDashboardStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, [refreshKey]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Greetings */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.name || 'Officer'}
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {user?.role || 'Staff'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Metropolitan Parking Authority · Live citation enforcement & municipal treasury stream
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            colorScheme="brand"
            onClick={() => setIsCreateTicketOpen(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Issue Citation
          </Button>
          <Button
            size="sm"
            colorScheme="teal"
            variant="outline"
            onClick={() => setIsQuickPayOpen(true)}
            leftIcon={<CreditCard className="w-4 h-4" />}
          >
            Direct Pay
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Citations"
          value={stats?.tickets?.issuedCount ?? 14}
          change="+8% vs last week"
          isIncreasePositive={false}
          icon={<Ticket className="w-5 h-5" />}
          colorScheme="blue"
          helperText="Unresolved parking infractions"
          onClick={() => navigateTo('tickets')}
        />
        <StatCard
          title="Today's Collections"
          value={formatCurrency(stats?.payments?.todayRevenue ?? 1640)}
          change="+14.2%"
          isIncreasePositive={true}
          icon={<DollarSign className="w-5 h-5" />}
          colorScheme="teal"
          helperText="Municipal treasury deposits"
          onClick={() => navigateTo('payments')}
        />
        <StatCard
          title="Delinquent / Overdue"
          value={stats?.tickets?.overdueCount ?? 6}
          change="+2 tickets"
          isIncreasePositive={false}
          icon={<AlertTriangle className="w-5 h-5" />}
          colorScheme="red"
          helperText="Subject to DMV registration holds"
          onClick={() => navigateTo('tickets')}
        />
        <StatCard
          title="Monitored Vehicles"
          value={stats?.vehicles?.totalCount ?? 28}
          change="3 at boot threshold"
          icon={<Car className="w-5 h-5" />}
          colorScheme="purple"
          helperText="Automated plate scan registry"
          onClick={() => navigateTo('vehicles')}
        />
      </div>

      {/* Middle Section: Revenue Chart & Zone Occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={stats?.revenueTrend} />
        </div>

        {/* Municipal Zone Occupancy */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Zone Patrol Activity</h3>
                <p className="text-xs text-slate-500">Live bay occupancy & rate tiers</p>
              </div>
              <Activity className="w-4 h-4 text-blue-600" />
            </div>

            <div className="space-y-3.5">
              {[
                { name: 'Zone A - Downtown Core', rate: '$4.50/hr', mult: '1.25x', occupancy: 88, status: 'High Demand' },
                { name: 'Zone B - Arts District', rate: '$3.50/hr', mult: '1.0x', occupancy: 64, status: 'Normal' },
                { name: 'Zone C - Uptown Grid', rate: '$2.50/hr', mult: '1.0x', occupancy: 42, status: 'Low' },
                { name: 'Zone D - Waterfront Marina', rate: '$5.00/hr', mult: '1.15x', occupancy: 91, status: 'Critical' }
              ].map((z, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-800">{z.name}</span>
                    <span className="text-slate-500">{z.occupancy}% full ({z.mult})</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        z.occupancy > 85 ? 'bg-red-500' : z.occupancy > 60 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${z.occupancy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Auto-calculated rate multipliers enabled</span>
            <button
              onClick={() => navigateTo('violations')}
              className="text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Fee Schedule <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Citations Activity Stream */}
      <div>
        <RecentTickets tickets={stats?.recentTickets || []} />
      </div>
    </div>
  );
}

export default Dashboard;
