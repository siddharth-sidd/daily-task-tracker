import { Router } from 'express';
import { randomBytes } from 'crypto';
import { db } from '../db.ts';
import { requireAdmin, type AdminSession } from '../adminAuth.ts';
import { hashPassword } from '../userAuth.ts';

export const adminRouter = Router();

adminRouter.use(requireAdmin);

// GET /api/admin/dashboard
adminRouter.get('/dashboard', (req, res) => {
  const stats = db.getAdminStats();
  return res.json({ stats });
});

// GET /api/admin/users
adminRouter.get('/users', (req, res) => {
  const users = db.getAllUsers();
  const tasks = db.getAllTasksAdmin();

  // Augment users with their task counts
  const augmented = users.map((u) => {
    const userTasks = tasks.filter((t) => t.userId === u.id && !t.isArchived);
    const completed = userTasks.filter((t) => t.status === 'completed').length;
    const focusMinutes = userTasks.reduce((acc, t) => acc + (t.actualDurationMinutes || 0), 0);
    return {
      ...u,
      totalTasks: userTasks.length,
      completedTasks: completed,
      focusHours: Math.round((focusMinutes / 60) * 10) / 10,
    };
  });

  return res.json({ users: augmented });
});

// POST /api/admin/users
adminRouter.post('/users', (req, res) => {
  const { name, email, timezone, dailyTaskGoal, dailyFocusGoalMinutes, role } = req.body;
  if (
    typeof name !== 'string' ||
    !name.trim() ||
    name.trim().length > 100 ||
    typeof email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return res.status(400).json({ error: 'A valid name and email are required' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  const temporaryPassword = randomBytes(24).toString('base64url');
  const newUser = db.createUser({
    id: `user-${randomBytes(16).toString('hex')}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
    timezone: timezone || 'UTC',
    dailyTaskGoal: Number(dailyTaskGoal) || 5,
    dailyFocusGoalMinutes: Number(dailyFocusGoalMinutes) || 240,
    reminderSettings: { enabled: true, frequency: 'normal', sound: true, vibrate: true },
    notificationPrefs: { taskReminders: true, overdueAlerts: true, dailySummary: true, goalMilestones: true },
    theme: 'light',
    role: role === 'admin' ? 'admin' : 'user',
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  });
  db.setPasswordHash(newUser.id, hashPassword(temporaryPassword));

  const admin = res.locals.admin as AdminSession;
  db.createAuditLog({
    adminId: admin.id,
    adminName: admin.name,
    action: 'Created User',
    targetType: 'user',
    targetId: newUser.id,
    targetTitle: newUser.name,
    details: `Admin created user ${newUser.name} (${newUser.email})`,
  });

  return res.status(201).json({ user: newUser, temporaryPassword });
});

// PUT /api/admin/users/:id/status
adminRouter.put('/users/:id/status', (req, res) => {
  const { isActive } = req.body;
  const user = db.updateUser(req.params.id, { isActive: Boolean(isActive) });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const admin = res.locals.admin as AdminSession;
  db.createAuditLog({
    adminId: admin.id,
    adminName: admin.name,
    action: isActive ? 'Activated User' : 'Deactivated User',
    targetType: 'user',
    targetId: user.id,
    targetTitle: user.name,
    details: `User status set to ${isActive ? 'Active' : 'Inactive'}`,
  });

  return res.json({ user });
});

// PUT /api/admin/users/:id/role
adminRouter.put('/users/:id/role', (req, res) => {
  const { role } = req.body;
  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be admin or user.' });
  }

  const user = db.updateUser(req.params.id, { role });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const admin = res.locals.admin as AdminSession;
  db.createAuditLog({
    adminId: admin.id,
    adminName: admin.name,
    action: 'Changed User Role',
    targetType: 'user',
    targetId: user.id,
    targetTitle: user.name,
    details: `User role changed to ${role === 'admin' ? 'Administrator' : 'Standard User'}`,
  });

  return res.json({ user });
});

// GET /api/admin/tasks
adminRouter.get('/tasks', (req, res) => {
  const { status, priority, categoryId, search, userId } = req.query as Record<string, string>;
  let tasks = db.getAllTasksAdmin();

  if (userId && userId !== 'all') tasks = tasks.filter((t) => t.userId === userId);
  if (status && status !== 'all') tasks = tasks.filter((t) => t.status === status);
  if (priority && priority !== 'all') tasks = tasks.filter((t) => t.priority === priority);
  if (categoryId && categoryId !== 'all') tasks = tasks.filter((t) => t.categoryId === categoryId);
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    tasks = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.categoryName.toLowerCase().includes(q)
    );
  }

  return res.json({ tasks });
});

// PUT /api/admin/tasks/:id
adminRouter.put('/tasks/:id', (req, res) => {
  const admin = res.locals.admin as AdminSession;
  const task = db.updateTask(req.params.id, req.body);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  db.createAuditLog({
    adminId: admin.id,
    adminName: admin.name,
    action: 'Administrative Task Modification',
    targetType: 'task',
    targetId: task.id,
    targetTitle: task.title,
    details: `Task updated with fields: ${Object.keys(req.body).join(', ')}`,
  });

  return res.json({ task });
});

// GET /api/admin/audit-logs
adminRouter.get('/audit-logs', (req, res) => {
  const logs = db.getAuditLogs();
  return res.json({ logs });
});

// GET /api/admin/settings
adminRouter.get('/settings', (req, res) => {
  const settings = db.getSystemSettings();
  return res.json({ settings });
});

// PUT /api/admin/settings
adminRouter.put('/settings', (req, res) => {
  const admin = res.locals.admin as AdminSession;
  const updated = db.updateSystemSettings(req.body, admin.id, admin.name);
  return res.json({ settings: updated });
});
