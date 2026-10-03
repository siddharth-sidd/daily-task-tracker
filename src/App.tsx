import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { TaskProvider, useTasks } from './context/TaskContext.tsx';

// Mobile Screens & Components
import { Header } from './components/mobile/Header.tsx';
import { BottomNav } from './components/mobile/BottomNav.tsx';
import { ActiveTimerBanner } from './components/mobile/ActiveTimerBanner.tsx';
import { HomeScreen } from './screens/mobile/HomeScreen.tsx';
import { CalendarScreen } from './screens/mobile/CalendarScreen.tsx';
import { ReportsScreen } from './screens/mobile/ReportsScreen.tsx';
import { ProfileScreen } from './screens/mobile/ProfileScreen.tsx';
import { AddTaskModal } from './screens/mobile/AddTaskModal.tsx';
import { TaskDetailModal } from './screens/mobile/TaskDetailModal.tsx';
import { NotificationCenterModal } from './screens/mobile/NotificationCenterModal.tsx';
import { TomorrowPlanningModal } from './screens/mobile/TomorrowPlanningModal.tsx';
import { OnboardingModal } from './screens/mobile/OnboardingModal.tsx';
import { ApkDownloadModal } from './screens/mobile/ApkDownloadModal.tsx';
import { AccountModal } from './components/mobile/AccountModal.tsx';

// Admin Panel Screens & Components
import { AdminLayout, AdminSection } from './admin/AdminLayout.tsx';
import { AdminDashboard } from './admin/AdminDashboard.tsx';
import { AdminUsers } from './admin/AdminUsers.tsx';
import { AdminTasks } from './admin/AdminTasks.tsx';
import { AdminCategories } from './admin/AdminCategories.tsx';
import { AdminSettings } from './admin/AdminSettings.tsx';
import { AdminLogs } from './admin/AdminLogs.tsx';
import { AdminLogin } from './admin/AdminLogin.tsx';

// Icons for Phone Frame Bar
import { Wifi, BatteryMedium, Signal, Smartphone, ShieldCheck, Download, Maximize2 } from 'lucide-react';

function AppContent() {
  const { viewMode, setViewMode, isUserAdmin, isAdminLoading, isLoading, user } = useAuth();
  const { activeTab, setIsApkModalOpen } = useTasks();
  const [adminSection, setAdminSection] = useState<AdminSection>('dashboard');

  // If in Admin Panel mode, render the Web Admin Panel (restricted to admin accounts)
  if (viewMode === 'admin_panel') {
    if (isAdminLoading) {
      return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-sm text-slate-300">Checking administrator session…</div>;
    }

    if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-500">Loading your account…</div>;
    }
    if (!user) return <AccountModal />;

    if (!isUserAdmin) {
      return <AdminLogin onReturnToApp={() => setViewMode('mobile_device')} />;
    }

    return (
      <AdminLayout currentSection={adminSection} onSelectSection={setAdminSection}>
        {adminSection === 'dashboard' && <AdminDashboard />}
        {adminSection === 'users' && <AdminUsers />}
        {adminSection === 'tasks' && <AdminTasks />}
        {adminSection === 'analytics' && <AdminDashboard />}
        {adminSection === 'categories' && <AdminCategories />}
        {adminSection === 'settings' && <AdminSettings />}
        {adminSection === 'logs' && <AdminLogs />}
      </AdminLayout>
    );
  }

  // Render Mobile Application
  const renderScreen = () => {
    switch (activeTab) {
      case 'calendar':
        return <CalendarScreen />;
      case 'reports':
        return <ReportsScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'home':
      default:
        return <HomeScreen />;
    }
  };

  const mobileContent = (
    <div className="flex flex-col min-h-full bg-slate-50 relative">
      <Header />
      <main className="flex-1 overflow-y-auto">{renderScreen()}</main>
      <ActiveTimerBanner />
      <BottomNav />

      {/* Global Modals */}
      <AddTaskModal />
      <TaskDetailModal />
      <NotificationCenterModal />
      <TomorrowPlanningModal />
      <OnboardingModal />
      <ApkDownloadModal />
      <AccountModal />
    </div>
  );

  // If in Phone Device Simulator frame mode
  if (viewMode === 'mobile_device') {
    return (
      <div className="min-h-screen bg-slate-900 py-6 px-4 flex flex-col items-center justify-center">
        {/* Top Control Switcher Bar */}
        <div className="w-full max-w-sm mb-3 flex items-center justify-between px-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-300">Daily Task Tracker</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsApkModalOpen(true)}
              className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 font-bold border border-teal-500/30 flex items-center gap-1 transition"
            >
              <Download className="w-3 h-3" />
              <span>Get APK</span>
            </button>
            {isUserAdmin && (
              <button
                onClick={() => setViewMode('admin_panel')}
                className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 font-bold border border-indigo-500/30 flex items-center gap-1 transition"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Admin</span>
              </button>
            )}
            <button
              onClick={() => setViewMode('mobile_full')}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Expand to Full Viewport"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Device Frame */}
        <div className="w-full max-w-[410px] h-[840px] max-h-[92vh] bg-black rounded-[48px] p-3 shadow-2xl ring-1 ring-slate-800 relative overflow-hidden flex flex-col">
          {/* Hardware Notch / Speaker & Camera */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-5 bg-black rounded-b-2xl z-50 flex items-center justify-center">
            <div className="w-12 h-1 bg-slate-800 rounded-full" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 ml-3" />
          </div>

          {/* Device Status Bar */}
          <div className="h-6 bg-white flex items-center justify-between px-6 text-[10px] font-bold text-slate-800 rounded-t-[36px] z-40 shrink-0 select-none">
            <span>9:41</span>
            <div className="flex items-center gap-1.5 text-slate-700">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <BatteryMedium className="w-4 h-4" />
            </div>
          </div>

          {/* Screen Content Wrapper */}
          <div className="flex-1 bg-slate-50 overflow-y-auto rounded-b-[36px] relative no-scrollbar">
            {mobileContent}
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="w-32 h-1 bg-slate-700 rounded-full mx-auto my-1.5 shrink-0" />
        </div>
      </div>
    );
  }

  // Full Mobile Screen mode
  return <div className="min-h-screen bg-slate-50 max-w-lg mx-auto shadow-xl">{mobileContent}</div>;
}

export default function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </AuthProvider>
  );
}
