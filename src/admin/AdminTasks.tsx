import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { Task } from '../types/index.ts';
import {
  CheckSquare,
  Search,
  Filter,
  Clock,
  Calendar,
  AlertCircle,
  Edit2,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

export const AdminTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');

  const fetchTasks = async () => {
    try {
      const list = await api.adminTasks({
        status: statusFilter,
        priority: priorityFilter,
        search,
      });
      setTasks(list);
    } catch (e) {
      console.error('Error fetching admin tasks:', e);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter, search]);

  const handleOpenEdit = (t: Task) => {
    setEditingTask(t);
    setEditStatus(t.status);
    setEditPriority(t.priority);
  };

  const handleSaveEdit = async () => {
    if (!editingTask) return;
    await api.adminUpdateTask(editingTask.id, {
      status: editStatus as any,
      priority: editPriority as any,
    });
    setEditingTask(null);
    fetchTasks();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white">Global Task Oversight</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized tasks across all mobile client profiles with audit logging.
          </p>
        </div>
        <span className="text-xs font-mono text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-xl self-start sm:self-auto">
          {tasks.length} Tasks Listed
        </span>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search task title or category..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-hidden"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
          <option value="paused">Paused</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-hidden"
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Task List Table */}
      <div className="rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3 px-4">Task Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Scheduled Date</th>
                <th className="py-3 px-4">Est / Act</th>
                <th className="py-3 px-4 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tasks.map((t) => (
                <tr key={t.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-4">
                    <span className="font-bold text-white block">{t.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">ID: {t.id}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-semibold text-[11px]"
                      style={{
                        backgroundColor: `${t.categoryColor}20`,
                        color: t.categoryColor,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: t.categoryColor }}
                      />
                      {t.categoryName}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        t.priority === 'critical'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : t.priority === 'high'
                          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        t.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : t.status === 'overdue'
                          ? 'bg-rose-500/10 text-rose-400 animate-pulse'
                          : t.status === 'in_progress'
                          ? 'bg-teal-500/10 text-teal-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {t.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {t.date} <span className="text-slate-500">{t.startTime}</span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className="text-slate-400">{t.estimatedDurationMinutes}m</span> /{' '}
                    <span className="text-teal-400 font-bold">{t.actualDurationMinutes}m</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(t)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition"
                    >
                      Edit Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-950 border border-slate-800 p-5 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-sm">Administrative Task Modification</h3>
            <p className="text-xs text-slate-400">
              Modifying "{editingTask.title}". This change will be logged in the immutable audit trail.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                  <option value="paused">Paused</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Priority</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditingTask(null)}
                className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-1.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-500"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
