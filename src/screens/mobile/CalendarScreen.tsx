import React, { useState, useMemo } from 'react';
import { useTasks } from '../../context/TaskContext.tsx';
import { TaskCard } from '../../components/mobile/TaskCard.tsx';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const CalendarScreen: React.FC = () => {
  const {
    allTasks,
    selectedDate,
    setSelectedDate,
    setIsAddTaskOpen,
    tasks,
  } = useTasks();

  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  // Generate calendar days for current month view
  const { daysGrid, monthName, year } = useMemo(() => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    const firstDayIndex = new Date(y, m, 1).getDay(); // 0 is Sunday
    const totalDaysInMonth = new Date(y, m + 1, 0).getDate();
    const monthName = currentMonth.toLocaleString('default', { month: 'long' });

    // Matrix of 35 or 42 cells
    const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Prev month days
    const prevMonthTotalDays = new Date(y, m, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthTotalDays - i;
      const dObj = new Date(y, m - 1, d);
      cells.push({
        dateStr: dObj.toISOString().split('T')[0],
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dObj = new Date(y, m, d);
      cells.push({
        dateStr: dObj.toISOString().split('T')[0],
        dayNum: d,
        isCurrentMonth: true,
      });
    }

    // Next month filling
    const remaining = 35 - cells.length > 0 ? 35 - cells.length : 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const dObj = new Date(y, m + 1, d);
      cells.push({
        dateStr: dObj.toISOString().split('T')[0],
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    return { daysGrid: cells, monthName, year: y };
  }, [currentMonth]);

  // Tasks for currently selected day
  const dayTasks = allTasks.filter((t) => t.date === selectedDate && !t.isArchived);

  // Month navigation
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="p-4 pb-28 space-y-4">
      {/* Header and View Mode Switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Calendar</h2>
          <p className="text-xs text-slate-500">Track and schedule tasks visually</p>
        </div>

        {/* Day / Week / Month pill */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
          {(['month', 'week', 'day'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setCalendarView(view)}
              className={`px-2.5 py-1 rounded-lg capitalize transition ${
                calendarView === view
                  ? 'bg-white text-teal-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Month Navigator */}
      <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-slate-800">
            {monthName} {year}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const now = new Date();
                setCurrentMonth(now);
                setSelectedDate(todayStr);
              }}
              className="text-[11px] font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md hover:bg-teal-100 transition"
            >
              Today
            </button>
            <button
              onClick={prevMonth}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <span key={d} className="text-[11px] font-bold text-slate-400 uppercase">
              {d}
            </span>
          ))}
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-7 gap-1">
          {daysGrid.map((cell) => {
            const isSelected = cell.dateStr === selectedDate;
            const isToday = cell.dateStr === todayStr;

            // Find tasks for this cell date
            const cellTasks = allTasks.filter((t) => t.date === cell.dateStr && !t.isArchived);
            const hasCompleted = cellTasks.some((t) => t.status === 'completed');
            const hasInProgress = cellTasks.some((t) => t.status === 'in_progress');
            const hasOverdue = cellTasks.some((t) => t.status === 'overdue');
            const hasPending = cellTasks.some((t) => t.status === 'pending');

            return (
              <button
                key={cell.dateStr}
                onClick={() => setSelectedDate(cell.dateStr)}
                className={`relative flex flex-col items-center justify-between p-1.5 h-12 rounded-2xl transition ${
                  isSelected
                    ? 'bg-teal-600 text-white font-bold shadow-md shadow-teal-600/25 ring-2 ring-teal-600 ring-offset-2'
                    : isToday
                    ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200'
                    : cell.isCurrentMonth
                    ? 'text-slate-700 hover:bg-slate-50'
                    : 'text-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs">{cell.dayNum}</span>

                {/* Colored status indicator dots */}
                <div className="flex items-center gap-0.5 mt-0.5">
                  {hasOverdue && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 ring-1 ring-white" />
                  )}
                  {hasInProgress && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ring-1 ring-white" />
                  )}
                  {hasCompleted && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white" />
                  )}
                  {hasPending && !hasCompleted && !hasInProgress && !hasOverdue && (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ring-1 ring-white" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Tasks List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-sm text-slate-800">
              Tasks for {selectedDate === todayStr ? 'Today' : selectedDate}
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {dayTasks.length}
            </span>
          </div>
          <button
            onClick={() => setIsAddTaskOpen(true)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 px-2.5 py-1 rounded-xl transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add on this day</span>
          </button>
        </div>

        {dayTasks.length === 0 ? (
          <div className="p-6 rounded-3xl bg-white border border-dashed border-slate-200 text-center">
            <p className="text-xs text-slate-500 mb-3">No tasks scheduled on this day.</p>
            <button
              onClick={() => setIsAddTaskOpen(true)}
              className="text-xs font-semibold text-teal-600 hover:underline"
            >
              + Create task for {selectedDate}
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {dayTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
