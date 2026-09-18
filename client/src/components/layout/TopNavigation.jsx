// client/src/components/layout/TopNavigation.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Search,
  RotateCw,
  Bell,
  ShieldCheck,
  CheckCircle2,
  Car,
  FileText,
  LogOut,
  Loader2
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { Button } from '../common/Button.jsx';
import { ConfirmDialog } from '../common/ConfirmDialog.jsx';
import { ticketApi } from '../../services/api/ticketApi.js';
import { vehicleApi } from '../../services/api/vehicleApi.js';

// Live results only start showing once the query reaches this length.
const MIN_LIVE_SEARCH_CHARS = 3;

export function TopNavigation() {
  const { setIsMobileNavOpen, triggerRefresh, navigateTo } = useAppContext();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Live search-as-you-type dropdown state
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [ticketResults, setTicketResults] = useState([]);
  const [vehicleResults, setVehicleResults] = useState([]);
  const searchBoxRef = useRef(null);
  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      setIsLogoutConfirmOpen(false);
    }
  }

  // Fire the live lookup once the query is at least MIN_LIVE_SEARCH_CHARS
  // long, and render the matches in a dropdown under the search bar.
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed.length < MIN_LIVE_SEARCH_CHARS) {
      setTicketResults([]);
      setVehicleResults([]);
      setIsResultsOpen(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);
    Promise.all([
      ticketApi.getTickets({ search: trimmed, limit: 5 }).catch(() => null),
      vehicleApi.getVehicles({ search: trimmed, limit: 5 }).catch(() => null)
    ])
      .then(([ticketRes, vehicleRes]) => {
        if (cancelled) return;
        setTicketResults(ticketRes?.success ? ticketRes.data || [] : []);
        setVehicleResults(vehicleRes?.success ? vehicleRes.data || [] : []);
        setIsResultsOpen(true);
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // Close the dropdown on outside click.
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setIsResultsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function goToTicket(ticketNumber) {
    navigateTo('tickets', { ticketId: ticketNumber });
    setSearchQuery('');
    setIsResultsOpen(false);
  }

  function goToVehicle(plate) {
    navigateTo('vehicles', { plate });
    setSearchQuery('');
    setIsResultsOpen(false);
  }

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
    setIsResultsOpen(false);
  }

  const hasLiveResults = ticketResults.length > 0 || vehicleResults.length > 0;

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
      <form
        onSubmit={handleQuickSearch}
        className="flex-1 max-w-md hidden md:block"
        ref={searchBoxRef}
      >
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (ticketResults.length > 0 || vehicleResults.length > 0) setIsResultsOpen(true);
            }}
            placeholder="Quick search by plate (e.g. 7XYZ890) or citation #..."
            className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 placeholder-slate-400 pl-9 pr-20 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded transition-colors"
          >
            Lookup
          </button>

          {/* Live results dropdown — appears once 3+ characters are typed */}
          {isResultsOpen && searchQuery.trim().length >= MIN_LIVE_SEARCH_CHARS && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-lg z-30 max-h-80 overflow-y-auto">
              {isSearching && (
                <div className="flex items-center gap-2 px-3 py-3 text-xs text-slate-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Searching...
                </div>
              )}

              {!isSearching && !hasLiveResults && (
                <div className="px-3 py-3 text-xs text-slate-400">
                  No matching citations or vehicles found.
                </div>
              )}

              {!isSearching && vehicleResults.length > 0 && (
                <div className="py-1">
                  <p className="px-3 pt-1.5 pb-1 text-[10px] font-bold uppercase text-slate-400">
                    Vehicles
                  </p>
                  {vehicleResults.map((v) => (
                    <button
                      key={v.id || v.plateNumber}
                      type="button"
                      onClick={() => goToVehicle(v.plateNumber)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-50 transition-colors"
                    >
                      <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono font-semibold text-slate-800">{v.plateNumber}</span>
                      <span className="text-slate-400">
                        {[v.make, v.model].filter(Boolean).join(' ')}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {!isSearching && ticketResults.length > 0 && (
                <div className="py-1 border-t border-slate-100">
                  <p className="px-3 pt-1.5 pb-1 text-[10px] font-bold uppercase text-slate-400">
                    Citations
                  </p>
                  {ticketResults.map((t) => (
                    <button
                      key={t.id || t.ticketNumber}
                      type="button"
                      onClick={() => goToTicket(t.ticketNumber)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-50 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono font-semibold text-slate-800">{t.ticketNumber}</span>
                      <span className="text-slate-400">{t.plateNumber}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
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

      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
        title="Log Out"
        message="Are you sure you want to log out of ParkGuard?"
        confirmText="Yes, Log Out"
        cancelText="Cancel"
        colorScheme="red"
        type="warning"
        isLoading={isLoggingOut}
      />
    </header>
  );
}

export default TopNavigation;
