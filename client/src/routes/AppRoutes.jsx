// client/src/routes/AppRoutes.jsx
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { MainLayout } from '../components/layout/MainLayout.jsx';
import { Dashboard } from '../pages/dashboard/Dashboard.jsx';
import { AdminDashboard } from '../pages/dashboard/AdminDashboard.jsx';
import { Tickets } from '../pages/tickets/Tickets.jsx';
import { Vehicles } from '../pages/vehicles/Vehicles.jsx';
import { Payments } from '../pages/payments/Payments.jsx';
import { Violations } from '../pages/violations/Violations.jsx';
import { Reports } from '../pages/reports/Reports.jsx';
import { Users } from '../pages/users/Users.jsx';
import { Settings } from '../pages/settings/Settings.jsx';
import { Login } from '../pages/auth/Login.jsx';
import { ForgotPassword } from '../pages/auth/ForgotPassword.jsx';
import { RoleRoute } from './RoleRoute.jsx';

export function AppRoutes() {
  const { activeTab } = useAppContext();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' or 'forgot-password'

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
          <span>Loading ParkGuard Terminal...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authView === 'forgot-password') {
      return <ForgotPassword onBackToLogin={() => setAuthView('login')} />;
    }
    return <Login onForgotPasswordClick={() => setAuthView('forgot-password')} />;
  }

  const isAdmin = user?.role === 'ADMIN';

  function renderActiveView() {
    switch (activeTab) {
      case 'dashboard':
        return isAdmin ? <AdminDashboard /> : <Dashboard />;
      case 'tickets':
        return <Tickets />;
      case 'vehicles':
        return (
          <RoleRoute allowedRoles={['ADMIN', 'OFFICER', 'SUPERVISOR']}>
            <Vehicles />
          </RoleRoute>
        );
      case 'payments':
        return <Payments />;
      case 'violations':
        return (
          <RoleRoute allowedRoles={['ADMIN', 'SUPERVISOR']}>
            <Violations />
          </RoleRoute>
        );
      case 'reports':
        return (
          <RoleRoute allowedRoles={['ADMIN', 'SUPERVISOR']}>
            <Reports />
          </RoleRoute>
        );
      case 'users':
        return (
          <RoleRoute allowedRoles={['ADMIN']}>
            <Users />
          </RoleRoute>
        );
      case 'settings':
        return <Settings />;
      default:
        return isAdmin ? <AdminDashboard /> : <Dashboard />;
    }
  }

  return <MainLayout>{renderActiveView()}</MainLayout>;
}

export default AppRoutes;
