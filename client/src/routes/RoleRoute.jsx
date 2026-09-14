// client/src/routes/RoleRoute.jsx
import React from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../components/common/Button.jsx';

export function RoleRoute({ allowedRoles = [], children }) {
  const { user, switchDemoRole } = useAuth();

  if (!user) return null;

  if (user.role === 'ADMIN' || allowedRoles.includes(user.role)) {
    return children;
  }

  return (
    <div className="p-8 text-center bg-white rounded-xl border border-slate-200 max-w-md mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900">Restricted Authority Section</h3>
      <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
        Your current active role ({user.role}) does not possess clearance to view this module.
        Clearance required: {allowedRoles.join(', ')}.
      </p>
      <Button
        size="sm"
        colorScheme="brand"
        onClick={() => switchDemoRole(allowedRoles[0] || 'ADMIN')}
      >
        Switch to {allowedRoles[0] || 'ADMIN'} Role
      </Button>
    </div>
  );
}

export default RoleRoute;
