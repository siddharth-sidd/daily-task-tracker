import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { AdminDashboardStats, AdminAuditLog } from '../types/index.ts';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  RefreshCw,
  ShieldAlert,
  Zap,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AdminAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [dash, logs] = await Promise.all([
        api.adminDashboard(),
        api.adminAuditLogs(),
      ]);
      setStats(dash);
      setRecentLogs(logs.slice(0, 5));
    } catch (e) {
      console.error('Error fetching admin dashboard:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white">System Dashboard</h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Synced
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time aggregate data across mobile clients and shared database.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards (Section 27) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Users
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{stats?.totalUsers ?? '...'}</div>
          <span className="text-[11px] text-blue-400 font-medium block mt-1">
            {stats?.activeUsers ?? 0} active users
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tasks Completed
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{stats?.completedTasks ?? '...'}</div>
          <span className="text-[11px] text-emerald-400 font-medium block mt-1">
            {stats?.overallCompletionRate ?? 0}% global completion
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Focus Hours
            </span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{stats?.totalFocusHours ?? '...'}h</div>
          <span className="text-[11px] text-teal-400 font-medium block mt-1">
            Logged across sessions
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Overdue Tasks
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{stats?.overdueTasks ?? '...'}</div>
          <span className="text-[11px] text-rose-400 font-medium block mt-1">
            Needs user attention
          </span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Task Trends Chart */}
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-400" />
              <h2 className="font-bold text-sm text-white">Daily Task Creation & Completion</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Past 7 Days</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2">
            {stats?.taskTrends?.map((item) => {
              const maxVal = Math.max(...(stats?.taskTrends?.map((t) => Math.max(t.created, t.completed)) || [1]), 4);
              const createdHeight = Math.max(8, Math.round((item.created / maxVal) * 100));
              const completedHeight = Math.max(8, Math.round((item.completed / maxVal) * 100));

              return (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1 h-32">
                    {/* Created bar */}
                    <div
                      title={`Created: ${item.created}`}
                      className="w-3 rounded-t bg-slate-700 hover:bg-slate-600 transition-all"
                      style={{ height: `${createdHeight}%` }}
                    />
                    {/* Completed bar */}
                    <div
                      title={`Completed: ${item.completed}`}
                      className="w-3 rounded-t bg-teal-500 hover:bg-teal-400 transition-all"
                      style={{ height: `${completedHeight}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase">
                    {item.date}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-slate-700" /> Created
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-teal-500" /> Completed
            </span>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h2 className="font-bold text-sm text-white">Status Breakdown Across All Tasks</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Total: {stats?.totalTasks ?? 0}
            </span>
          </div>

          <div className="space-y-2.5 pt-2">
            {stats?.statusDistribution?.map((dist) => {
              const total = stats.totalTasks || 1;
              const percent = Math.round((dist.count / total) * 100);
              return (
                <div key={dist.status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dist.color }} />
                      {dist.status}
                    </span>
                    <span className="font-bold font-mono text-white">
                      {dist.count} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%`, backgroundColor: dist.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Administrative Audit Logs (Section 28 & 32) */}
      <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            <h2 className="font-bold text-sm text-white">Recent Administrative Audit Logs</h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Immutable Log Trail</span>
        </div>

        <div className="space-y-2">
          {recentLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-white block">{log.action}</span>
                <span className="text-[11px] text-slate-400">{log.details}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
