// client/src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { Button } from '../../components/common/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { Shield, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';

export function Login({ onLoginSuccess, onForgotPasswordClick }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@parkguard.gov');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);
    if (res.success) {
      onLoginSuccess?.(res.user);
    } else {
      setError(res.message || 'Invalid credentials');
    }
  }

  function setDemoCredentials(demoEmail) {
    setEmail(demoEmail);
    setPassword('password123');
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-8">
        {/* Brand Icon & Heading */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 mb-3">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">ParkGuard Authority</h2>
          <p className="text-xs text-slate-500 mt-1">Official Municipal Citation & Patrol Terminal</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Municipal Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@parkguard.gov"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              {onForgotPasswordClick && (
                <button
                  type="button"
                  onClick={onForgotPasswordClick}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            colorScheme="brand"
            size="md"
            className="w-full"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Authenticate Terminal
          </Button>
        </form>

        {/* Quick Demo Staff Logins */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
            Quick Simulation Credentials
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setDemoCredentials('admin@parkguard.gov')}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-left font-medium"
            >
              👑 Admin (Vance)
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('elena.rostova@parkguard.gov')}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-left font-medium"
            >
              👮 Officer (Elena)
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('sarah.sterling@parkguard.gov')}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-left font-medium"
            >
              ⚖️ Supervisor (Sarah)
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('julian.perez@parkguard.gov')}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-left font-medium"
            >
              💳 Cashier (Julian)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
