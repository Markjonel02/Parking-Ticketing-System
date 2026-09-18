// client/src/components/layout/TopNavigation.jsx
import React, { useState } from 'react';
import {
  Menu,
  Search,
  RotateCw,
  Bell,
  ShieldCheck,
  CheckCircle2,
  Car,
  FileText,
  LogOut
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { Button } from '../common/Button.jsx';

export function TopNavigation() {
  const { setIsMobileNavOpen, triggerRefresh, navigateTo, setIsLogoutConfirmOpen } = useAppContext();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  function handleQuickSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const clean = searchQuery.trim().toUpperCase();

    // If starts with PKG-, route directly to tickets
    if (clean.startsWith('PKG-') || clean.includes('-')) {
      navigateTo('tickets', { ticketId: clean });
    } else {
      // Plate search
      navigateTo('vehicles', { plate: clean });
    }
    setSearchQuery('');
  }

  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-xs px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-xs">
      {/* Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsMobileNavOpen(true)}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Metropolitan Authority
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500">Live Enforcement Terminal</span>
        </div>
      </div>

      {/* Center Search Bar */}
      <form onSubmit={handleQuickSearch} className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Quick search by plate (e.g. 7XYZ890) or citation #..."
            className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 placeholder-slate-400 pl-9 pr-20 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded transition-colors"
          >
            Lookup
          </button>
        </div>
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Backend Connected Indicator */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          REST API Online
        </div>

        {/* Refresh button */}
        <button
          onClick={triggerRefresh}
          title="Refresh live data"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-none">{user?.name || 'Staff User'}</p>
            <span className="text-[10px] font-medium text-slate-500">{user?.role || 'Guest'}</span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => setIsLogoutConfirmOpen(true)}
          title="Log out"
          aria-label="Log out"
          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

export default TopNavigation;
