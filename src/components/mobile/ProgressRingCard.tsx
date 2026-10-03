import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext.tsx';
import { Clock, CheckCircle2, TrendingUp, Info, ArrowUpRight, Flame } from 'lucide-react';

export const ProgressRingCard: React.FC = () => {
  const { summary, productivity, tasks, setIsTomorrowPlanOpen } = useTasks();
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  const completed = summary?.completed || 0;
  const inProgress = summary?.inProgress || 0;
  const pending = summary?.pending || 0;
  const overdue = summary?.overdue || 0;
  const total = summary?.totalTasks || tasks.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const productivityScore = productivity?.score || 0;

  // Format hours and minutes
  const plannedHours = Math.round(((summary?.plannedMinutes || 0) / 60) * 10) / 10;
  const actualMinutes = summary?.actualMinutes || 0;
  const actualHoursFormatted = `${Math.floor(actualMinutes / 60)}h ${actualMinutes % 60}m`;
  const remainingMinutes = Math.max(0, (summary?.plannedMinutes || 0) - actualMinutes);
  const remainingFormatted = `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m`;

  // SVG Progress Ring calculations
  const radius = 38;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <>
      <div className="mx-4 my-3 p-4.5 rounded-3xl bg-white shadow-sm border border-slate-100 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/5 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">Today's Progress</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700">
              <Flame className="w-2.5 h-2.5 text-teal-600" />
              Score: {productivityScore}%
            </span>
          </div>
          <button
            onClick={() => setShowFormulaModal(true)}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-teal-600 transition"
            title="How is this score calculated?"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Formula</span>
          </button>
        </div>

        {/* Middle row: Progress Ring + Stats */}
        <div className="flex items-center justify-between gap-4">
          {/* Progress Ring with percentage */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
              <circle
                stroke="#f1f5f9"
                fill="transparent"
                strokeWidth={strokeWidth}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke="url(#ringGrad)"
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.6s ease' }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <defs>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0d9488" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-lg font-black text-slate-900 leading-none">
                {completionRate}%
              </span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-tight mt-0.5">
                {completed}/{total}
              </span>
            </div>
          </div>

          {/* Status Breakdown badges */}
          <div className="flex-1 grid grid-cols-3 gap-2">
            <div className="p-2 rounded-2xl bg-emerald-50/70 border border-emerald-100/60 text-center">
              <span className="text-[10px] font-medium text-emerald-600 uppercase tracking-tight block">
                Done
              </span>
              <span className="text-sm font-bold text-emerald-800">{completed}</span>
            </div>

            <div className="p-2 rounded-2xl bg-teal-50/70 border border-teal-100/60 text-center">
              <span className="text-[10px] font-medium text-teal-600 uppercase tracking-tight block">
                In Prog
              </span>
              <span className="text-sm font-bold text-teal-800">{inProgress}</span>
            </div>

            <div className="p-2 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tight block">
                Pending
              </span>
              <span className="text-sm font-bold text-slate-700">{pending}</span>
            </div>
          </div>
        </div>

        {/* Productivity summary: Planned vs Actual focus time */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Planned</span>
            <span className="font-semibold text-slate-700">{plannedHours}h</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Focus Time</span>
            <span className="font-semibold text-teal-700">{actualHoursFormatted}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Remaining</span>
            <span className="font-semibold text-slate-500">{remainingFormatted}</span>
          </div>
        </div>
      </div>

      {/* Transparent Formula Modal (RULE 10 & Section 17 & 46) */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Productivity Score Formula</h3>
              </div>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Your score is computed transparently based on 4 measurable productivity factors with no arbitrary weighting:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-700">Task Completion Rate (40%)</span>
                <span className="font-bold text-teal-700">{productivity?.taskCompletionRate || 0}%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-700">Priority-Weighted Impact (30%)</span>
                <span className="font-bold text-teal-700">{productivity?.priorityWeightedScore || 0}%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-700">Focus Goal Attainment (20%)</span>
                <span className="font-bold text-teal-700">{productivity?.focusAchievementRate || 0}%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-700">Consistency & No Overdue (10%)</span>
                <span className="font-bold text-teal-700">{productivity?.consistencyRate || 0}%</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-between">
              <span className="text-xs font-bold text-teal-900">Total Today's Score:</span>
              <span className="text-base font-extrabold text-teal-700">{productivityScore}%</span>
            </div>

            <button
              onClick={() => setShowFormulaModal(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
