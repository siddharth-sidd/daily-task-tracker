import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Sparkles,
  Calendar,
  Clock,
  TrendingUp,
  Target,
  ArrowRight,
  Check,
  CheckCircle2,
} from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { isOnboardingOpen, setIsOnboardingOpen } = useTasks();
  const { user, updateUser } = useAuth();

  const [step, setStep] = useState(1);
  const [dailyGoal, setDailyGoal] = useState(5);
  const [focusHours, setFocusHours] = useState(4);
  const [timezone, setTimezone] = useState(user?.timezone || 'Asia/Kolkata');

  if (!isOnboardingOpen) return null;

  const handleFinish = async () => {
    await updateUser({
      dailyTaskGoal: dailyGoal,
      dailyFocusGoalMinutes: focusHours * 60,
      timezone,
    });
    setIsOnboardingOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col justify-between min-h-[460px]">
        {/* Step indicator pills */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-teal-600' : i < step ? 'w-3 bg-teal-200' : 'w-3 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Welcome to Daily Task Tracker */}
        {step === 1 && (
          <div className="text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Welcome to Daily Task Tracker
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Your personal productivity companion for scheduling daily tasks, monitoring focus time, and tracking actual growth.
            </p>
          </div>
        )}

        {/* Step 2: Plan your day */}
        {step === 2 && (
          <div className="text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
              <Calendar className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Plan Your Day</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Define priority levels (Low to Critical), allocate realistic estimated time blocks, and organize by categories.
            </p>
          </div>
        )}

        {/* Step 3: Track your time */}
        {step === 3 && (
          <div className="text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Track Your Time</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              One-tap stopwatch records actual focused hours. Pauses exclude idle breaks, giving honest time comparisons.
            </p>
          </div>
        )}

        {/* Step 4: Build better productivity habits */}
        {step === 4 && (
          <div className="text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Build Better Habits</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Smart reminders alert you before tasks start, warn you about overdue deadlines, and celebrate milestones without notification spam.
            </p>
          </div>
        )}

        {/* Step 5: Configure your goals */}
        {step === 5 && (
          <div className="space-y-4 my-auto">
            <div className="text-center mb-2">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-2">
                <Target className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900">Set Your Goals</h2>
              <p className="text-xs text-slate-500">Tailor your baseline daily targets</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Daily Tasks Target
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Daily Focus Hours
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={focusHours}
                  onChange={(e) => setFocusHours(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 bg-white"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="UTC">UTC Universal</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
            >
              Back
            </button>
          ) : (
            <button
              onClick={() => setIsOnboardingOpen(false)}
              className="text-xs font-medium text-slate-400 hover:text-slate-600"
            >
              Skip
            </button>
          )}

          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-2xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 shadow-md shadow-teal-600/25 flex items-center gap-1.5 ml-auto"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-2xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 shadow-md shadow-teal-600/25 flex items-center gap-1.5 ml-auto"
            >
              <Check className="w-4 h-4" />
              <span>Start Tracking</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
