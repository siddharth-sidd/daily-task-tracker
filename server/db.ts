import fs from 'fs';
import path from 'path';
import {
  User,
  AdminUser,
  Category,
  Task,
  Subtask,
  TaskTimeSession,
  TaskHistoryItem,
  NotificationItem,
  Goal,
  DailySummaryStats,
  ProductivityScoreBreakdown,
  AdminDashboardStats,
  AdminAuditLog,
  SystemSettingsConfig,
} from '../src/types/index.ts';

const DB_FILE = path.resolve(process.env.TASK_TRACKER_DB_FILE || 'data/db.json');

export interface DatabaseSchema {
  users: User[];
  adminUsers: AdminUser[];
  authCredentials: Record<string, string>;
  categories: Category[];
  tasks: Task[];
  sessions: TaskTimeSession[];
  history: TaskHistoryItem[];
  notifications: NotificationItem[];
  goals: Goal[];
  auditLogs: AdminAuditLog[];
  systemSettings: SystemSettingsConfig;
}

// Generate standard today and recent date strings
const now = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];
const todayStr = formatDate(now);
const yesterday = new Date(now);
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = formatDate(yesterday);
const twoDaysAgo = new Date(now);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const twoDaysAgoStr = formatDate(twoDaysAgo);
const tomorrow = new Date(now);
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = formatDate(tomorrow);

const DEFAULT_SETTINGS: SystemSettingsConfig = {
  defaultTaskDurationMinutes: 60,
  defaultPriority: 'medium',
  weekStartDay: 'monday',
  maxDailyReminderFrequency: 6,
  maintenanceMode: false,
  allowUserRegistration: true,
  reminderIntervals: [
    { id: 'at_start', label: 'At start time', offsetMinutes: 0 },
    { id: '15m_before', label: '15 minutes before', offsetMinutes: 15 },
    { id: '30m_before', label: '30 minutes before', offsetMinutes: 30 },
    { id: '1h_before', label: '1 hour before', offsetMinutes: 60 },
    { id: 'after_end', label: 'When time ends', offsetMinutes: -1 },
  ],
};

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Work', color: '#0d9488', isSystem: true, createdAt: new Date().toISOString() },
  { id: 'cat-2', name: 'Study', color: '#6366f1', isSystem: true, createdAt: new Date().toISOString() },
  { id: 'cat-3', name: 'Coding', color: '#3b82f6', isSystem: true, createdAt: new Date().toISOString() },
  { id: 'cat-4', name: 'Career', color: '#8b5cf6', isSystem: true, createdAt: new Date().toISOString() },
  { id: 'cat-5', name: 'Fitness', color: '#f59e0b', isSystem: true, createdAt: new Date().toISOString() },
  { id: 'cat-6', name: 'Personal', color: '#ec4899', isSystem: true, createdAt: new Date().toISOString() },
  { id: 'cat-7', name: 'Health', color: '#10b981', isSystem: true, createdAt: new Date().toISOString() },
  { id: 'cat-8', name: 'Finance', color: '#06b6d4', isSystem: true, createdAt: new Date().toISOString() },
];

