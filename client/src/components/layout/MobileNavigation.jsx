// client/src/components/layout/MobileNavigation.jsx
import React, { useEffect } from 'react';
import {
  X,
  LayoutDashboard,
  Ticket,
  Car,
  CreditCard,
  AlertOctagon,
  BarChart3,
  Users,
  Settings,
  Shield,
  PlusCircle
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';

export function MobileNavigation() {
  const { isMobileNavOpen, setIsMobileNavOpen, activeTab, navigateTo, setIsCreateTicketOpen } = useAppContext();
  const { user, switchDemoRole } = useAuth();

  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileNavOpen]);

  if (!isMobileNavOpen) return null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'tickets', label: 'Citations & Tickets', icon: <Ticket className="w-5 h-5" /> },
    { id: 'vehicles', label: 'Vehicle Registry', icon: <Car className="w-5 h-5" /> },
    { id: 'payments', label: 'Fee Collections', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'violations', label: 'Infraction Codes', icon: <AlertOctagon className="w-5 h-5" /> },
    { id: 'reports', label: 'Analytics Reports', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'users', label: 'Staff Management', icon: <Users className="w-5 h-5" /> },
    { id: 'settings', label: 'System Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsMobileNavOpen(false)}
      />

      {/* Slide Drawer */}
      <div className="relative w-4/5 max-w-xs bg-slate-900 text-white flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">ParkGuard</h2>
              <p className="text-[10px] text-slate-400">Mobile Terminal</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileNavOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Issue */}
        <div className="p-3 border-b border-slate-800">
          <button
            onClick={() => {
              setIsMobileNavOpen(false);
              setIsCreateTicketOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold text-white shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Issue Citation
          </button>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left min-h-[44px] ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Role Switcher */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70">
          <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
            Switch Role Perspective:
          </label>
          <select
            value={user?.role || 'ADMIN'}
            onChange={(e) => switchDemoRole(e.target.value)}
            className="w-full bg-slate-800 text-white border border-slate-700 text-xs rounded-lg p-2"
          >
            <option value="ADMIN">Admin</option>
            <option value="OFFICER">Officer</option>
            <option value="SUPERVISOR">Supervisor</option>
            <option value="CASHIER">Cashier</option>
            <option value="CITIZEN">Citizen</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default MobileNavigation;
