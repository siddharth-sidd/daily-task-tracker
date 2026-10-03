import {
  Task,
  Category,
  NotificationItem,
  Goal,
  AdminUser,
  DailySummaryStats,
  ProductivityScoreBreakdown,
  User,
  AdminDashboardStats,
  AdminAuditLog,
  SystemSettingsConfig,
} from '../types/index.ts';

const USER_ID_KEY = 'tasktracker_userid';
const USER_TOKEN_KEY = 'tasktracker_user_token';
const CACHE_TASKS_KEY = 'tasktracker_cached_tasks';
const ADMIN_TOKEN_KEY = 'tasktracker_admin_token';

export function getStoredAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setStoredAdminToken(token: string): void {
  if (typeof window !== 'undefined') localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearStoredAdminToken(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function getStoredUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_ID_KEY);
}

export function setStoredUserId(id: string) {
  if (typeof window !== 'undefined') {
    if (localStorage.getItem(USER_ID_KEY) !== id) localStorage.removeItem(`${CACHE_TASKS_KEY}:${localStorage.getItem(USER_ID_KEY) || 'anonymous'}`);
    localStorage.setItem(USER_ID_KEY, id);
  }
}

export function getStoredUserToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_TOKEN_KEY);
}

export function setStoredUserToken(token: string): void {
  if (typeof window !== 'undefined') localStorage.setItem(USER_TOKEN_KEY, token);
}

export function clearStoredUserToken(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(USER_TOKEN_KEY);
}

