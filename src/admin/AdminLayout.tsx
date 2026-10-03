import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  BarChart3,
  Layers,
  Settings,
  ShieldAlert,
  Smartphone,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ExternalLink,
} from 'lucide-react';

export type AdminSection =
  | 'dashboard'
  | 'users'
  | 'tasks'
  | 'analytics'
  | 'categories'
  | 'settings'
  | 'logs';

interface AdminLayoutProps {
  currentSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentSection,
  onSelectSection,
  children,
}) => {
  const { adminUser, setViewMode, logoutAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
    { id: 'tasks', label: 'Task Oversight', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'analytics', label: 'System Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'categories', label: 'Categories & Rules', icon: <Layers className="w-4 h-4" /> },
    { id: 'logs', label: 'Audit Logs', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'settings', label: 'System Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-teal-500 selection:text-white">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center font-bold text-white shadow-xs">
            TT
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">Admin Console</h1>
            <p className="text-[10px] text-teal-400 font-mono">Daily Task Tracker</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('mobile_device')}
            className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-300 font-bold text-xs border border-teal-500/30 flex items-center gap-1"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile App</span>
          </button>
          <button
            onClick={() => void logoutAdmin()}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-2xl text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-semibold transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out of admin</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? 'flex' : 'hidden'
        } md:flex flex-col w-full md:w-64 bg-slate-950 border-r border-slate-800 shrink-0 min-h-screen p-4 justify-between`}
      >
        <div className="space-y-6">
          {/* Brand header */}
          <div className="hidden md:flex items-center gap-3 px-2 pt-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center font-black text-white shadow-md shadow-teal-500/20 text-lg">
              TT
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Daily Task Tracker</h1>
              <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 block font-semibold">
                Central Web Admin
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition ${
                    active
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  }`}
                >
                  <span className={active ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom utility: Return to Phone App & Admin Profile */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <button
            onClick={() => setViewMode('mobile_device')}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold transition shadow-xs"
          >
            <Smartphone className="w-4 h-4" />
            <span>Open Mobile App View</span>
          </button>

          <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-900/60 border border-slate-800">
            <img
              src={
                adminUser?.avatarUrl ||
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
              }
              alt={adminUser?.name}
              className="w-9 h-9 rounded-xl object-cover ring-1 ring-teal-500/30"
            />
            <div className="overflow-hidden min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{adminUser?.name}</p>
              <p className="text-[10px] text-teal-400 font-mono uppercase tracking-wider">
                {adminUser?.role}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 md:p-8 overflow-y-auto max-h-screen">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
};
