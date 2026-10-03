import React, { useState, useEffect } from 'react';
import { useTasks } from '../../context/TaskContext.tsx';
import { api } from '../../api/client.ts';
import { TaskHistoryItem } from '../../types/index.ts';
import {
  X,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  Calendar,
  Tag,
  Trash2,
  Plus,
  History,
  Edit3,
  Sliders,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';

export const TaskDetailModal: React.FC = () => {
  const {
    selectedTaskDetail,
    setSelectedTaskDetail,
    startTimer,
    pauseTimer,
    resumeTimer,
    completeTimer,
    adjustTime,
    updateTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    activeRunningTask,
  } = useTasks();

  const [historyLogs, setHistoryLogs] = useState<TaskHistoryItem[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [showAdjustTime, setShowAdjustTime] = useState(false);
  const [manualMinutes, setManualMinutes] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (selectedTaskDetail) {
      setNotesText(selectedTaskDetail.notes || '');
      setNewDate(selectedTaskDetail.date);
      setNewStartTime(selectedTaskDetail.startTime || '09:00');
      setNewEndTime(selectedTaskDetail.endTime || '10:00');
      setManualMinutes(selectedTaskDetail.actualDurationMinutes || 0);

      // Load task activity history (Section 11)
      api.getTaskHistory(selectedTaskDetail.id).then((logs) => {
        setHistoryLogs(logs);
      });
    }
  }, [selectedTaskDetail]);

  if (!selectedTaskDetail) return null;

  const isCurrentRunning = activeRunningTask?.id === selectedTaskDetail.id;

  // Format durations
  const estHours = Math.floor(selectedTaskDetail.estimatedDurationMinutes / 60);
  const estMins = selectedTaskDetail.estimatedDurationMinutes % 60;
  const actHours = Math.floor(selectedTaskDetail.actualDurationMinutes / 60);
  const actMins = selectedTaskDetail.actualDurationMinutes % 60;

  // Difference comparison (Section 10)
  const diffMinutes =
    selectedTaskDetail.actualDurationMinutes - selectedTaskDetail.estimatedDurationMinutes;
  const isLess = diffMinutes < 0;
  const absDiff = Math.abs(diffMinutes);
  const diffFormatted = `${Math.floor(absDiff / 60)}h ${absDiff % 60}m ${
    isLess ? 'less than estimated' : 'more than estimated'
  }`;

  const completedSubtasks = selectedTaskDetail.subtasks?.filter((s) => s.isCompleted).length || 0;
  const totalSubtasks = selectedTaskDetail.subtasks?.length || 0;

  const handleSaveNotes = async () => {
    await updateTask(selectedTaskDetail.id, { notes: notesText });
    setIsEditingNotes(false);
  };

  const handleApplyReschedule = async () => {
    await updateTask(selectedTaskDetail.id, {
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      status: 'pending',
    });
    setIsRescheduling(false);
  };

  const handleApplyAdjustTime = async () => {
    await adjustTime(selectedTaskDetail, Number(manualMinutes));
    setShowAdjustTime(false);
  };

  const handleAddSubtaskSubmit = async () => {
    if (!newSubtaskTitle.trim()) return;
    await addSubtask(selectedTaskDetail.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  const handleDeleteTaskConfirmed = async () => {
    await deleteTask(selectedTaskDetail.id);
    setSelectedTaskDetail(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: selectedTaskDetail.categoryColor }}
            />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {selectedTaskDetail.categoryName}
            </span>
            <span className="text-slate-300">•</span>
            <span
              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                selectedTaskDetail.priority === 'critical'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : selectedTaskDetail.priority === 'high'
                  ? 'bg-orange-50 text-orange-700 border border-orange-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {selectedTaskDetail.priority}
            </span>
          </div>

          <button
            onClick={() => setSelectedTaskDetail(null)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Title & Status */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-1">
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                {selectedTaskDetail.title}
              </h2>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase shrink-0 ${
                  selectedTaskDetail.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : selectedTaskDetail.status === 'overdue'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : isCurrentRunning
                    ? 'bg-teal-50 text-teal-700 border border-teal-200'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {selectedTaskDetail.status.replace('_', ' ')}
              </span>
            </div>

            {selectedTaskDetail.description && (
              <p className="text-slate-600 text-xs leading-relaxed mt-2">
                {selectedTaskDetail.description}
              </p>
            )}
          </div>

          {/* Time Tracking Control Banner (Section 10) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase font-bold text-teal-400 tracking-wider">
                Time Tracking & Stopwatch
              </span>
              <button
                onClick={() => setShowAdjustTime(!showAdjustTime)}
                className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1"
              >
                <Sliders className="w-3 h-3" />
                <span>Adjust</span>
              </button>
            </div>

            {/* Time Comparison stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-[10px] text-slate-400 block font-medium">Estimated</span>
                <span className="text-base font-bold text-white">
                  {estHours}h {estMins}m
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-[10px] text-slate-400 block font-medium">Actual Spent</span>
                <span className="text-base font-bold text-teal-400">
                  {actHours}h {actMins}m
                </span>
              </div>
            </div>

            {/* Difference note */}
            {selectedTaskDetail.actualDurationMinutes > 0 && (
              <p className="text-[11px] text-slate-300 mb-3 bg-slate-800/40 p-2 rounded-lg">
                Difference: <strong className="text-teal-300">{diffFormatted}</strong>
              </p>
            )}

            {/* Manual time adjust input */}
            {showAdjustTime && (
              <div className="mb-3 p-3 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-2">
                <span className="text-[11px] text-slate-300">Set total minutes:</span>
                <input
                  type="number"
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(Number(e.target.value))}
                  className="w-20 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                />
                <button
                  onClick={handleApplyAdjustTime}
                  className="px-3 py-1 rounded bg-teal-600 text-white font-bold text-xs"
                >
                  Save
                </button>
              </div>
            )}

            {/* Action buttons: Start, Pause, Resume, Complete */}
            <div className="flex items-center gap-2">
              {selectedTaskDetail.status !== 'completed' ? (
                <>
                  {isCurrentRunning ? (
                    <button
                      onClick={() => pauseTimer(selectedTaskDetail)}
                      className="flex-1 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition flex items-center justify-center gap-1.5"
                    >
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Pause Timer</span>
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        selectedTaskDetail.status === 'paused'
                          ? resumeTimer(selectedTaskDetail)
                          : startTimer(selectedTaskDetail)
                      }
                      className="flex-1 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold hover:bg-teal-400 transition flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>
                        {selectedTaskDetail.status === 'paused' ? 'Resume Timer' : 'Start Focus Timer'}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => completeTimer(selectedTaskDetail)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete</span>
                  </button>
                </>
              ) : (
                <div className="w-full flex items-center justify-between p-2 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                  <span className="font-semibold">Task Completed</span>
                  <button
                    onClick={() => updateTask(selectedTaskDetail.id, { status: 'pending' })}
                    className="text-xs underline hover:text-white"
                  >
                    Reopen task
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Schedule & Reschedule Info */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">Schedule & Due Date</span>
              <button
                onClick={() => setIsRescheduling(!isRescheduling)}
                className="text-teal-600 font-semibold text-[11px] hover:underline"
              >
                {isRescheduling ? 'Cancel' : 'Reschedule'}
              </button>
            </div>

            <div className="flex items-center gap-4 text-slate-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedTaskDetail.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {selectedTaskDetail.startTime} - {selectedTaskDetail.endTime}
                </span>
              </div>
            </div>

            {/* Inline Reschedule Form (RULE 4) */}
            {isRescheduling && (
              <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500">New Date</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Start Time</label>
                    <input
                      type="time"
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">End Time</label>
                    <input
                      type="time"
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
                <button
                  onClick={handleApplyReschedule}
                  className="w-full py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700"
                >
                  Save Reschedule
                </button>
              </div>
            )}
          </div>

          {/* Subtasks Section (Section 11) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-xs">
                Subtasks ({completedSubtasks}/{totalSubtasks})
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtaskSubmit();
                  }
                }}
                placeholder="Add checklist item..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
              />
              <button
                onClick={handleAddSubtaskSubmit}
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Add
              </button>
            </div>

            {selectedTaskDetail.subtasks?.length > 0 ? (
              <div className="space-y-1.5">
                {selectedTaskDetail.subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition"
                  >
                    <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={st.isCompleted}
                        onChange={() => toggleSubtask(selectedTaskDetail.id, st.id)}
                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 accent-teal-600"
                      />
                      <span
                        className={`text-xs ${
                          st.isCompleted
                            ? 'line-through text-slate-400'
                            : 'text-slate-800 font-medium'
                        }`}
                      >
                        {st.title}
                      </span>
                    </label>
                    <button
                      onClick={() => deleteSubtask(selectedTaskDetail.id, st.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-[11px] italic">No subtasks added yet.</p>
            )}
          </div>

          {/* Notes Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-xs">Notes</h3>
              <button
                onClick={() => setIsEditingNotes(!isEditingNotes)}
                className="text-teal-600 font-semibold text-[11px] flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditingNotes ? 'Cancel' : 'Edit'}</span>
              </button>
            </div>

            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  placeholder="Write task notes, links, or thoughts..."
                />
                <button
                  onClick={handleSaveNotes}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 text-white font-bold text-xs"
                >
                  Save Notes
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-xs whitespace-pre-wrap">
                {selectedTaskDetail.notes || 'No notes added.'}
              </div>
            )}
          </div>

          {/* Activity History Logs (Section 11 & 21) */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-400" />
              <h3 className="font-bold text-slate-800 text-xs">Task Activity History</h3>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {historyLogs.length > 0 ? (
                historyLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] flex items-start justify-between gap-2"
                  >
                    <div>
                      <span className="font-semibold text-slate-700 block">
                        {log.description}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-[11px] italic">No logged activity yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer: Delete Safety Confirmation (Section 39) */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          {confirmDelete ? (
            <div className="flex items-center gap-2 w-full justify-between animate-fadeIn">
              <span className="text-[11px] font-bold text-rose-700">Confirm delete task?</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTaskConfirmed}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </button>
              <button
                onClick={() => setSelectedTaskDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
