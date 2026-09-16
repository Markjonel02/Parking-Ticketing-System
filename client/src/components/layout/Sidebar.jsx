// client/src/components/layout/Sidebar.jsx
import React from 'react';
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
  Sparkles
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { Button } from '../common/Button.jsx';

export function Sidebar() {
  const { activeTab, navigateTo, setIsCreateTicketOpen, setIsQuickPayOpen } = useAppContext();
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, roles: ['all'] },
    { id: 'tickets', label: 'Citations & Tickets', icon: <Ticket className="w-4 h-4" />, roles: ['all'] },
    { id: 'vehicles', label: 'Vehicle Registry', icon: <Car className="w-4 h-4" />, roles: ['ADMIN', 'OFFICER', 'SUPERVISOR'] },
    { id: 'payments', label: 'Fee Collections', icon: <CreditCard className="w-4 h-4" />, roles: ['all'] },
    { id: 'violations', label: 'Infraction Codes', icon: <AlertOctagon className="w-4 h-4" />, roles: ['ADMIN', 'SUPERVISOR'] },
    { id: 'reports', label: 'Executive Analytics', icon: <BarChart3 className="w-4 h-4" />, roles: ['ADMIN', 'SUPERVISOR'] },
    { id: 'users', label: 'Staff Management', icon: <Users className="w-4 h-4" />, roles: ['ADMIN'] },
    { id: 'settings', label: 'System Settings', icon: <Settings className="w-4 h-4" />, roles: ['all'] }
  ];

  const userRole = user?.role || 'ADMIN';
  const filteredNav = navItems.filter(item => item.roles.includes('all') || item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 shrink-0 flex flex-col h-screen border-r border-slate-800 sticky top-0 select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-bold text-white tracking-tight">ParkGuard</h1>
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              v2.4
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Municipal Enforcement OS</p>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="px-4 pt-4 pb-2 space-y-2">
        {(userRole === 'ADMIN' || userRole === 'OFFICER' || userRole === 'SUPERVISOR') && (
          <button
            onClick={() => setIsCreateTicketOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Issue Citation
          </button>
        )}
        <button
          onClick={() => {
            setIsQuickPayOpen(true);
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition-colors cursor-pointer"
        >
          <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
          Direct Citizen Pay
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-3 overflow-y-auto space-y-1">
        <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {filteredNav.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Current Role Badge (read-only — role comes from the authenticated account) */}
      <div className="p-3 mx-3 mb-3 bg-slate-800/80 rounded-xl border border-slate-700/70 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> Signed in as
          </span>
          <span className="text-[10px] text-blue-400 font-bold uppercase">{userRole}</span>
        </div>
      </div>

      {/* Footer User Profile */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-700 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
          {user?.name?.slice(0, 2).toUpperCase() || 'PG'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">{user?.name || 'Staff Officer'}</p>
          <p className="text-[10px] text-slate-400 truncate">{user?.badgeNumber || user?.role}</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
