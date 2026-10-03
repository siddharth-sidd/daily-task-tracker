import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext.tsx';
import { DateStrip } from '../../components/mobile/DateStrip.tsx';
import { ProgressRingCard } from '../../components/mobile/ProgressRingCard.tsx';
import { TaskCard } from '../../components/mobile/TaskCard.tsx';
import {
  Search,
  Filter,
  Plus,
  AlertTriangle,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  ListFilter,
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    filteredTasks,
    tasks,
    selectedDate,
    setSelectedDate,
    setIsAddTaskOpen,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    categoryFilter,
    setCategoryFilter,
    categories,
    allTasks,
    setIsTomorrowPlanOpen,
    summary,
  } = useTasks();

  const [seeAllPriority, setSeeAllPriority] = useState(false);
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayStr;

  // Detect overdue tasks
  const overdueTasks = allTasks.filter((t) => t.status === 'overdue' && !t.isArchived);

  // Priority tasks (critical and high)
  const priorityTasks = filteredTasks.filter(
    (t) => t.priority === 'critical' || t.priority === 'high'
  );
  const displayedPriorityTasks = seeAllPriority ? priorityTasks : priorityTasks.slice(0, 3);

  // General timeline tasks
  const timelineTasks = filteredTasks;

  return (
    <div className="pb-28">
      {/* Horizontal Date Selector */}
      <DateStrip />

      {/* Overdue Warning Banner (RULE 3 & Section 13) */}
      {overdueTasks.length > 0 && (
        <div className="mx-4 mt-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-between gap-3 shadow-xs animate-slideDown">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-900">
                {overdueTasks.length} Task{overdueTasks.length > 1 ? 's' : ''} Overdue
              </p>
              <p className="text-[11px] text-rose-600 line-clamp-1">
                "{overdueTasks[0]?.title}" needs review or rescheduling.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter(statusFilter === 'overdue' ? 'all' : 'overdue')}
            className="px-2.5 py-1.5 rounded-xl bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700 transition shrink-0"
          >
            Review
          </button>
        </div>
      )}

      {/* Today's Progress Card */}
      <ProgressRingCard />

      {/* Search and Quick Filters Bar */}
      <div className="px-4 mb-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, categories, tags..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-white border border-slate-200/80 focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 placeholder-slate-400 text-slate-800 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
            className={`p-2 rounded-2xl border transition ${
              statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all'
                ? 'bg-teal-50 border-teal-500 text-teal-700'
                : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50'
            }`}
            title="Filter tasks"
          >
            <ListFilter className="w-4 h-4" />
          </button>
        </div>

        {/* Expandable Filters */}
        {showFiltersDropdown && (
          <div className="mt-2.5 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2 text-xs">
            {/* Status pills */}
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Status
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['all', 'pending', 'in_progress', 'completed', 'overdue'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 rounded-xl font-medium capitalize text-[11px] transition ${
                      statusFilter === s
                        ? 'bg-teal-600 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority pills */}
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Priority
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['all', 'critical', 'high', 'medium', 'low'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriorityFilter(p)}
                    className={`px-2.5 py-1 rounded-xl font-medium capitalize text-[11px] transition ${
                      priorityFilter === p
                        ? 'bg-teal-600 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Category pills */}
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Category
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-2 py-0.5 rounded-lg text-[11px] ${
                    categoryFilter === 'all'
                      ? 'bg-teal-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategoryFilter(c.id)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition ${
                      categoryFilter === c.id
                        ? 'bg-teal-600 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section: Priority Tasks (Section 7: "Priority Tasks section. See All") */}
      {priorityTasks.length > 0 && (
        <section className="px-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">Priority Tasks</h2>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700">
                {priorityTasks.length}
              </span>
            </div>
            {priorityTasks.length > 3 && (
              <button
                onClick={() => setSeeAllPriority(!seeAllPriority)}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700"
              >
                {seeAllPriority ? 'Show Less' : 'See All'}
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {displayedPriorityTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      )}

      {/* Section: Today's Schedule Timeline (Section 7) */}
      <section className="px-4 mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900">Today's Schedule</h2>
            <span className="text-xs font-semibold text-slate-400">
              ({timelineTasks.length} tasks)
            </span>
          </div>
          <button
            onClick={() => setIsAddTaskOpen(true)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Add</span>
          </button>
        </div>

        {timelineTasks.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-dashed border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              No tasks scheduled for this day
            </h3>
            <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto">
              Plan your day ahead with structured priorities, time blocks, and intelligent reminders.
            </p>
            <button
              onClick={() => setIsAddTaskOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {timelineTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </section>

      {/* Tomorrow Planning & Carry-over Prompt (Section 24) */}
      <div className="mx-4 p-4 rounded-3xl bg-gradient-to-r from-teal-800 to-slate-900 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
              Daily Wrap-Up & Planning
            </span>
            <h3 className="text-sm font-bold">Plan Tomorrow's Day</h3>
            <p className="text-xs text-slate-300">
              Review incomplete tasks and carry them over cleanly.
            </p>
          </div>
          <button
            onClick={() => setIsTomorrowPlanOpen(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white text-teal-900 font-bold text-xs hover:bg-teal-50 transition shadow-sm shrink-0"
          >
            <span>Plan Next Day</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
