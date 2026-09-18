// client/src/components/layout/MainLayout.jsx
import React, { useState } from 'react';
import { Sidebar } from './Sidebar.jsx';
import { TopNavigation } from './TopNavigation.jsx';
import { MobileNavigation } from './MobileNavigation.jsx';
import { useAppContext } from '../../context/AppContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { ConfirmDialog } from '../common/ConfirmDialog.jsx';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export function MainLayout({ children }) {
  const { toasts, removeToast, isLogoutConfirmOpen, setIsLogoutConfirmOpen } = useAppContext();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      <MobileNavigation />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavigation />

        {/* Dynamic Content Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const statusStyles = {
            success: 'bg-emerald-600 text-white border-emerald-700',
            error: 'bg-red-600 text-white border-red-700',
            warning: 'bg-amber-600 text-white border-amber-700',
            info: 'bg-blue-600 text-white border-blue-700'
          };

          const statusIcons = {
            success: <CheckCircle2 className="w-4 h-4 shrink-0" />,
            error: <AlertCircle className="w-4 h-4 shrink-0" />,
            warning: <AlertTriangle className="w-4 h-4 shrink-0" />,
            info: <Info className="w-4 h-4 shrink-0" />
          };

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-lg border text-xs transition-all duration-200 animate-in slide-in-from-top-3 ${
                statusStyles[toast.status] || statusStyles.info
              }`}
            >
              {statusIcons[toast.status] || statusIcons.info}
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{toast.title}</p>
                {toast.description && <p className="opacity-90 mt-0.5 leading-normal">{toast.description}</p>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 p-0.5 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Logout confirmation — rendered here (not inside TopNavigation) so
          it isn't nested under the header's backdrop-blur. backdrop-filter
          creates a new containing block for position:fixed descendants,
          which was clipping the dialog to the header's box instead of the
          full viewport. */}
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
    </div>
  );
}

export default MainLayout;
