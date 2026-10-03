import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useTasks } from '../../context/TaskContext.tsx';
import {
  User,
  Settings,
  Bell,
  Download,
  Moon,
  Sun,
  ShieldCheck,
  FileSpreadsheet,
  FileCode,
  LogOut,
  Target,
  Smartphone,
  Save,
  Check,
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { user, isUserAdmin, updateUser, toggleAdminMode, logoutUser, setIsAccountModalOpen } = useAuth();
  const { setIsApkModalOpen, setIsOnboardingOpen } = useTasks();

  const [name, setName] = useState(user?.name || 'Task Tracker User');
  const [dailyTaskGoal, setDailyTaskGoal] = useState(user?.dailyTaskGoal || 6);
  const [dailyFocusGoal, setDailyFocusGoal] = useState(
    Math.round((user?.dailyFocusGoalMinutes || 300) / 60)
  );
  const [reminderSound, setReminderSound] = useState(user?.reminderSettings?.sound ?? true);
  const [reminderVibrate, setReminderVibrate] = useState(user?.reminderSettings?.vibrate ?? true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = async () => {
    await updateUser({
      name,
      dailyTaskGoal: Number(dailyTaskGoal),
      dailyFocusGoalMinutes: Number(dailyFocusGoal) * 60,
      reminderSettings: {
        enabled: true,
        frequency: 'normal',
        sound: reminderSound,
        vibrate: reminderVibrate,
      },
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportCSV = () => {
    window.location.href = '/api/export/tasks.csv';
  };

  const handleExportJSON = () => {
    window.location.href = '/api/export/data.json';
  };

  return (
    <div className="p-4 pb-28 space-y-4">
      {/* Profile Card */}
      <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <img
            src={
              user?.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            }
            alt={name}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-teal-500/20 shadow-sm shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 truncate">{name}</h2>
              <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold text-[10px] shrink-0">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Timezone: {user?.timezone || 'Asia/Kolkata'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAccountModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
          >
            Switch
          </button>
          <button
            onClick={logoutUser}
            className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* APK & Phone App Banner (User prompt requirement) */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-teal-700 to-emerald-600 text-white shadow-md flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-teal-200" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-100">
              Android Phone App
            </span>
          </div>
          <h3 className="text-sm font-bold">Install or Download APK</h3>
          <p className="text-xs text-teal-100">
            Run standalone on Android with splash screen and offline support.
          </p>
        </div>
        <button
          onClick={() => setIsApkModalOpen(true)}
          className="px-3.5 py-2 rounded-2xl bg-white text-teal-900 font-bold text-xs hover:bg-teal-50 shadow-sm transition shrink-0 flex items-center gap-1"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Get APK</span>
        </button>
      </div>

      {/* Daily Goals Configuration (Section 19) */}
      <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-teal-600" />
          <h3 className="font-bold text-sm text-slate-900">Daily Productivity Goals</h3>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Target Completed Tasks Per Day
            </label>
            <input
              type="number"
              min={1}
              max={25}
              value={dailyTaskGoal}
              onChange={(e) => setDailyTaskGoal(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Target Focus Time Per Day (Hours)
            </label>
            <input
              type="number"
              min={1}
              max={16}
              value={dailyFocusGoal}
              onChange={(e) => setDailyFocusGoal(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Notification Preferences (Section 12) */}
      <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-teal-600" />
          <h3 className="font-bold text-sm text-slate-900">Notification Preferences</h3>
        </div>

        <div className="space-y-2 text-xs">
          <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 cursor-pointer">
            <span className="text-slate-700 font-medium">Chime & Audio Reminders</span>
            <input
              type="checkbox"
              checked={reminderSound}
              onChange={(e) => setReminderSound(e.target.checked)}
              className="w-4 h-4 accent-teal-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 cursor-pointer">
            <span className="text-slate-700 font-medium">Haptic & Vibration Feedback</span>
            <input
              type="checkbox"
              checked={reminderVibrate}
              onChange={(e) => setReminderVibrate(e.target.checked)}
              className="w-4 h-4 accent-teal-600 rounded"
            />
          </label>
        </div>

        <button
          onClick={handleSaveSettings}
          className="w-full py-2.5 rounded-2xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 shadow-sm flex items-center justify-center gap-1.5 transition"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Settings Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Preferences</span>
            </>
          )}
        </button>
      </div>

      {/* Data Export (Section 26) */}
      <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-sm text-slate-900">Export Your Data</h3>
        </div>
        <p className="text-xs text-slate-500">
          Download your complete task history, time sessions, and productivity records.
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold transition"
          >
            <FileCode className="w-4 h-4 text-indigo-600" />
            <span>Backup JSON</span>
          </button>
        </div>

        <a
          href="/daily-task-tracker-repo.zip"
          download="daily-task-tracker-repo.zip"
          className="flex items-center justify-center gap-2 w-full p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs transition"
        >
          <Download className="w-4 h-4 text-teal-600" />
          <span>Download Full Git Repository (.zip)</span>
        </a>
      </div>

      {/* Admin Panel Link - Strictly restricted to authorized administrators */}
      {isUserAdmin && (
        <div className="p-4 rounded-3xl bg-slate-900 text-white shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <h4 className="text-xs font-bold text-white">Administrator Access</h4>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Open the centralized Web Admin Panel
            </p>
          </div>
          <button
            onClick={toggleAdminMode}
            className="px-3.5 py-1.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition"
          >
            Open Admin
          </button>
        </div>
      )}

      {/* Rerun Onboarding & Sign Out */}
      <div className="flex flex-col items-center gap-2 pt-2 text-center">
        <button
          onClick={logoutUser}
          className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out of Account</span>
        </button>
        <button
          onClick={() => setIsOnboardingOpen(true)}
          className="text-xs font-medium text-slate-400 hover:text-slate-600 underline"
        >
          View Onboarding Guide Again
        </button>
      </div>
    </div>
  );
};
