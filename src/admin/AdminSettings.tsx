import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { SystemSettingsConfig } from '../types/index.ts';
import { Settings, Save, Check, ShieldAlert } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettingsConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api.adminSettings().then((s) => setSettings(s));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      const updated = await api.adminUpdateSettings(settings);
      setSettings(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings) {
    return <div className="p-8 text-slate-400">Loading system settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white">System Settings</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Global operational defaults, reminder intervals, and application limits.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Default Task Duration (Minutes)
            </label>
            <input
              type="number"
              value={settings.defaultTaskDurationMinutes}
              onChange={(e) =>
                setSettings({ ...settings, defaultTaskDurationMinutes: Number(e.target.value) })
              }
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Max Daily Reminder Frequency (Per User)
            </label>
            <input
              type="number"
              value={settings.maxDailyReminderFrequency}
              onChange={(e) =>
                setSettings({ ...settings, maxDailyReminderFrequency: Number(e.target.value) })
              }
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Week Start Day</label>
            <select
              value={settings.weekStartDay}
              onChange={(e) =>
                setSettings({ ...settings, weekStartDay: e.target.value as any })
              }
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
            >
              <option value="monday">Monday</option>
              <option value="sunday">Sunday</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Default Priority</label>
            <select
              value={settings.defaultPriority}
              onChange={(e) =>
                setSettings({ ...settings, defaultPriority: e.target.value as any })
              }
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800 cursor-pointer">
            <div>
              <span className="font-bold text-white block">Allow Public User Registration</span>
              <span className="text-[11px] text-slate-400">
                Permit new users to self-register into the mobile task tracker.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.allowUserRegistration}
              onChange={(e) =>
                setSettings({ ...settings, allowUserRegistration: e.target.checked })
              }
              className="w-4 h-4 accent-teal-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800 cursor-pointer">
            <div>
              <span className="font-bold text-white block">Maintenance Mode</span>
              <span className="text-[11px] text-slate-400">
                Puts non-admin client traffic on temporary hold for system maintenance.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) =>
                setSettings({ ...settings, maintenanceMode: e.target.checked })
              }
              className="w-4 h-4 accent-teal-600 rounded"
            />
          </label>
        </div>

        <div className="pt-2 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-teal-600/20"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Settings Saved</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
