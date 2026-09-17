// client/src/context/AppContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export const AppContext = createContext(null);

// Tabs that AppRoutes.jsx knows how to render — kept here so the URL can be
// initialized/synced against a known-good list instead of trusting any path.
export const KNOWN_TABS = [
  'dashboard',
  'tickets',
  'vehicles',
  'payments',
  'violations',
  'reports',
  'users',
  'settings'
];

function getInitialTab() {
  if (typeof window === 'undefined') return 'dashboard';
  const path = window.location.pathname.replace(/^\/+/, '');
  return KNOWN_TABS.includes(path) ? path : 'dashboard';
}

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedVehiclePlate, setSelectedVehiclePlate] = useState(null);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [isQuickPayOpen, setIsQuickPayOpen] = useState(false);
  const [quickPayTicket, setQuickPayTicket] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Global Toasts system
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ title, description, status = 'info', duration = 4000 }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, description, status }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Keep activeTab in sync when the user navigates with the browser's
  // Back/Forward buttons (navigateTo pushes a history entry per tab).
  useEffect(() => {
    function handlePopState() {
      const path = window.location.pathname.replace(/^\/+/, '');
      if (KNOWN_TABS.includes(path)) {
        setActiveTab(path);
      }
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = useCallback((tab, options = {}) => {
    setActiveTab(tab);
    if (options.ticketId) setSelectedTicketId(options.ticketId);
    if (options.plate) setSelectedVehiclePlate(options.plate);
    setIsMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof window !== 'undefined') {
      const path = `/${tab}`;
      if (window.location.pathname !== path) {
        window.history.pushState({}, '', path);
      }
    }
  }, []);

  const value = {
    activeTab,
    setActiveTab,
    navigateTo,
    isMobileNavOpen,
    setIsMobileNavOpen,
    selectedTicketId,
    setSelectedTicketId,
    selectedVehiclePlate,
    setSelectedVehiclePlate,
    isCreateTicketOpen,
    setIsCreateTicketOpen,
    isQuickPayOpen,
    setIsQuickPayOpen,
    quickPayTicket,
    setQuickPayTicket,
    refreshKey,
    triggerRefresh,
    toasts,
    showToast,
    removeToast
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
