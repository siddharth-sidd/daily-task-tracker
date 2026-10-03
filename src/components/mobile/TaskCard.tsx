import React from 'react';
import { Task, Priority } from '../../types/index.ts';
import { useTasks } from '../../context/TaskContext.tsx';
import {
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertTriangle,
  RotateCcw,
  CheckSquare,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const {
    startTimer,
    pauseTimer,
    resumeTimer,
    completeTimer,
    setSelectedTaskDetail,
    activeRunningTask,
  } = useTasks();

  const isCurrentRunning = activeRunningTask?.id === task.id;

  // Format priority styling
  const priorityConfig: Record<Priority, { label: string; badgeClass: string }> = {
    critical: {
      label: 'Critical',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80 ring-1 ring-rose-500/20',
    },
    high: {
      label: 'High',
      badgeClass: 'bg-orange-50 text-orange-700 border-orange-200/80',
    },
    medium: {
      label: 'Medium',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80',
    },
    low: {
      label: 'Low',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    },
  };

  const currentPriority = priorityConfig[task.priority] || priorityConfig.medium;

  // Format durations
  const estHours = Math.round((task.estimatedDurationMinutes / 60) * 10) / 10;
  const actHours = Math.floor(task.actualDurationMinutes / 60);
  const actMins = task.actualDurationMinutes % 60;
  const actualStr = actHours > 0 ? `${actHours}h ${actMins}m` : `${actMins}m`;

  const completedSubtasks = task.subtasks?.filter((s) => s.isCompleted).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <div
      onClick={() => setSelectedTaskDetail(task)}
      className={`group relative p-4 rounded-3xl bg-white transition-all duration-200 cursor-pointer border ${
        task.status === 'completed'
          ? 'border-slate-100 bg-slate-50/50 opacity-80'
          : task.status === 'overdue'
          ? 'border-rose-200/80 bg-rose-50/20 shadow-xs'
          : isCurrentRunning
          ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md shadow-teal-500/10'
          : 'border-slate-100 hover:border-teal-200 hover:shadow-md shadow-xs'
      }`}
    >
      {/* Top row: Category, Priority, Overdue indicator */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Category tag */}
          <span
            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
            style={{
              backgroundColor: `${task.categoryColor}15`,
              color: task.categoryColor,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: task.categoryColor }}
            />
            {task.categoryName}
          </span>

          {/* Priority pill */}
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${currentPriority.badgeClass}`}
          >
            {currentPriority.label}
          </span>
        </div>

        {/* Status indicator */}
        <div>
          {task.status === 'completed' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              Completed
            </span>
          )}
          {task.status === 'overdue' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full animate-pulse">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              Overdue
            </span>
          )}
          {task.status === 'in_progress' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" />
              In Progress
            </span>
          )}
          {task.status === 'paused' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              Paused
            </span>
          )}
          {task.status === 'pending' && (
            <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              Pending
            </span>
          )}
        </div>
      </div>

      {/* Task Title & Description */}
      <div className="mb-3">
        <h3
          className={`text-sm font-bold text-slate-900 group-hover:text-teal-700 transition line-clamp-1 ${
            task.status === 'completed' ? 'line-through text-slate-400' : ''
          }`}
        >
          {task.title}
        </h3>
        {task.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Bottom meta row: Schedule time, time spent, subtasks, quick action */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100/90 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          {/* Scheduled time */}
          <div className="flex items-center gap-1 font-medium text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {task.startTime || '09:00'} - {task.endTime || '10:00'}
            </span>
          </div>

          {/* Subtask count */}
          {totalSubtasks > 0 && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <CheckSquare className="w-3 h-3 text-slate-400" />
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
          )}

          {/* Logged actual duration */}
          {task.actualDurationMinutes > 0 && (
            <span className="text-[11px] font-semibold text-teal-600">
              {actualStr} logged
            </span>
          )}
        </div>

        {/* Quick Action Button (RULE 5 & 6) */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5"
        >
          {task.status === 'pending' || task.status === 'overdue' ? (
            <button
              onClick={() => startTimer(task)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 shadow-xs hover:shadow-sm transition"
              title="Start focus timer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Start</span>
            </button>
          ) : isCurrentRunning ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => pauseTimer(task)}
                className="p-1.5 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition"
                title="Pause timer"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
              </button>
              <button
                onClick={() => completeTimer(task)}
                className="p-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
                title="Complete task"
              >
                <CheckCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : task.status === 'paused' ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => resumeTimer(task)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition"
                title="Resume timer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Resume</span>
              </button>
              <button
                onClick={() => completeTimer(task)}
                className="p-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
                title="Complete task"
              >
                <CheckCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSelectedTaskDetail(task)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition"
              title="View task details"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
