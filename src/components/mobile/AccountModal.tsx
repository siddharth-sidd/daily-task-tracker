import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  ArrowRight,
  LogOut,
  User as UserIcon,
} from 'lucide-react';

export const AccountModal: React.FC = () => {
  const { user, loginUser, logoutUser, isAccountModalOpen, setIsAccountModalOpen } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAccountModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await loginUser(email.trim().toLowerCase(), mode === 'register' ? name.trim() : undefined, password, mode === 'register');
      setEmail('');
      setPassword('');
      setName('');
      setIsAccountModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setEmail('');
    setPassword('');
    setName('');
    setMode('login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {mode === 'login' ? 'Sign In' : 'Create New Account'}
              </h2>
              <p className="text-[11px] text-slate-500">
                {mode === 'login'
                  ? 'Sign in to access your personal task tracker'
                  : 'Start tracking your daily tasks today'}
              </p>
            </div>
          </div>
          {user && (
            <button
              onClick={() => setIsAccountModalOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Current logged-in user profile banner & Logout Option */}
        {user && (
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] uppercase font-bold text-teal-600 block">
                Signed In
              </span>
              <span className="font-bold text-slate-900 block truncate">{user.name}</span>
              <span className="text-[11px] text-slate-500 block truncate">{user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 font-bold text-[11px] flex items-center gap-1 shrink-0 transition"
              title="Log out of this device"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        )}

        {/* Toggle Login vs Register */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-1.5 rounded-xl transition ${
              mode === 'login' ? 'bg-white text-teal-700 shadow-xs font-bold' : 'text-slate-500'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-1.5 rounded-xl transition ${
              mode === 'register' ? 'bg-white text-teal-700 shadow-xs font-bold' : 'text-slate-500'
            }`}
          >
            New Account
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block text-slate-700 font-bold mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:border-teal-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                minLength={12}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder={mode === 'login' ? '••••••••' : 'Create a secure password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:border-teal-500"
              />
            </div>
            <p className="text-[10px] text-slate-500">Passwords must be at least 12 characters.</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !email.trim()}
            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/25 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <span>{isSubmitting ? 'Authenticating...' : mode === 'login' ? 'Sign In to App' : 'Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
