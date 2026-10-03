import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useTasks } from '../../context/TaskContext.tsx';
import {
  Bell,
  Download,
  Smartphone,
  Maximize2,
  ShieldAlert,
  Wifi,
  WifiOff,
  Sparkles,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isUserAdmin, viewMode, setViewMode, setIsAccountModalOpen } = useAuth();
  const {
    unreadNotifCount,
    setIsNotificationCenterOpen,
    setIsApkModalOpen,
    isOnline,
    isSyncing,
    summary,
  } = useTasks();

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const userName = user?.name || 'Task Tracker User';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3">
      {/* Top utility row: Offline / view switch / APK download */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100/80 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
              {isSyncing ? 'Syncing...' : 'Online'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
              <WifiOff className="w-3 h-3 text-amber-500" />
              Offline (Cached)
            </span>
          )}
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 font-medium">{formattedDate}</span>
        </div>

        {/* Viewport & Platform Switcher */}
        <div className="flex items-center gap-1.5">
          {/* APK Phone button */}
          <button
            onClick={() => setIsApkModalOpen(true)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold hover:bg-teal-100 transition shadow-xs"
            title="Download Phone APK"
          >
            <Download className="w-3 h-3" />
            <span>Get APK</span>
          </button>

          {/* Switch to Web Admin - Strictly restricted to authorized admin users */}
          {isUserAdmin && (
            <button
              onClick={() => setViewMode('admin_panel')}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition"
              title="Open Web Admin Panel (Admin Only)"
            >
              <ShieldAlert className="w-3 h-3 text-indigo-600" />
              <span className="hidden sm:inline">Admin Panel</span>
              <span className="sm:hidden">Admin</span>
            </button>
          )}

          {/* Toggle Device Frame vs Full */}
          <button
            onClick={() => setViewMode(viewMode === 'mobile_device' ? 'mobile_full' : 'mobile_device')}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title={viewMode === 'mobile_device' ? 'Switch to Full Mobile Screen' : 'Switch to Phone Frame'}
          >
            {viewMode === 'mobile_device' ? (
              <Maximize2 className="w-3.5 h-3.5" />
            ) : (
              <Smartphone className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main greeting row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsAccountModalOpen(true)}
          className="flex items-center gap-3 text-left hover:opacity-85 transition group p-1 -m-1 rounded-2xl hover:bg-slate-100/50"
          title="Switch User / Sign In"
        >
          <div className="relative">
            <img
              src={
                user?.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              }
              alt={userName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-teal-500/20 shadow-xs"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-teal-600 tracking-wide uppercase">
                {getGreeting()}
              </p>
              <span className="text-[10px] text-slate-400 font-normal underline">
                (Switch)
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-teal-700 transition">
              {userName}
            </h1>
          </div>
        </button>

        {/* Right actions: Notifications */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNotificationCenterOpen(true)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-teal-700 hover:bg-teal-50/80 transition"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
                {unreadNotifCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
