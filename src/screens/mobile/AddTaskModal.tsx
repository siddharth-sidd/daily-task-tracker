import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext.tsx';
import { Priority, ReminderType, RecurringPattern } from '../../types/index.ts';
import {
  X,
  Plus,
  Trash2,
  Clock,
  Calendar,
  Tag,
  AlertCircle,
  Bell,
  Repeat,
  CheckCircle2,
} from 'lucide-react';

export const AddTaskModal: React.FC = () => {
  const {
    isAddTaskOpen,
    setIsAddTaskOpen,
    createTask,
    categories,
    createCategory,
    selectedDate,
  } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-1');
  const [priority, setPriority] = useState<Priority>('medium');
  const [date, setDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [estimatedDuration, setEstimatedDuration] = useState(60);
  const [reminderType, setReminderType] = useState<ReminderType>('15m_before');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState<RecurringPattern>('weekdays');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Productivity']);
  const [notes, setNotes] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  // Custom category creation state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#0d9488');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAddTaskOpen) return null;

  // Add tag
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // Add subtask
  const handleAddSubtask = () => {
    if (newSubtaskInput.trim()) {
      setSubtasks([...subtasks, newSubtaskInput.trim()]);
      setNewSubtaskInput('');
    }
  };

  const handleRemoveSubtask = (idx: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== idx));
  };

  // Handle custom category submission
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    const created = await createCategory(newCategoryName.trim(), newCategoryColor);
    setCategoryId(created.id);
    setIsAddingCategory(false);
    setNewCategoryName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const selectedCat = categories.find((c) => c.id === categoryId);
      await createTask({
        title: title.trim(),
        description: description.trim(),
        categoryId,
        categoryName: selectedCat?.name || 'General',
        categoryColor: selectedCat?.color || '#0d9488',
        priority,
        status: 'pending',
        date,
        startTime,
        endTime,
        estimatedDurationMinutes: Number(estimatedDuration) || 60,
        reminderType,
        isRecurring,
        recurringPattern: isRecurring ? recurringPattern : null,
        dueDate: `${date} ${endTime}`,
        tags,
        notes: notes.trim(),
        subtasks: subtasks.map((st, i) => ({
          id: `sub-${Date.now()}-${i}`,
          taskId: '',
          title: st,
          isCompleted: false,
          position: i,
          createdAt: new Date().toISOString(),
        })),
      });

      // Reset & close
      setTitle('');
      setDescription('');
      setSubtasks([]);
      setIsAddTaskOpen(false);
    } catch (err) {
      console.error('Error creating task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Create New Task</h2>
            <p className="text-xs text-slate-500">Configure scheduling, priority, and reminders</p>
          </div>
          <button
            onClick={() => setIsAddTaskOpen(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete React Project or Study for Exam"
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 placeholder-slate-400 text-slate-900"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key objectives, deliverables, or checklist notes..."
              className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 text-xs focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 placeholder-slate-400 text-slate-900"
            />
          </div>

          {/* Category Picker & Custom Category */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Category</label>
              <button
                type="button"
                onClick={() => setIsAddingCategory(!isAddingCategory)}
                className="text-[11px] font-semibold text-teal-600 hover:underline"
              >
                {isAddingCategory ? 'Cancel' : '+ New Category'}
              </button>
            </div>

            {isAddingCategory ? (
              <div className="p-3 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-2 mb-2">
                <input
                  type="text"
                  placeholder="Category Name (e.g. Wellness)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-teal-200 text-xs bg-white"
                />
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">Color:</span>
                  {['#0d9488', '#6366f1', '#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#dc2626'].map(
                    (hex) => (
                      <button
                        type="button"
                        key={hex}
                        onClick={() => setNewCategoryColor(hex)}
                        className={`w-5 h-5 rounded-full ring-2 transition ${
                          newCategoryColor === hex ? 'ring-slate-800 scale-110' : 'ring-transparent'
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    )
                  )}
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="ml-auto px-3 py-1 rounded-xl bg-teal-600 text-white font-semibold text-[11px]"
                  >
                    Save Category
                  </button>
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 ${
                    categoryId === cat.id
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Priority (Section 8: Low, Medium, High, Critical) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'low', label: 'Low', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                { id: 'medium', label: 'Medium', color: 'text-blue-700 bg-blue-50 border-blue-200' },
                { id: 'high', label: 'High', color: 'text-orange-700 bg-orange-50 border-orange-200' },
                { id: 'critical', label: 'Critical', color: 'text-rose-700 bg-rose-50 border-rose-200' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPriority(p.id as Priority)}
                  className={`py-2 rounded-2xl font-bold border text-center transition ${
                    priority === p.id
                      ? 'ring-2 ring-slate-900 shadow-xs'
                      : 'opacity-70 hover:opacity-100'
                  } ${p.color}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date and Time Scheduling (Section 9) */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs"
              />
            </div>
          </div>

          {/* Estimated Duration & Reminders */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estimated Duration
              </label>
              <select
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
                <option value={180}>3 hours</option>
                <option value={300}>5 hours</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reminder Interval
              </label>
              <select
                value={reminderType}
                onChange={(e) => setReminderType(e.target.value as ReminderType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
              >
                <option value="at_start">At start time</option>
                <option value="15m_before">15 minutes before</option>
                <option value="30m_before">30 minutes before</option>
                <option value="1h_before">1 hour before</option>
                <option value="after_end">When scheduled end is reached</option>
                <option value="none">No reminder</option>
              </select>
            </div>
          </div>

          {/* Recurring Task Support (Section 14) */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-teal-600" />
                <span className="font-bold text-slate-800 text-xs">Recurring Task</span>
              </div>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 accent-teal-600 rounded"
              />
            </div>

            {isRecurring && (
              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium">Pattern:</span>
                {(['daily', 'weekdays', 'weekly', 'monthly'] as const).map((pat) => (
                  <button
                    type="button"
                    key={pat}
                    onClick={() => setRecurringPattern(pat)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold capitalize transition ${
                      recurringPattern === pat
                        ? 'bg-teal-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {pat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subtasks Builder (Section 11) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Subtasks ({subtasks.length})
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={newSubtaskInput}
                onChange={(e) => setNewSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add subtask step (e.g. Build core features)"
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-white font-semibold text-xs"
              >
                Add
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1.5">
                {subtasks.map((st, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <span className="text-slate-700 text-xs">{st}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(i)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tags</label>
            <div className="flex items-center gap-2 mb-1.5">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="e.g. Frontend, Sprint"
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
              >
                + Tag
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px]"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="text-slate-400 hover:text-rose-600 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
          <button
            type="button"
            onClick={() => setIsAddTaskOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/80 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting || !title.trim()}
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 shadow-md shadow-teal-600/25 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
};
