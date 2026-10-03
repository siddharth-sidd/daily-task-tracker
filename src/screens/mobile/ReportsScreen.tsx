import React, { useState, useEffect } from 'react';
import { useTasks } from '../../context/TaskContext.tsx';
import { api } from '../../api/client.ts';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  Zap,
  Calendar,
  Layers,
} from 'lucide-react';

export const ReportsScreen: React.FC = () => {
  const { allTasks, productivity } = useTasks();
  const [rangeDays, setRangeDays] = useState<number>(7);
  const [reportsData, setReportsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api
      .getReports(rangeDays)
      .then((data) => {
        setReportsData(data);
      })
      .finally(() => setIsLoading(false));
  }, [rangeDays]);

  const summaries = reportsData?.summaries || [];
  const totalTasks = summaries.reduce((acc: number, s: any) => acc + s.totalTasks, 0);
  const totalCompleted = reportsData?.totalCompleted || 0;
  const totalFocusMinutes = reportsData?.totalFocusMinutes || 0;
  const focusHoursFormatted = `${Math.floor(totalFocusMinutes / 60)}h ${totalFocusMinutes % 60}m`;
  const avgProductivity = reportsData?.averageProductivity || productivity?.score || 78;
  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  // Find most productive day
  let bestDay = 'N/A';
  let maxScore = -1;
  summaries.forEach((s: any) => {
    if (s.productivityScore > maxScore) {
      maxScore = s.productivityScore;
      bestDay = s.date;
    }
  });

  return (
    <div className="p-4 pb-28 space-y-4">
      {/* Screen Header and Time Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Productivity Reports</h2>
          <p className="text-xs text-slate-500">Historical performance & growth analytics</p>
        </div>

        {/* Range filter buttons */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
          {[
            { label: '7D', value: 7 },
            { label: '30D', value: 30 },
            { label: '90D', value: 90 },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setRangeDays(item.value)}
              className={`px-2.5 py-1 rounded-lg transition ${
                rangeDays === item.value
                  ? 'bg-white text-teal-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Summary Cards (Section 18) */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3.5 rounded-3xl bg-white border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Completed</span>
            <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-xl font-black text-slate-900">{totalCompleted}</span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
            {completionRate}% of planned
          </span>
        </div>

        <div className="p-3.5 rounded-3xl bg-white border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Focus Time</span>
            <div className="p-1.5 rounded-xl bg-teal-50 text-teal-600">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-xl font-black text-slate-900">{focusHoursFormatted}</span>
          <span className="text-[10px] text-teal-600 font-semibold block mt-0.5">
            Logged focus sessions
          </span>
        </div>

        <div className="p-3.5 rounded-3xl bg-white border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Avg Score</span>
            <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-xl font-black text-slate-900">{avgProductivity}%</span>
          <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">
            Consistency benchmark
          </span>
        </div>

        <div className="p-3.5 rounded-3xl bg-white border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Peak Day</span>
            <div className="p-1.5 rounded-xl bg-amber-50 text-amber-600">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-sm font-black text-slate-900 truncate block">
            {bestDay !== 'N/A' ? bestDay.slice(5) : 'Today'}
          </span>
          <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
            Highest completion
          </span>
        </div>
      </div>

      {/* Chart: Tasks Completed by Day */}
      <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-sm text-slate-900">Tasks Completed by Day</h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">Last {rangeDays} days</span>
        </div>

        {/* Custom SVG Bar Chart */}
        <div className="h-40 flex items-end justify-between gap-1.5 pt-4 px-1">
          {summaries.map((s: any) => {
            const maxVal = Math.max(...summaries.map((x: any) => x.totalTasks || 1), 5);
            const heightPercent = Math.max(12, Math.round((s.totalTasks / maxVal) * 100));
            const completedHeight = Math.round((s.completed / maxVal) * 100);

            return (
              <div key={s.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[9px] font-bold text-slate-500">{s.completed}</span>
                <div
                  className="w-full max-w-[28px] bg-slate-100 rounded-t-lg relative overflow-hidden flex flex-col justify-end"
                  style={{ height: `${heightPercent}%` }}
                >
                  <div
                    className="w-full bg-gradient-to-t from-teal-600 to-emerald-500 rounded-t-lg transition-all duration-500"
                    style={{ height: `${(s.completed / Math.max(1, s.totalTasks)) * 100}%` }}
                  />
                </div>
                <span className="text-[9px] font-semibold text-slate-400 uppercase">
                  {s.date.slice(8)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart: Focus Time & Category Breakdown */}
      <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Category Distribution</h3>
          </div>
        </div>

        <div className="space-y-2">
          {reportsData?.categoryBreakdown && reportsData.categoryBreakdown.length > 0 ? (
            reportsData.categoryBreakdown.map((cat: any) => {
              const maxCatCount = Math.max(
                ...reportsData.categoryBreakdown.map((c: any) => c.count || 1)
              );
              const percent = Math.round((cat.count / maxCatCount) * 100);
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </span>
                    <span className="font-bold text-slate-900">{cat.count} tasks</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 italic">No category data available yet.</p>
          )}
        </div>
      </div>

      {/* Productivity Score Trend Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-teal-900 to-slate-900 text-white shadow-md space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
            Growth & Habit Score
          </span>
          <span className="text-xs font-bold text-teal-300">{avgProductivity}% average</span>
        </div>
        <h4 className="text-base font-bold">You are building a consistent routine</h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          High-priority task completion rate is consistently above 80%, keeping overdue debt minimal and focus momentum high.
        </p>
      </div>
    </div>
  );
};
