import { Router } from 'express';
import { db } from '../db.ts';

export const tasksRouter = Router();

// Helper to get userId
function getUserId(req: any): string {
  return (req.headers['x-user-id'] as string) || 'user-siddharth';
}

// GET /api/tasks
tasksRouter.get('/', (req, res) => {
  const userId = getUserId(req);
  const { date, status, search } = req.query as { date?: string; status?: string; search?: string };

  let tasks = db.getTasks(userId, date, status);

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    tasks = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.categoryName.toLowerCase().includes(q) ||
        (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q)))
    );
  }

  // Sort by priority (critical > high > medium > low) then startTime
  const priorityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  tasks.sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    const diff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    if (diff !== 0) return diff;
    return (a.startTime || '').localeCompare(b.startTime || '');
  });

  return res.json({ tasks });
});

// POST /api/tasks
tasksRouter.post('/', (req, res) => {
  const userId = getUserId(req);
  const data = req.body;

  if (!data.title || !data.date) {
    return res.status(400).json({ error: 'Title and date are required' });
  }

  const task = db.createTask({
    userId,
    title: data.title,
    description: data.description || '',
    categoryId: data.categoryId || 'cat-1',
    categoryName: data.categoryName || 'General',
    categoryColor: data.categoryColor || '#0d9488',
    priority: data.priority || 'medium',
    status: data.status || 'pending',
    date: data.date,
    startTime: data.startTime || '09:00',
    endTime: data.endTime || '10:00',
    estimatedDurationMinutes: Number(data.estimatedDurationMinutes) || 60,
    reminderType: data.reminderType || '15m_before',
    isRecurring: Boolean(data.isRecurring),
    recurringPattern: data.recurringPattern || null,
    recurringDays: data.recurringDays || [],
    recurringEndDate: data.recurringEndDate || null,
    dueDate: data.dueDate || `${data.date} ${data.endTime || '18:00'}`,
    tags: Array.isArray(data.tags) ? data.tags : [],
    notes: data.notes || '',
    subtasks: Array.isArray(data.subtasks)
      ? data.subtasks.map((s: any, idx: number) => ({
          id: `sub-${Date.now()}-${idx}`,
          taskId: '',
          title: typeof s === 'string' ? s : s.title,
          isCompleted: false,
          position: idx,
          createdAt: new Date().toISOString(),
        }))
      : [],
  });

  return res.status(201).json({ task });
});

// GET /api/tasks/:id
tasksRouter.get('/:id', (req, res) => {
  const task = db.getTaskById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  return res.json({ task });
});

// PUT /api/tasks/:id
tasksRouter.put('/:id', (req, res) => {
  const userId = getUserId(req);
  const task = db.updateTask(req.params.id, req.body, userId);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  return res.json({ task });
});

// DELETE /api/tasks/:id
tasksRouter.delete('/:id', (req, res) => {
  const success = db.deleteTask(req.params.id, true);
  if (!success) return res.status(404).json({ error: 'Task not found' });
  return res.json({ success: true, message: 'Task safely archived' });
});

// Time Tracking: Start Timer
tasksRouter.post('/:id/start', (req, res) => {
  const userId = getUserId(req);
  const task = db.startTaskTimer(req.params.id, userId);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  return res.json({ task });
});

// Time Tracking: Pause Timer
tasksRouter.post('/:id/pause', (req, res) => {
  const userId = getUserId(req);
  const { elapsedMinutes } = req.body;
  const task = db.pauseTaskTimer(req.params.id, userId, elapsedMinutes);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  return res.json({ task });
});

// Time Tracking: Resume Timer
tasksRouter.post('/:id/resume', (req, res) => {
  const userId = getUserId(req);
  const task = db.resumeTaskTimer(req.params.id, userId);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  return res.json({ task });
});

// Time Tracking: Complete Timer
tasksRouter.post('/:id/complete', (req, res) => {
  const userId = getUserId(req);
  const { finalMinutes } = req.body;
  const task = db.completeTaskTimer(req.params.id, userId, finalMinutes);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  return res.json({ task });
});

// Time Tracking: Adjust Time
tasksRouter.post('/:id/adjust-time', (req, res) => {
  const userId = getUserId(req);
  const { minutes } = req.body;
  if (minutes === undefined || minutes < 0) {
    return res.status(400).json({ error: 'Valid minutes required' });
  }
  const task = db.adjustTaskTime(req.params.id, userId, Number(minutes));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  return res.json({ task });
});

// Subtasks
tasksRouter.post('/:id/subtasks', (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Subtask title required' });
  const subtask = db.addSubtask(req.params.id, title);
  if (!subtask) return res.status(404).json({ error: 'Task not found' });
  return res.status(201).json({ subtask });
});

tasksRouter.put('/:id/subtasks/:subtaskId/toggle', (req, res) => {
  const subtask = db.toggleSubtask(req.params.id, req.params.subtaskId);
  if (!subtask) return res.status(404).json({ error: 'Subtask or Task not found' });
  return res.json({ subtask });
});

tasksRouter.delete('/:id/subtasks/:subtaskId', (req, res) => {
  const success = db.deleteSubtask(req.params.id, req.params.subtaskId);
  if (!success) return res.status(404).json({ error: 'Subtask not found' });
  return res.json({ success: true });
});

// Task History
tasksRouter.get('/:id/history', (req, res) => {
  const history = db.getTaskHistory(req.params.id);
  return res.json({ history });
});

// Carry Over Tasks to Tomorrow (Phase 24)
tasksRouter.post('/carry-over', (req, res) => {
  const userId = getUserId(req);
  const { taskIds } = req.body;
  if (!Array.isArray(taskIds)) {
    return res.status(400).json({ error: 'taskIds array required' });
  }
  const moved = db.carryOverToTomorrow(userId, taskIds);
  return res.json({ moved, count: moved.length });
});
