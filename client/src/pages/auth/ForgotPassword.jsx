// client/src/pages/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { Button } from '../../components/common/Button.jsx';
import { authApi } from '../../services/api/authApi.js';
import { Shield, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

export function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch {
      setSubmitted(true); // Always display safe message
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 mx-auto flex items-center justify-center shadow-lg mb-3">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Reset Credentials</h2>
          <p className="text-xs text-slate-500 mt-1">Authorized Municipal Officer Credential Recovery</p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-600">
              If an account with that email exists, password reset instructions have been dispatched.
            </p>
            <Button size="sm" colorScheme="brand" onClick={onBackToLogin}>
              Return to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Email</label>
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

            <Button type="submit" colorScheme="brand" size="md" className="w-full" isLoading={isSubmitting}>
              Send Reset Link
            </Button>

            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Terminal Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