export function clearStoredUserId() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${CACHE_TASKS_KEY}:${localStorage.getItem(USER_ID_KEY) || 'anonymous'}`);
    localStorage.removeItem(USER_ID_KEY);
  }
}

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(getStoredUserToken() ? { Authorization: `Bearer ${getStoredUserToken()}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `Request failed with status ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (err: any) {
    console.warn(`Fetch error for ${url}:`, err.message);
    throw err;
  }
}

export const api = {
  // --- Tasks ---
  async getTasks(params?: { date?: string; status?: string; search?: string }): Promise<Task[]> {
    const query = new URLSearchParams();
    if (params?.date) query.set('date', params.date);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    try {
      const data = await fetchJson<{ tasks: Task[] }>(`/api/tasks?${query.toString()}`);
      if (typeof window !== 'undefined' && (!params || !params.search)) {
        localStorage.setItem(`${CACHE_TASKS_KEY}:${getStoredUserId() || 'anonymous'}`, JSON.stringify(data.tasks));
      }
      return data.tasks;
    } catch (err) {
      // Fallback to cache if offline
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(`${CACHE_TASKS_KEY}:${getStoredUserId() || 'anonymous'}`);
        if (cached) {
          try {
            let list: Task[] = JSON.parse(cached);
            if (params?.date) list = list.filter((t) => t.date === params.date);
            if (params?.status && params.status !== 'all') list = list.filter((t) => t.status === params.status);
            return list;
          } catch {}
        }
      }
      throw err;
    }
  },

  async createTask(taskData: Partial<Task>): Promise<Task> {
    const data = await fetchJson<{ task: Task }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
    return data.task;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const data = await fetchJson<{ task: Task }>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.task;
  },

  async deleteTask(id: string): Promise<boolean> {
    const data = await fetchJson<{ success: boolean }>(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
    return data.success;
  },

  // --- Timer & Tracking ---
  async startTimer(id: string): Promise<Task> {
    const data = await fetchJson<{ task: Task }>(`/api/tasks/${id}/start`, { method: 'POST' });
    return data.task;
  },

  async pauseTimer(id: string, elapsedMinutes?: number): Promise<Task> {
    const data = await fetchJson<{ task: Task }>(`/api/tasks/${id}/pause`, {
      method: 'POST',
      body: JSON.stringify({ elapsedMinutes }),
    });
    return data.task;
  },

  async resumeTimer(id: string): Promise<Task> {
    const data = await fetchJson<{ task: Task }>(`/api/tasks/${id}/resume`, { method: 'POST' });
    return data.task;
  },

  async completeTimer(id: string, finalMinutes?: number): Promise<Task> {
    const data = await fetchJson<{ task: Task }>(`/api/tasks/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ finalMinutes }),
    });
    return data.task;
  },

  async adjustTime(id: string, minutes: number): Promise<Task> {
    const data = await fetchJson<{ task: Task }>(`/api/tasks/${id}/adjust-time`, {
      method: 'POST',
      body: JSON.stringify({ minutes }),
    });
    return data.task;
  },

  // --- Subtasks ---
  async addSubtask(taskId: string, title: string) {
    return fetchJson<{ subtask: any }>(`/api/tasks/${taskId}/subtasks`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  async toggleSubtask(taskId: string, subtaskId: string) {
    return fetchJson<{ subtask: any }>(`/api/tasks/${taskId}/subtasks/${subtaskId}/toggle`, {
      method: 'PUT',
    });
  },

  async deleteSubtask(taskId: string, subtaskId: string) {
    return fetchJson<{ success: boolean }>(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'DELETE',
    });
  },

  // --- Task History ---
  async getTaskHistory(taskId: string) {
    const data = await fetchJson<{ history: any[] }>(`/api/tasks/${taskId}/history`);
    return data.history;
  },

  // --- Carry Over to Tomorrow ---
  async carryOverTasks(taskIds: string[]) {
    return fetchJson<{ moved: Task[]; count: number }>('/api/tasks/carry-over', {
      method: 'POST',
      body: JSON.stringify({ taskIds }),
    });
  },

  // --- Analytics & Stats ---
  async getDailySummary(date: string): Promise<DailySummaryStats> {
    const data = await fetchJson<{ summary: DailySummaryStats }>(`/api/analytics/summary?date=${date}`);
    return data.summary;
  },

  async getProductivity(date: string): Promise<ProductivityScoreBreakdown> {
    const data = await fetchJson<{ breakdown: ProductivityScoreBreakdown }>(`/api/analytics/productivity?date=${date}`);
    return data.breakdown;
  },

  async getReports(days = 7): Promise<any> {
    const data = await fetchJson<{ reports: any }>(`/api/analytics/reports?days=${days}`);
    return data.reports;
  },

  async getCategories(): Promise<Category[]> {
    const data = await fetchJson<{ categories: Category[] }>('/api/analytics/categories');
    return data.categories;
  },

  async createCategory(name: string, color: string): Promise<Category> {
    const data = await fetchJson<{ category: Category }>('/api/analytics/categories', {
      method: 'POST',
      body: JSON.stringify({ name, color }),
    });
    return data.category;
  },

  async getGoals(): Promise<Goal[]> {
    const data = await fetchJson<{ goals: Goal[] }>('/api/analytics/goals');
    return data.goals;
  },

  // --- Notifications ---
  async getNotifications(): Promise<NotificationItem[]> {
    const data = await fetchJson<{ notifications: NotificationItem[] }>('/api/notifications');
    return data.notifications;
  },

  async markNotificationRead(id: string): Promise<boolean> {
    const data = await fetchJson<{ success: boolean }>(`/api/notifications/${id}/read`, { method: 'PUT' });
    return data.success;
  },

  async markAllNotificationsRead(): Promise<boolean> {
    const data = await fetchJson<{ success: boolean }>('/api/notifications/read-all', { method: 'POST' });
    return data.success;
  },

  async deleteNotification(id: string): Promise<boolean> {
    const data = await fetchJson<{ success: boolean }>(`/api/notifications/${id}`, { method: 'DELETE' });
    return data.success;
  },

  // --- Profile / Auth ---
  async getUserProfile(): Promise<User> {
    const data = await fetchJson<{ user: User }>('/api/auth/me');
    return data.user;
  },

  async updateUserProfile(updates: Partial<User>): Promise<User> {
    const data = await fetchJson<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.user;
  },

  async login(email: string, name: string | undefined, password: string, register: boolean): Promise<{ token: string; user: User }> {
    return fetchJson<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, name, password, register }),
    });
  },

  async logoutUser(): Promise<void> {
    await fetchJson<{ success: boolean }>('/api/auth/logout', { method: 'POST' });
  },
  // --- Admin ---
  async loginAdmin(email: string, password: string): Promise<{ token: string; admin: AdminUser }> {
    return fetchJson<{ token: string; admin: AdminUser }>('/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getAdminSession(token: string): Promise<AdminUser> {
    const data = await fetchJson<{ admin: AdminUser }>('/api/auth/admin-session', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.admin;
  },

  async logoutAdmin(): Promise<void> {
    await fetchJson<{ success: boolean }>('/api/auth/admin-logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${getStoredAdminToken() || ''}` },
    });
  },

  async adminDashboard(): Promise<AdminDashboardStats> {
    const data = await fetchAdminJson<{ stats: AdminDashboardStats }>('/api/admin/dashboard');
    return data.stats;
  },

  async adminUsers(): Promise<any[]> {
    const data = await fetchAdminJson<{ users: any[] }>('/api/admin/users');
    return data.users;
  },

  async adminCreateUser(userData: {
    name: string;
    email: string;
    timezone?: string;
    dailyTaskGoal?: number;
    dailyFocusGoalMinutes?: number;
    role?: string;
  }): Promise<User & { temporaryPassword: string }> {
    const data = await fetchAdminJson<{ user: User; temporaryPassword: string }>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return { ...data.user, temporaryPassword: data.temporaryPassword };
  },

  async adminUpdateUserStatus(id: string, isActive: boolean) {
    return fetchAdminJson<{ user: any }>(`/api/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  },

  async adminUpdateUserRole(id: string, role: 'admin' | 'user') {
    return fetchAdminJson<{ user: any }>(`/api/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  async adminTasks(params?: Record<string, string>): Promise<Task[]> {
    const query = new URLSearchParams(params || {}).toString();
    const data = await fetchAdminJson<{ tasks: Task[] }>(`/api/admin/tasks?${query}`);
    return data.tasks;
  },

  async adminUpdateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const data = await fetchAdminJson<{ task: Task }>(`/api/admin/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.task;
  },

  async adminAuditLogs(): Promise<AdminAuditLog[]> {
    const data = await fetchAdminJson<{ logs: AdminAuditLog[] }>('/api/admin/audit-logs');
    return data.logs;
  },

  async adminSettings(): Promise<SystemSettingsConfig> {
    const data = await fetchAdminJson<{ settings: SystemSettingsConfig }>('/api/admin/settings');
    return data.settings;
  },

  async adminUpdateSettings(updates: Partial<SystemSettingsConfig>): Promise<SystemSettingsConfig> {
    const data = await fetchAdminJson<{ settings: SystemSettingsConfig }>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.settings;
  },

  // --- APK / Android Package ---
  async getAndroidApkBundle(): Promise<any> {
    return fetchJson<any>('/api/download/android-apk-bundle');
  },
};

async function fetchAdminJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredAdminToken();
  if (!token) throw new Error('Administrator authentication required');
  return fetchJson<T>(url, {
    ...options,
    headers: {
      ...(options.headers as Record<string, string>),
      Authorization: `Bearer ${token}`,
    },
  });
}
