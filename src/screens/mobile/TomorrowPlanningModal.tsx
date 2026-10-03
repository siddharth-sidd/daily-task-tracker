import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext.tsx';
import {
  X,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

export const TomorrowPlanningModal: React.FC = () => {
  const {
    isTomorrowPlanOpen,
    setIsTomorrowPlanOpen,
    tasks,
    allTasks,
    carryOverTasks,
    setIsAddTaskOpen,
  } = useTasks();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(tomorrow);

  // Incomplete tasks available to carry over
  const pendingTasks = tasks.filter(
    (t) => (t.status === 'pending' || t.status === 'overdue' || t.status === 'paused') && !t.isArchived
  );

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>(
    pendingTasks.map((t) => t.id)
  );
  const [isCarryingOver, setIsCarryingOver] = useState(false);
  const [carriedOverCount, setCarriedOverCount] = useState<number | null>(null);

  if (!isTomorrowPlanOpen) return null;

  const toggleSelect = (id: string) => {
    if (selectedTaskIds.includes(id)) {
      setSelectedTaskIds(selectedTaskIds.filter((x) => x !== id));
    } else {
      setSelectedTaskIds([...selectedTaskIds, id]);
    }
  };

  const handleCarryOver = async () => {
    if (selectedTaskIds.length === 0) return;
    setIsCarryingOver(true);
    try {
      await carryOverTasks(selectedTaskIds);
      setCarriedOverCount(selectedTaskIds.length);
      setTimeout(() => {
        setIsTomorrowPlanOpen(false);
        setCarriedOverCount(null);
      }, 1500);
    } finally {
      setIsCarryingOver(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-1.5 text-teal-600 font-bold text-xs uppercase tracking-wider mb-0.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Tomorrow Planning</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">{tomorrowFormatted}</h2>
          </div>
          <button
            onClick={() => setIsTomorrowPlanOpen(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Wrap up today with clarity. Select which incomplete or overdue tasks you would like to carry over into tomorrow's schedule:
          </p>

          {pendingTasks.length === 0 ? (
            <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h3 className="font-bold text-emerald-950 text-sm">All Tasks Completed!</h3>
              <p className="text-emerald-700 mt-1">
                You have zero incomplete tasks from today. Great work!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-500 font-semibold mb-1">
                <span>Incomplete Tasks ({pendingTasks.length})</span>
                <button
                  onClick={() =>
                    setSelectedTaskIds(
                      selectedTaskIds.length === pendingTasks.length
                        ? []
                        : pendingTasks.map((t) => t.id)
                    )
                  }
                  className="text-teal-600 text-[11px] hover:underline"
                >
                  {selectedTaskIds.length === pendingTasks.length
                    ? 'Deselect All'
                    : 'Select All'}
                </button>
              </div>

              {pendingTasks.map((t) => {
                const isChecked = selectedTaskIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => toggleSelect(t.id)}
                    className={`p-3 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                      isChecked
                        ? 'bg-teal-50/60 border-teal-300 ring-1 ring-teal-500/20 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelect(t.id)}
                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 accent-teal-600"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{t.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                          <span>{t.categoryName}</span>
                          <span>•</span>
                          <span className="capitalize">{t.priority}</span>
                        </div>
                      </div>
                    </div>
                    {t.status === 'overdue' && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Overdue
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              setIsTomorrowPlanOpen(false);
              setIsAddTaskOpen(true);
            }}
            className="text-xs font-semibold text-teal-600 hover:underline"
          >
            + New Task for Tomorrow
          </button>

          <button
            disabled={isCarryingOver || selectedTaskIds.length === 0}
            onClick={handleCarryOver}
            className="px-5 py-2.5 rounded-2xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 shadow-md shadow-teal-600/25 transition disabled:opacity-50 flex items-center gap-1.5"
          >
            {carriedOverCount !== null ? (
              <span>Carried over {carriedOverCount} task(s)!</span>
            ) : isCarryingOver ? (
              <span>Moving...</span>
            ) : (
              <>
                <span>Carry Over to Tomorrow</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
