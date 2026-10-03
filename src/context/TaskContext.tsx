import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Task,
  Category,
  NotificationItem,
  Goal,
  DailySummaryStats,
  ProductivityScoreBreakdown,
  Priority,
  TaskStatus,
} from '../types/index.ts';
import { api } from '../api/client.ts';
import { useAuth } from './AuthContext.tsx';

interface TaskContextType {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  tasks: Task[];
  filteredTasks: Task[];
  allTasks: Task[];
  categories: Category[];
  notifications: NotificationItem[];
  unreadNotifCount: number;
  goals: Goal[];
  summary: DailySummaryStats | null;
  productivity: ProductivityScoreBreakdown | null;
  isLoading: boolean;
  isSyncing: boolean;
  isOnline: boolean;
  // Live Timer
  activeRunningTask: Task | null;
  timerSeconds: number;
  isTimerRunning: boolean;
  startTimer: (task: Task) => Promise<void>;
  pauseTimer: (task: Task) => Promise<void>;
  resumeTimer: (task: Task) => Promise<void>;
  completeTimer: (task: Task) => Promise<void>;
  adjustTime: (task: Task, minutes: number) => Promise<void>;
  // Task CRUD
  createTask: (data: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  rescheduleTask: (id: string, newDate: string, startTime?: string) => Promise<void>;
  carryOverTasks: (taskIds: string[]) => Promise<void>;
  // Subtasks
  addSubtask: (taskId: string, title: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  // Categories
  createCategory: (name: string, color: string) => Promise<Category>;
  // Notifications
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  // Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  priorityFilter: string;
  setPriorityFilter: (p: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  // Modals & Navigation
  activeTab: 'home' | 'calendar' | 'reports' | 'profile';
  setActiveTab: (tab: 'home' | 'calendar' | 'reports' | 'profile') => void;
  isAddTaskOpen: boolean;
  setIsAddTaskOpen: (open: boolean) => void;
  selectedTaskDetail: Task | null;
  setSelectedTaskDetail: (t: Task | null) => void;
  isNotificationCenterOpen: boolean;
  setIsNotificationCenterOpen: (open: boolean) => void;
  isTomorrowPlanOpen: boolean;
  setIsTomorrowPlanOpen: (open: boolean) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  isApkModalOpen: boolean;
  setIsApkModalOpen: (open: boolean) => void;
  refreshAll: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [summary, setSummary] = useState<DailySummaryStats | null>(null);
  const [productivity, setProductivity] = useState<ProductivityScoreBreakdown | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'reports' | 'profile'>('home');
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(null);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isTomorrowPlanOpen, setIsTomorrowPlanOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);

  // Live Timer states
  const [activeRunningTask, setActiveRunningTask] = useState<Task | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch all core data
  const refreshAll = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    try {
      setIsSyncing(true);
      const [fetchedTasks, fetchedAllTasks, fetchedCats, fetchedNotifs, fetchedGoals, fetchedSummary, fetchedProd] =
        await Promise.all([
          api.getTasks({ date: selectedDate }),
          api.getTasks(), // all tasks
          api.getCategories(),
          api.getNotifications(),
          api.getGoals(),
          api.getDailySummary(selectedDate),
          api.getProductivity(selectedDate),
        ]);

      setTasks(fetchedTasks);
      setAllTasks(fetchedAllTasks);
      setCategories(fetchedCats);
      setNotifications(fetchedNotifs);
      setGoals(fetchedGoals);
      setSummary(fetchedSummary);
      setProductivity(fetchedProd);

      // Check if there is an in-progress running task
      const running = fetchedAllTasks.find((t) => t.status === 'in_progress' && t.activeSessionStart);
      if (running) {
        setActiveRunningTask(running);
        const elapsed = Math.floor((Date.now() - new Date(running.activeSessionStart!).getTime()) / 1000);
        setTimerSeconds(Math.max(0, elapsed));
      } else if (activeRunningTask && !fetchedAllTasks.some((t) => t.id === activeRunningTask.id && t.status === 'in_progress')) {
        setActiveRunningTask(null);
        setTimerSeconds(0);
      }
    } catch (e) {
      console.warn('Error fetching task tracker state:', e);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [selectedDate, user?.id]);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setAllTasks([]);
      setCategories([]);
      setNotifications([]);
      setGoals([]);
      setSummary(null);
      setProductivity(null);
      setIsLoading(false);
      return;
    }
    refreshAll();
  }, [refreshAll, user?.id]);

  // Timer interval ticker
  useEffect(() => {
    if (!activeRunningTask) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeRunningTask]);

  // Audio chime feedback for timer
  const playChime = (type: 'start' | 'complete') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'start') {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else {
        // Complete fanfare
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      }
    } catch {}
  };

  // Timer controls
  const startTimer = async (task: Task) => {
    playChime('start');
    const updated = await api.startTimer(task.id);
    setActiveRunningTask(updated);
    setTimerSeconds(0);
    await refreshAll();
  };

  const pauseTimer = async (task: Task) => {
    const elapsedMinutes = Math.max(1, Math.round(timerSeconds / 60));
    await api.pauseTimer(task.id, elapsedMinutes);
    setActiveRunningTask(null);
    setTimerSeconds(0);
    await refreshAll();
  };

  const resumeTimer = async (task: Task) => {
    playChime('start');
    const updated = await api.resumeTimer(task.id);
    setActiveRunningTask(updated);
    setTimerSeconds(0);
    await refreshAll();
  };

  const completeTimer = async (task: Task) => {
    playChime('complete');
    const finalMinutes = Math.max(1, Math.round(timerSeconds / 60));
    await api.completeTimer(task.id, finalMinutes);
    setActiveRunningTask(null);
    setTimerSeconds(0);
    await refreshAll();
  };

  const adjustTime = async (task: Task, minutes: number) => {
    await api.adjustTime(task.id, minutes);
    await refreshAll();
  };

  // Task actions
  const createTask = async (data: Partial<Task>): Promise<Task> => {
    const created = await api.createTask(data);
    await refreshAll();
    return created;
  };

  const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
    const updated = await api.updateTask(id, updates);
    await refreshAll();
    if (selectedTaskDetail?.id === id) {
      setSelectedTaskDetail(updated);
    }
    return updated;
  };

  const deleteTask = async (id: string) => {
    await api.deleteTask(id);
    if (selectedTaskDetail?.id === id) {
      setSelectedTaskDetail(null);
    }
    await refreshAll();
  };

  const rescheduleTask = async (id: string, newDate: string, startTime?: string) => {
    const updates: Partial<Task> = { date: newDate, status: 'pending' };
    if (startTime) updates.startTime = startTime;
    await api.updateTask(id, updates);
    await refreshAll();
  };

  const carryOverTasks = async (taskIds: string[]) => {
    await api.carryOverTasks(taskIds);
    await refreshAll();
  };

  // Subtasks
  const addSubtask = async (taskId: string, title: string) => {
    await api.addSubtask(taskId, title);
    const updated = await api.getTasks({ date: selectedDate });
    const match = updated.find((t) => t.id === taskId);
    if (match && selectedTaskDetail?.id === taskId) {
      setSelectedTaskDetail(match);
    }
    await refreshAll();
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    await api.toggleSubtask(taskId, subtaskId);
    await refreshAll();
  };

  const deleteSubtask = async (taskId: string, subtaskId: string) => {
    await api.deleteSubtask(taskId, subtaskId);
    await refreshAll();
  };

  // Categories
  const createCategory = async (name: string, color: string) => {
    const cat = await api.createCategory(name, color);
    await refreshAll();
    return cat;
  };

  // Notifications
  const markNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = async (id: string) => {
    await api.deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Filtered tasks computation
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (categoryFilter !== 'all' && t.categoryId !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description.toLowerCase().includes(q);
        const matchCat = t.categoryName.toLowerCase().includes(q);
        const matchTag = t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchCat && !matchTag) return false;
      }
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, categoryFilter, searchQuery]);

  const unreadNotifCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  return (
    <TaskContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        tasks,
        filteredTasks,
        allTasks,
        categories,
        notifications,
        unreadNotifCount,
        goals,
        summary,
        productivity,
        isLoading,
        isSyncing,
        isOnline,
        activeRunningTask,
        timerSeconds,
        isTimerRunning: !!activeRunningTask,
        startTimer,
        pauseTimer,
        resumeTimer,
        completeTimer,
        adjustTime,
        createTask,
        updateTask,
        deleteTask,
        rescheduleTask,
        carryOverTasks,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        createCategory,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        priorityFilter,
        setPriorityFilter,
        categoryFilter,
        setCategoryFilter,
        activeTab,
        setActiveTab,
        isAddTaskOpen,
        setIsAddTaskOpen,
        selectedTaskDetail,
        setSelectedTaskDetail,
        isNotificationCenterOpen,
        setIsNotificationCenterOpen,
        isTomorrowPlanOpen,
        setIsTomorrowPlanOpen,
        isOnboardingOpen,
        setIsOnboardingOpen,
        isApkModalOpen,
        setIsApkModalOpen,
        refreshAll,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
}
