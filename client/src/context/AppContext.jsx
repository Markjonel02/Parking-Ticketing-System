// client/src/context/AppContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('dashboard');
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

  const navigateTo = useCallback((tab, options = {}) => {
    setActiveTab(tab);
    if (options.ticketId) setSelectedTicketId(options.ticketId);
    if (options.plate) setSelectedVehiclePlate(options.plate);
    setIsMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
