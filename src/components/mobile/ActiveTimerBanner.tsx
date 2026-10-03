import React from 'react';
import { useTasks } from '../../context/TaskContext.tsx';
import { Play, Pause, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export const ActiveTimerBanner: React.FC = () => {
  const {
    activeRunningTask,
    timerSeconds,
    pauseTimer,
    completeTimer,
    setSelectedTaskDetail,
  } = useTasks();

  if (!activeRunningTask) return null;

  // Format seconds into HH:MM:SS
  const hours = Math.floor(timerSeconds / 3600);
  const minutes = Math.floor((timerSeconds % 3600) / 60);
  const seconds = timerSeconds % 60;
  const timeFormatted = `${hours > 0 ? `${hours.toString().padStart(2, '0')}:` : ''}${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div
      onClick={() => setSelectedTaskDetail(activeRunningTask)}
      className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto p-3.5 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/30 border border-slate-800 flex items-center justify-between gap-3 animate-slideUp cursor-pointer"
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping absolute" />
          <Clock className="w-4 h-4 text-teal-400 relative" />
        </div>
        <div className="overflow-hidden">
          <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400 block">
            Focus Session Active
          </span>
          <p className="text-xs font-semibold text-slate-100 truncate">
            {activeRunningTask.title}
          </p>
        </div>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-2.5 shrink-0"
      >
        <span className="font-mono text-sm font-bold text-white tracking-wider">
          {timeFormatted}
        </span>
        <button
          onClick={() => pauseTimer(activeRunningTask)}
          className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition"
          title="Pause timer"
        >
          <Pause className="w-3.5 h-3.5 fill-current" />
        </button>
        <button
          onClick={() => completeTimer(activeRunningTask)}
          className="p-2 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-400 transition"
          title="Complete task"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
