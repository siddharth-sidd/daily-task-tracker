export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'pending' | 'in_progress' | 'paused' | 'completed' | 'overdue' | 'cancelled';
export type ReminderType = 'at_start' | '15m_before' | '30m_before' | '1h_before' | 'after_end' | 'none';
export type RecurringPattern = 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'custom' | null;
export type AdminRole = 'super_admin' | 'admin' | 'support_viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  timezone: string;
  dailyTaskGoal: number; // e.g. 5 tasks
  dailyFocusGoalMinutes: number; // e.g. 240 mins (4 hours)
  reminderSettings: {
    enabled: boolean;
    frequency: 'low' | 'normal' | 'high';
    sound: boolean;
    vibrate: boolean;
  };
  notificationPrefs: {
    taskReminders: boolean;
    overdueAlerts: boolean;
    dailySummary: boolean;
    goalMilestones: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  role: 'user' | 'admin' | 'super_admin';
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatarUrl?: string;
  lastActive: string;
  createdAt: string;
}

export interface Category {
  id: string;
  userId?: string; // null if system category
  name: string;
  color: string;
  icon?: string;
  isSystem: boolean;
  createdAt: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  position: number;
  createdAt: string;
}

export interface TaskTimeSession {
  id: string;
  taskId: string;
  userId: string;
  startTime: string; // ISO
  endTime?: string; // ISO, undefined if currently running
  durationMinutes: number;
  sessionType: 'focus' | 'break';
  createdAt: string;
}

export interface TaskHistoryItem {
  id: string;
  taskId: string;
  userId: string;
  eventType:
    | 'created'
    | 'status_changed'
    | 'priority_changed'
    | 'rescheduled'
    | 'timer_started'
    | 'timer_paused'
    | 'timer_resumed'
    | 'completed'
    | 'subtask_toggled'
    | 'edited'
    | 'time_adjusted';
  description: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  priority: Priority;
  status: TaskStatus;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm e.g. '10:00'
  endTime: string; // HH:mm e.g. '15:00'
  estimatedDurationMinutes: number; // in minutes
  actualDurationMinutes: number; // calculated from sessions
  pausedDurationMinutes: number;
  activeSessionStart?: string | null; // ISO timestamp if running
  reminderType: ReminderType;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  recurringDays?: number[]; // [1, 3, 5] for Mon, Wed, Fri
  recurringEndDate?: string | null;
  dueDate: string; // YYYY-MM-DD or YYYY-MM-DD HH:mm
  tags: string[];
  notes?: string;
  subtasks: Subtask[];
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'reminder' | 'overdue' | 'completed' | 'daily_summary' | 'goal_met' | 'system';
  title: string;
  message: string;
  taskId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  type: 'daily_tasks' | 'daily_focus' | 'weekly_completion' | 'high_priority';
  targetValue: number;
  currentValue: number;
  unit: string;
  period: 'daily' | 'weekly';
  isMet: boolean;
}

export interface ProductivityScoreBreakdown {
  score: number; // 0 - 100
  taskCompletionRate: number; // 0 - 100
  priorityWeightedScore: number; // 0 - 100
  focusAchievementRate: number; // 0 - 100
  consistencyRate: number; // 0 - 100
  plannedTasksCount: number;
  completedTasksCount: number;
  plannedMinutes: number;
  actualMinutes: number;
  overdueCount: number;
  explanation: string;
}

export interface DailySummaryStats {
  date: string;
  totalTasks: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
  cancelled: number;
  plannedMinutes: number;
  actualMinutes: number;
  completionRate: number;
  productivityScore: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  totalFocusHours: number;
  overallCompletionRate: number;
  userGrowth: { label: string; count: number }[];
  taskTrends: { date: string; created: number; completed: number }[];
  statusDistribution: { status: string; count: number; color: string }[];
  priorityDistribution: { priority: string; count: number; color: string }[];
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: 'user' | 'task' | 'category' | 'settings';
  targetId: string;
  targetTitle?: string;
  details: string;
  timestamp: string;
}

export interface SystemSettingsConfig {
  defaultTaskDurationMinutes: number;
  defaultPriority: Priority;
  weekStartDay: 'sunday' | 'monday';
  maxDailyReminderFrequency: number;
  maintenanceMode: boolean;
  allowUserRegistration: boolean;
  reminderIntervals: { id: string; label: string; offsetMinutes: number }[];
}