const INITIAL_USERS: User[] = [
  {
    id: 'user-siddharth',
    name: 'Demo User',
    email: 'demo@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    timezone: 'Asia/Kolkata',
    dailyTaskGoal: 6,
    dailyFocusGoalMinutes: 300, // 5 hours
    reminderSettings: {
      enabled: true,
      frequency: 'normal',
      sound: true,
      vibrate: true,
    },
    notificationPrefs: {
      taskReminders: true,
      overdueAlerts: true,
      dailySummary: true,
      goalMilestones: true,
    },
    theme: 'light',
    role: 'user',
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    lastLoginAt: new Date().toISOString(),
  },
  {
    id: 'user-demo',
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    timezone: 'America/New_York',
    dailyTaskGoal: 5,
    dailyFocusGoalMinutes: 240,
    reminderSettings: { enabled: true, frequency: 'normal', sound: true, vibrate: false },
    notificationPrefs: { taskReminders: true, overdueAlerts: true, dailySummary: true, goalMilestones: true },
    theme: 'light',
    role: 'user',
    isActive: true,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    lastLoginAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
];

const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'admin-1',
    name: 'Master Administrator',
    email: 'admin@example.com',
    role: 'super_admin',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    lastActive: new Date().toISOString(),
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    userId: 'user-siddharth',
    title: 'Complete React Project',
    description: 'Implement real-time task tracking, stopwatch sessions, and audio-visual reminders.',
    categoryId: 'cat-3',
    categoryName: 'Coding',
    categoryColor: '#3b82f6',
    priority: 'high',
    status: 'in_progress',
    date: todayStr,
    startTime: '10:00',
    endTime: '15:00',
    estimatedDurationMinutes: 300,
    actualDurationMinutes: 165,
    pausedDurationMinutes: 15,
    activeSessionStart: new Date(Date.now() - 45 * 60000).toISOString(),
    reminderType: '15m_before',
    isRecurring: false,
    dueDate: `${todayStr} 15:00`,
    tags: ['React', 'Frontend', 'Release'],
    notes: 'Make sure all subtasks are verified with linting.',
    subtasks: [
      { id: 'sub-1', taskId: 'task-1', title: 'Setup project architecture and API models', isCompleted: true, position: 0, createdAt: todayStr },
      { id: 'sub-2', taskId: 'task-1', title: 'Build interactive mobile dashboard and timer', isCompleted: true, position: 1, createdAt: todayStr },
      { id: 'sub-3', taskId: 'task-1', title: 'Implement web admin panel with synchronized metrics', isCompleted: false, position: 2, createdAt: todayStr },
      { id: 'sub-4', taskId: 'task-1', title: 'Test APK package and offline sync', isCompleted: false, position: 3, createdAt: todayStr },
    ],
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    userId: 'user-siddharth',
    title: 'Gym Workout - Upper Body & Cardio',
    description: 'Chest, shoulders, triceps, followed by 20 minutes treadmill intervals.',
    categoryId: 'cat-5',
    categoryName: 'Fitness',
    categoryColor: '#f59e0b',
    priority: 'medium',
    status: 'completed',
    date: todayStr,
    startTime: '06:30',
    endTime: '07:45',
    estimatedDurationMinutes: 75,
    actualDurationMinutes: 72,
    pausedDurationMinutes: 0,
    reminderType: 'at_start',
    isRecurring: true,
    recurringPattern: 'weekdays',
    recurringDays: [1, 3, 5],
    dueDate: `${todayStr} 07:45`,
    tags: ['Health', 'Cardio'],
    subtasks: [
      { id: 'sub-5', taskId: 'task-2', title: 'Warm-up and dynamic stretching', isCompleted: true, position: 0, createdAt: todayStr },
      { id: 'sub-6', taskId: 'task-2', title: 'Dumbbell bench press (4 sets)', isCompleted: true, position: 1, createdAt: todayStr },
      { id: 'sub-7', taskId: 'task-2', title: 'Incline cable flyes & lateral raises', isCompleted: true, position: 2, createdAt: todayStr },
      { id: 'sub-8', taskId: 'task-2', title: 'HIIT sprint cooldown', isCompleted: true, position: 3, createdAt: todayStr },
    ],
    createdAt: new Date(Date.now() - 10 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    completedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 'task-3',
    userId: 'user-siddharth',
    title: 'Apply for Tech Roles & Update Resume',
    description: 'Send applications for senior frontend / fullstack roles and tailor cover notes.',
    categoryId: 'cat-4',
    categoryName: 'Career',
    categoryColor: '#8b5cf6',
    priority: 'critical',
    status: 'completed',
    date: todayStr,
    startTime: '08:30',
    endTime: '10:00',
    estimatedDurationMinutes: 90,
    actualDurationMinutes: 85,
    pausedDurationMinutes: 0,
    reminderType: '15m_before',
    isRecurring: false,
    dueDate: `${todayStr} 10:00`,
    tags: ['Jobs', 'Resume'],
    subtasks: [
      { id: 'sub-9', taskId: 'task-3', title: 'Update project descriptions with metrics', isCompleted: true, position: 0, createdAt: todayStr },
      { id: 'sub-10', taskId: 'task-3', title: 'Submit 5 tailored applications', isCompleted: true, position: 1, createdAt: todayStr },
    ],
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    completedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 'task-4',
    userId: 'user-siddharth',
    title: 'Study for TCS NQT & Aptitude Practice',
    description: 'Solve 30 numerical reasoning problems and 2 competitive programming problems.',
    categoryId: 'cat-2',
    categoryName: 'Study',
    categoryColor: '#6366f1',
    priority: 'high',
    status: 'overdue',
    date: yesterdayStr,
    startTime: '16:00',
    endTime: '18:00',
    estimatedDurationMinutes: 120,
    actualDurationMinutes: 30,
    pausedDurationMinutes: 0,
    reminderType: '30m_before',
    isRecurring: false,
    dueDate: `${yesterdayStr} 18:00`,
    tags: ['Aptitude', 'Exam', 'Prep'],
    subtasks: [
      { id: 'sub-11', taskId: 'task-4', title: 'Permutations and Combinations module', isCompleted: true, position: 0, createdAt: yesterdayStr },
      { id: 'sub-12', taskId: 'task-4', title: 'Data Interpretation sets 1-4', isCompleted: false, position: 1, createdAt: yesterdayStr },
      { id: 'sub-13', taskId: 'task-4', title: 'Mock test simulation review', isCompleted: false, position: 2, createdAt: yesterdayStr },
    ],
    createdAt: new Date(Date.now() - 26 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 3600000).toISOString(),
  },
  {
    id: 'task-5',
    userId: 'user-siddharth',
    title: 'Read System Design: Rate Limiting & Caching',
    description: 'Study token bucket algorithm, Redis caching strategies, and distributed locks.',
    categoryId: 'cat-4',
    categoryName: 'Career',
    categoryColor: '#8b5cf6',
    priority: 'medium',
    status: 'pending',
    date: todayStr,
    startTime: '19:30',
    endTime: '20:30',
    estimatedDurationMinutes: 60,
    actualDurationMinutes: 0,
    pausedDurationMinutes: 0,
    reminderType: '15m_before',
    isRecurring: true,
    recurringPattern: 'daily',
    dueDate: `${todayStr} 20:30`,
    tags: ['SystemDesign', 'Architecture'],
    subtasks: [
      { id: 'sub-14', taskId: 'task-5', title: 'Read chapter 4 of Designing Data-Intensive Apps', isCompleted: false, position: 0, createdAt: todayStr },
      { id: 'sub-15', taskId: 'task-5', title: 'Write down key trade-offs in Obsidian notes', isCompleted: false, position: 1, createdAt: todayStr },
    ],
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-6',
    userId: 'user-siddharth',
    title: 'Practice SQL Window Functions',
    description: 'ROW_NUMBER, RANK, DENSE_RANK, and LAG/LEAD exercises on LeetCode SQL 50.',
    categoryId: 'cat-2',
    categoryName: 'Study',
    categoryColor: '#6366f1',
    priority: 'low',
    status: 'pending',
    date: todayStr,
    startTime: '21:00',
    endTime: '22:00',
    estimatedDurationMinutes: 60,
    actualDurationMinutes: 0,
    pausedDurationMinutes: 0,
    reminderType: 'at_start',
    isRecurring: false,
    dueDate: `${todayStr} 22:00`,
    tags: ['SQL', 'Database'],
    subtasks: [
      { id: 'sub-16', taskId: 'task-6', title: 'Complete problems 180 and 185', isCompleted: false, position: 0, createdAt: todayStr },
    ],
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Yesterday's completed tasks to provide rich history
  {
    id: 'task-y1',
    userId: 'user-siddharth',
    title: 'Client Sprint Retrospective & Planning',
    description: 'Review velocity and sprint backlog items with product manager.',
    categoryId: 'cat-1',
    categoryName: 'Work',
    categoryColor: '#0d9488',
    priority: 'high',
    status: 'completed',
    date: yesterdayStr,
    startTime: '10:00',
    endTime: '11:30',
    estimatedDurationMinutes: 90,
    actualDurationMinutes: 88,
    pausedDurationMinutes: 0,
    reminderType: '15m_before',
    isRecurring: false,
    dueDate: `${yesterdayStr} 11:30`,
    tags: ['Work', 'Agile'],
    subtasks: [],
    createdAt: new Date(Date.now() - 32 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 28 * 3600000).toISOString(),
    completedAt: new Date(Date.now() - 28 * 3600000).toISOString(),
  },
  {
    id: 'task-y2',
    userId: 'user-siddharth',
    title: 'Grocery & Healthy Meal Prep',
    description: 'Stock up high-protein items and cook lunches for 3 days.',
    categoryId: 'cat-7',
    categoryName: 'Health',
    categoryColor: '#10b981',
    priority: 'medium',
    status: 'completed',
    date: yesterdayStr,
    startTime: '14:00',
    endTime: '15:30',
    estimatedDurationMinutes: 90,
    actualDurationMinutes: 80,
    pausedDurationMinutes: 0,
    reminderType: 'at_start',
    isRecurring: false,
    dueDate: `${yesterdayStr} 15:30`,
    tags: ['Health'],
    subtasks: [],
    createdAt: new Date(Date.now() - 30 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 3600000).toISOString(),
    completedAt: new Date(Date.now() - 25 * 3600000).toISOString(),
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'user-siddharth',
    type: 'reminder',
    title: 'Task Active: Complete React Project',
    message: 'Your high-priority task has 1h 45m remaining. Keep up the great focus!',
    taskId: 'task-1',
    isRead: false,
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: 'notif-2',
    userId: 'user-siddharth',
    type: 'overdue',
    title: 'Task Overdue: Study for TCS NQT',
    message: 'This task was scheduled for yesterday 18:00. Would you like to reschedule or extend the deadline?',
    taskId: 'task-4',
    isRead: false,
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 'notif-3',
    userId: 'user-siddharth',
    type: 'completed',
    title: 'Great Job! 2 Tasks Completed Today',
    message: 'You completed Gym Workout and Apply for Tech Roles. Daily completion is at 40%!',
    isRead: true,
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 'notif-4',
    userId: 'user-siddharth',
    type: 'goal_met',
    title: 'Focus Goal Milestone Reached',
    message: 'You have logged 5.4 hours of productive focus time over the last 2 days!',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

const INITIAL_GOALS: Goal[] = [
  {
    id: 'goal-1',
    userId: 'user-siddharth',
    title: 'Daily Tasks Target',
    type: 'daily_tasks',
    targetValue: 5,
    currentValue: 2,
    unit: 'tasks',
    period: 'daily',
    isMet: false,
  },
  {
    id: 'goal-2',
    userId: 'user-siddharth',
    title: 'Daily Focused Hours',
    type: 'daily_focus',
    targetValue: 300,
    currentValue: 322,
    unit: 'minutes',
    period: 'daily',
    isMet: true,
  },
  {
    id: 'goal-3',
    userId: 'user-siddharth',
    title: 'Weekly High Priority Completion',
    type: 'high_priority',
    targetValue: 85,
    currentValue: 88,
    unit: '%',
    period: 'weekly',
    isMet: true,
  },
];

const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'log-1',
    adminId: 'admin-1',
    adminName: 'Master Administrator',
    action: 'System Initialized',
    targetType: 'settings',
    targetId: 'sys-config',
    details: 'Daily Task Tracker production instance bootstrapped with standard categories and rules.',
    timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
];

class MemoryDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users)) {
          parsed.authCredentials ||= {};
          parsed.adminUsers ||= [];
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read db.json, generating initial database state:', e);
    }

    const initial: DatabaseSchema = {
      users: [],
      adminUsers: [],
      authCredentials: {},
      categories: INITIAL_CATEGORIES,
      tasks: [],
      sessions: [],
      history: [],
      notifications: [],
      goals: [],
      auditLogs: [],
      systemSettings: DEFAULT_SETTINGS,
    };

    this.save(initial);
    return initial;
  }

  private save(dataToSave?: DatabaseSchema) {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error persisting database:', e);
    }
  }

  // --- Users ---
  getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  getPasswordHash(userId: string): string | undefined {
    return this.data.authCredentials[userId];
  }

  setPasswordHash(userId: string, passwordHash: string): void {
    this.data.authCredentials[userId] = passwordHash;
    this.save();
  }

  createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  getAllUsers(): User[] {
    return [...this.data.users];
  }

  // --- Admin ---
  getAdminByEmail(email: string): AdminUser | undefined {
    return this.data.adminUsers.find((a) => a.email.toLowerCase() === email.toLowerCase());
  }

  createAuditLog(log: Omit<AdminAuditLog, 'id' | 'timestamp'>): AdminAuditLog {
    const newLog: AdminAuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(newLog);
    if (this.data.auditLogs.length > 500) this.data.auditLogs.pop();
    this.save();
    return newLog;
  }

  getAuditLogs(): AdminAuditLog[] {
    return [...this.data.auditLogs];
  }

  getSystemSettings(): SystemSettingsConfig {
    return { ...this.data.systemSettings };
  }

  updateSystemSettings(updates: Partial<SystemSettingsConfig>, adminId: string, adminName: string): SystemSettingsConfig {
    this.data.systemSettings = { ...this.data.systemSettings, ...updates };
    this.createAuditLog({
      adminId,
      adminName,
      action: 'Updated System Settings',
      targetType: 'settings',
      targetId: 'sys-config',
      details: `Modified configuration: ${Object.keys(updates).join(', ')}`,
    });
    this.save();
    return this.data.systemSettings;
  }

  // --- Categories ---
  getCategories(userId?: string): Category[] {
    return this.data.categories.filter((c) => c.isSystem || (userId && c.userId === userId));
  }

  createCategory(category: Omit<Category, 'id' | 'createdAt'>): Category {
    const newCat: Category = {
      ...category,
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.categories.push(newCat);
    this.save();
    return newCat;
  }

  // --- Tasks ---
  getTasks(userId: string, date?: string, status?: string): Task[] {
    this.autoCheckOverdue(userId);
    return this.data.tasks.filter((t) => {
      if (t.userId !== userId) return false;
      if (t.isArchived) return false;
      if (date && t.date !== date) return false;
      if (status && status !== 'all' && t.status !== status) return false;
      return true;
    });
  }

  getAllTasksAdmin(): Task[] {
    return [...this.data.tasks];
  }

  getTaskById(id: string): Task | undefined {
    return this.data.tasks.find((t) => t.id === id);
  }

  createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'actualDurationMinutes' | 'pausedDurationMinutes'>): Task {
    const nowIso = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      actualDurationMinutes: 0,
      pausedDurationMinutes: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    this.data.tasks.unshift(newTask);

    this.recordHistory(newTask.id, newTask.userId, 'created', `Task created: "${newTask.title}"`);

    // Auto-create reminder notification if requested
    if (newTask.reminderType !== 'none') {
      this.createNotification({
        userId: newTask.userId,
        taskId: newTask.id,
        type: 'reminder',
        title: `Reminder Scheduled: ${newTask.title}`,
        message: `Task is scheduled for ${newTask.date} at ${newTask.startTime}.`,
      });
    }

    this.save();
    return newTask;
  }

  updateTask(id: string, updates: Partial<Task>, authorUserId?: string): Task | undefined {
    const idx = this.data.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;

    const old = this.data.tasks[idx];
    const nowIso = new Date().toISOString();

    // Check status changes
    if (updates.status && updates.status !== old.status) {
      this.recordHistory(id, old.userId, 'status_changed', `Status changed from ${old.status} to ${updates.status}`, old.status, updates.status);
      if (updates.status === 'completed') {
        updates.completedAt = nowIso;
        updates.activeSessionStart = null;
        // Stop reminder notifications for completed tasks per RULE 1
        this.clearTaskReminders(id);
      }
    }

    // Check priority changes
    if (updates.priority && updates.priority !== old.priority) {
      this.recordHistory(id, old.userId, 'priority_changed', `Priority changed from ${old.priority} to ${updates.priority}`, old.priority, updates.priority);
    }

    // Check date reschedule per RULE 4
    if (updates.date && updates.date !== old.date) {
      this.recordHistory(id, old.userId, 'rescheduled', `Rescheduled from ${old.date} to ${updates.date}`, old.date, updates.date);
    }

    this.data.tasks[idx] = {
      ...old,
      ...updates,
      updatedAt: nowIso,
    };

    this.save();
    return this.data.tasks[idx];
  }

  deleteTask(id: string, soft = true): boolean {
    const idx = this.data.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return false;

    if (soft) {
      // RULE 8: Soft delete so historical reporting and analytics remain intact
      this.data.tasks[idx].isArchived = true;
      this.data.tasks[idx].updatedAt = new Date().toISOString();
      this.recordHistory(id, this.data.tasks[idx].userId, 'edited', 'Task archived/deleted');
    } else {
      this.data.tasks.splice(idx, 1);
    }
    this.save();
    return true;
  }

  // --- Subtasks ---
  addSubtask(taskId: string, title: string): Subtask | undefined {
    const task = this.getTaskById(taskId);
    if (!task) return undefined;

    const newSub: Subtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      taskId,
      title,
      isCompleted: false,
      position: task.subtasks.length,
      createdAt: new Date().toISOString(),
    };

    task.subtasks.push(newSub);
    task.updatedAt = new Date().toISOString();
    this.recordHistory(taskId, task.userId, 'subtask_toggled', `Added subtask: "${title}"`);
    this.save();
    return newSub;
  }

  toggleSubtask(taskId: string, subtaskId: string): Subtask | undefined {
    const task = this.getTaskById(taskId);
    if (!task) return undefined;

    const sub = task.subtasks.find((s) => s.id === subtaskId);
    if (!sub) return undefined;

    sub.isCompleted = !sub.isCompleted;
    task.updatedAt = new Date().toISOString();
    this.recordHistory(taskId, task.userId, 'subtask_toggled', `Subtask "${sub.title}" marked ${sub.isCompleted ? 'done' : 'pending'}`);
    this.save();
    return sub;
  }

  deleteSubtask(taskId: string, subtaskId: string): boolean {
    const task = this.getTaskById(taskId);
    if (!task) return false;

    const initialLen = task.subtasks.length;
    task.subtasks = task.subtasks.filter((s) => s.id !== subtaskId);
    if (task.subtasks.length < initialLen) {
      task.updatedAt = new Date().toISOString();
      this.save();
      return true;
    }
    return false;
  }

  // --- Time Tracking & Timer (RULE 5 & RULE 6) ---
  startTaskTimer(taskId: string, userId: string): Task | undefined {
    const task = this.getTaskById(taskId);
    if (!task) return undefined;

    const nowIso = new Date().toISOString();
    task.status = 'in_progress';
    task.activeSessionStart = nowIso;
    task.updatedAt = nowIso;

    this.recordHistory(taskId, userId, 'timer_started', 'Timer started');
    this.save();
    return task;
  }

  pauseTaskTimer(taskId: string, userId: string, elapsedMinutes?: number): Task | undefined {
    const task = this.getTaskById(taskId);
    if (!task) return undefined;

    const nowIso = new Date().toISOString();
    let additionalMinutes = 0;
    if (elapsedMinutes !== undefined) {
      additionalMinutes = elapsedMinutes;
    } else if (task.activeSessionStart) {
      const diffMs = Date.now() - new Date(task.activeSessionStart).getTime();
      additionalMinutes = Math.max(1, Math.round(diffMs / 60000));
    }

    task.actualDurationMinutes = (task.actualDurationMinutes || 0) + additionalMinutes;
    task.status = 'paused';
    task.activeSessionStart = null;
    task.updatedAt = nowIso;

    // Record session
    this.data.sessions.push({
      id: `sess-${Date.now()}`,
      taskId,
      userId,
      startTime: task.activeSessionStart || nowIso,
      endTime: nowIso,
      durationMinutes: additionalMinutes,
      sessionType: 'focus',
      createdAt: nowIso,
    });

    this.recordHistory(taskId, userId, 'timer_paused', `Timer paused (+${additionalMinutes}m focus logged)`);
    this.save();
    return task;
  }

  resumeTaskTimer(taskId: string, userId: string): Task | undefined {
    const task = this.getTaskById(taskId);
    if (!task) return undefined;

    const nowIso = new Date().toISOString();
    task.status = 'in_progress';
    task.activeSessionStart = nowIso;
    task.updatedAt = nowIso;

    this.recordHistory(taskId, userId, 'timer_resumed', 'Timer resumed');
    this.save();
    return task;
  }

  completeTaskTimer(taskId: string, userId: string, finalMinutes?: number): Task | undefined {
    const task = this.getTaskById(taskId);
    if (!task) return undefined;

    const nowIso = new Date().toISOString();
    let additionalMinutes = 0;
    if (finalMinutes !== undefined) {
      additionalMinutes = finalMinutes;
    } else if (task.activeSessionStart) {
      const diffMs = Date.now() - new Date(task.activeSessionStart).getTime();
      additionalMinutes = Math.max(1, Math.round(diffMs / 60000));
    }

    task.actualDurationMinutes = (task.actualDurationMinutes || 0) + additionalMinutes;
    task.status = 'completed';
    task.completedAt = nowIso;
    task.activeSessionStart = null;
    task.updatedAt = nowIso;

    if (additionalMinutes > 0) {
      this.data.sessions.push({
        id: `sess-${Date.now()}`,
        taskId,
        userId,
        startTime: nowIso,
        endTime: nowIso,
        durationMinutes: additionalMinutes,
        sessionType: 'focus',
        createdAt: nowIso,
      });
    }

    this.recordHistory(taskId, userId, 'completed', `Task completed! Total actual duration: ${task.actualDurationMinutes}m`);
    this.clearTaskReminders(taskId);

    // Create completion celebratory notification
    this.createNotification({
      userId,
      taskId,
      type: 'completed',
      title: `Task Completed: ${task.title}`,
      message: `Completed in ${Math.floor(task.actualDurationMinutes / 60)}h ${task.actualDurationMinutes % 60}m. Excellent work!`,
    });

    this.save();
    return task;
  }

  adjustTaskTime(taskId: string, userId: string, manualActualMinutes: number): Task | undefined {
    const task = this.getTaskById(taskId);
    if (!task) return undefined;

    const old = task.actualDurationMinutes;
    task.actualDurationMinutes = manualActualMinutes;
    task.updatedAt = new Date().toISOString();
    this.recordHistory(taskId, userId, 'time_adjusted', `Manual time adjusted from ${old}m to ${manualActualMinutes}m`);
    this.save();
    return task;
  }

  // --- Auto Overdue Detection (RULE 3) ---
  autoCheckOverdue(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().slice(0, 5); // HH:mm

    let changed = false;
    for (const t of this.data.tasks) {
      if (t.userId === userId && !t.isArchived && t.status !== 'completed' && t.status !== 'cancelled') {
        const isPastDate = t.date < today;
        const isPastTodayTime = t.date === today && t.endTime && t.endTime < nowTime;
        if ((isPastDate || isPastTodayTime) && t.status !== 'overdue') {
          t.status = 'overdue';
          t.updatedAt = new Date().toISOString();
          changed = true;
          this.recordHistory(t.id, userId, 'status_changed', 'Task marked overdue automatically as scheduled time elapsed');

          // Notify user
          this.createNotification({
            userId,
            taskId: t.id,
            type: 'overdue',
            title: `Task Overdue: ${t.title}`,
            message: `Scheduled deadline has passed. Reschedule or complete this task to maintain your score!`,
          });
        }
      }
    }
    if (changed) this.save();
  }

  // --- Carry Over Tasks To Tomorrow (Phase 24) ---
  carryOverToTomorrow(userId: string, taskIds: string[]): Task[] {
    const moved: Task[] = [];
    for (const id of taskIds) {
      const task = this.getTaskById(id);
      if (task && task.userId === userId) {
        task.date = tomorrowStr;
        task.status = 'pending';
        task.updatedAt = new Date().toISOString();
        this.recordHistory(task.id, userId, 'rescheduled', `Carried over to tomorrow (${tomorrowStr})`);
        moved.push(task);
      }
    }
    this.save();
    return moved;
  }

  // --- History & Audit ---
  recordHistory(
    taskId: string,
    userId: string,
    eventType: TaskHistoryItem['eventType'],
    description: string,
    oldValue?: string,
    newValue?: string
  ): TaskHistoryItem {
    const item: TaskHistoryItem = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      taskId,
      userId,
      eventType,
      description,
      oldValue,
      newValue,
      timestamp: new Date().toISOString(),
    };
    this.data.history.unshift(item);
    if (this.data.history.length > 1000) this.data.history.pop();
    return item;
  }

  getTaskHistory(taskId: string): TaskHistoryItem[] {
    return this.data.history.filter((h) => h.taskId === taskId);
  }

  // --- Notifications ---
  getNotifications(userId: string): NotificationItem[] {
    return this.data.notifications.filter((n) => n.userId === userId).slice(0, 50);
  }

  createNotification(notif: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>): NotificationItem {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.unshift(newNotif);
    if (this.data.notifications.length > 500) this.data.notifications.pop();
    this.save();
    return newNotif;
  }

  markNotificationRead(id: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.save();
      return true;
    }
    return false;
  }

  markAllNotificationsRead(userId: string): boolean {
    let changed = false;
    for (const n of this.data.notifications) {
      if (n.userId === userId && !n.isRead) {
        n.isRead = true;
        changed = true;
      }
    }
    if (changed) this.save();
    return true;
  }

  deleteNotification(id: string): boolean {
    const idx = this.data.notifications.findIndex((n) => n.id === id);
    if (idx !== -1) {
      this.data.notifications.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  private clearTaskReminders(taskId: string) {
    // Dismiss active reminder notifications for this task
    for (const n of this.data.notifications) {
      if (n.taskId === taskId && n.type === 'reminder') {
        n.isRead = true;
      }
    }
  }

  // --- Goals ---
  getGoals(userId: string): Goal[] {
    return this.data.goals.filter((g) => g.userId === userId);
  }

  updateGoal(id: string, updates: Partial<Goal>): Goal | undefined {
    const idx = this.data.goals.findIndex((g) => g.id === id);
    if (idx === -1) return undefined;
    this.data.goals[idx] = { ...this.data.goals[idx], ...updates };
    this.save();
    return this.data.goals[idx];
  }

  // --- Productivity Calculations (Phase 11, 16, 17) ---
  getProductivityBreakdown(userId: string, date: string): ProductivityScoreBreakdown {
    const userTasks = this.data.tasks.filter((t) => t.userId === userId && !t.isArchived && t.date === date);

    const plannedCount = userTasks.length;
    const completedTasks = userTasks.filter((t) => t.status === 'completed');
    const overdueTasks = userTasks.filter((t) => t.status === 'overdue');

    const completedCount = completedTasks.length;
    const plannedMinutes = userTasks.reduce((acc, t) => acc + (t.estimatedDurationMinutes || 60), 0);
    const actualMinutes = userTasks.reduce((acc, t) => acc + (t.actualDurationMinutes || 0), 0);

    // 1. Task completion rate (40% weight)
    const taskCompletionRate = plannedCount > 0 ? Math.round((completedCount / plannedCount) * 100) : 100;

    // 2. Priority weighted completion (30% weight)
    const priorityWeights: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
    let totalPriorityPoints = 0;
    let earnedPriorityPoints = 0;
    for (const t of userTasks) {
      const weight = priorityWeights[t.priority] || 2;
      totalPriorityPoints += weight;
      if (t.status === 'completed') {
        earnedPriorityPoints += weight;
      }
    }
    const priorityWeightedScore = totalPriorityPoints > 0 ? Math.round((earnedPriorityPoints / totalPriorityPoints) * 100) : 100;

    // 3. Focus goal achievement (20% weight)
    const focusTarget = 240; // 4 hours standard
    const focusAchievementRate = Math.min(100, Math.round((actualMinutes / focusTarget) * 100));

    // 4. Overdue penalty & consistency (10% weight)
    const overduePenalty = overdueTasks.length * 15;
    const consistencyRate = Math.max(0, 100 - overduePenalty);

    // Transparent formula: 0.40 * TaskCompletion + 0.30 * PriorityCompletion + 0.20 * FocusAchieved + 0.10 * Consistency
    const overallScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          0.4 * taskCompletionRate +
          0.3 * priorityWeightedScore +
          0.2 * focusAchievementRate +
          0.1 * consistencyRate
        )
      )
    );

    return {
      score: overallScore,
      taskCompletionRate,
      priorityWeightedScore,
      focusAchievementRate,
      consistencyRate,
      plannedTasksCount: plannedCount,
      completedTasksCount: completedCount,
      plannedMinutes,
      actualMinutes,
      overdueCount: overdueTasks.length,
      explanation:
        'Calculated using: 40% Completion Rate + 30% Priority-Weighted Impact + 20% Focus Goal + 10% Consistency.',
    };
  }

  getDailySummary(userId: string, date: string): DailySummaryStats {
    const tasks = this.data.tasks.filter((t) => t.userId === userId && !t.isArchived && t.date === date);
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const pending = tasks.filter((t) => t.status === 'pending').length;
    const overdue = tasks.filter((t) => t.status === 'overdue').length;
    const cancelled = tasks.filter((t) => t.status === 'cancelled').length;

    const plannedMinutes = tasks.reduce((acc, t) => acc + (t.estimatedDurationMinutes || 0), 0);
    const actualMinutes = tasks.reduce((acc, t) => acc + (t.actualDurationMinutes || 0), 0);
    const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
    const productivity = this.getProductivityBreakdown(userId, date).score;

    return {
      date,
      totalTasks: tasks.length,
      completed,
      inProgress,
      pending,
      overdue,
      cancelled,
      plannedMinutes,
      actualMinutes,
      completionRate,
      productivityScore: productivity,
    };
  }

  // --- Reports (Phase 18) ---
  getReports(userId: string, days = 7) {
    const dates: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(formatDate(d));
    }

    const summaries = dates.map((d) => this.getDailySummary(userId, d));

    const allUserTasks = this.data.tasks.filter((t) => t.userId === userId && !t.isArchived);
    const categoryCounts: Record<string, { name: string; color: string; count: number }> = {};
    for (const t of allUserTasks) {
      if (!categoryCounts[t.categoryName]) {
        categoryCounts[t.categoryName] = { name: t.categoryName, color: t.categoryColor, count: 0 };
      }
      categoryCounts[t.categoryName].count++;
    }

    const totalCompleted = summaries.reduce((acc, s) => acc + s.completed, 0);
    const totalPlanned = summaries.reduce((acc, s) => acc + s.totalTasks, 0);
    const totalFocusMinutes = summaries.reduce((acc, s) => acc + s.actualMinutes, 0);

    return {
      summaries,
      totalCompleted,
      totalPlanned,
      totalFocusMinutes,
      averageProductivity: Math.round(summaries.reduce((acc, s) => acc + s.productivityScore, 0) / Math.max(1, summaries.length)),
      categoryBreakdown: Object.values(categoryCounts),
    };
  }

  // --- Admin Dashboard Stats (Phase 27) ---
  getAdminStats(): AdminDashboardStats {
    const totalUsers = this.data.users.length;
    const activeUsers = this.data.users.filter((u) => u.isActive).length;
    const nonArchivedTasks = this.data.tasks.filter((t) => !t.isArchived);
    const totalTasks = nonArchivedTasks.length;
    const completedTasks = nonArchivedTasks.filter((t) => t.status === 'completed').length;
    const pendingTasks = nonArchivedTasks.filter((t) => t.status === 'pending').length;
    const overdueTasks = nonArchivedTasks.filter((t) => t.status === 'overdue').length;

    const totalMinutes = nonArchivedTasks.reduce((acc, t) => acc + (t.actualDurationMinutes || 0), 0);
    const totalFocusHours = Math.round((totalMinutes / 60) * 10) / 10;
    const overallCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Trend last 7 days
    const taskTrends: { date: string; created: number; completed: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = formatDate(d);
      const createdOnDay = nonArchivedTasks.filter((t) => t.createdAt.startsWith(dStr)).length;
      const completedOnDay = nonArchivedTasks.filter((t) => t.completedAt && t.completedAt.startsWith(dStr)).length;
      taskTrends.push({ date: dStr.slice(5), created: createdOnDay, completed: completedOnDay });
    }

    const statusCounts: Record<string, number> = {
      completed: completedTasks,
      in_progress: nonArchivedTasks.filter((t) => t.status === 'in_progress').length,
      pending: pendingTasks,
      overdue: overdueTasks,
      paused: nonArchivedTasks.filter((t) => t.status === 'paused').length,
    };

    const statusDistribution = [
      { status: 'Completed', count: statusCounts.completed, color: '#10b981' },
      { status: 'In Progress', count: statusCounts.in_progress, color: '#0d9488' },
      { status: 'Pending', count: statusCounts.pending, color: '#6366f1' },
      { status: 'Overdue', count: statusCounts.overdue, color: '#ef4444' },
      { status: 'Paused', count: statusCounts.paused, color: '#f59e0b' },
    ];

    const priorityCounts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const t of nonArchivedTasks) {
      if (priorityCounts[t.priority] !== undefined) priorityCounts[t.priority]++;
    }

    const priorityDistribution = [
      { priority: 'Critical', count: priorityCounts.critical, color: '#dc2626' },
      { priority: 'High', count: priorityCounts.high, color: '#f97316' },
      { priority: 'Medium', count: priorityCounts.medium, color: '#3b82f6' },
      { priority: 'Low', count: priorityCounts.low, color: '#10b981' },
    ];

    return {
      totalUsers,
      activeUsers,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      totalFocusHours,
      overallCompletionRate,
      userGrowth: [
        { label: 'Week 1', count: 1 },
        { label: 'Week 2', count: 2 },
        { label: 'Week 3', count: 4 },
        { label: 'Week 4', count: totalUsers },
      ],
      taskTrends,
      statusDistribution,
      priorityDistribution,
    };
  }
}

export const db = new MemoryDatabase();
