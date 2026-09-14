// client/src/routes/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { Login } from '../pages/auth/Login.jsx';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-xs">
        Authenticating ParkGuard terminal...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return children;
}

export default ProtectedRoute;
