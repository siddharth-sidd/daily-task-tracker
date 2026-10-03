import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AdminUser } from '../types/index.ts';
import {
  api,
  clearStoredAdminToken,
  clearStoredUserToken,
  clearStoredUserId,
  getStoredAdminToken,
  getStoredUserToken,
  setStoredAdminToken,
  setStoredUserToken,
  setStoredUserId,
} from '../api/client.ts';

interface AuthContextType {
  user: User | null;
  adminUser: AdminUser | null;
  isUserAdmin: boolean;
  isAdminMode: boolean;
  viewMode: 'mobile_device' | 'mobile_full' | 'admin_panel';
  isLoading: boolean;
  isAdminLoading: boolean;
  isAccountModalOpen: boolean;
  setIsAccountModalOpen: (open: boolean) => void;
  loginUser: (email: string, name: string | undefined, password: string, register: boolean) => Promise<void>;
  loginAdmin: (email: string, password: string) => Promise<void>;
  logoutAdmin: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  setViewMode: (mode: 'mobile_device' | 'mobile_full' | 'admin_panel') => void;
  toggleAdminMode: () => void;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const [viewMode, setViewModeState] = useState<'mobile_device' | 'mobile_full' | 'admin_panel'>('mobile_device');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(() => !getStoredUserToken());
  const [isLoading, setIsLoading] = useState(true);

  // Check if current logged-in user is authorized administrator
  const isUserAdmin = Boolean(adminUser && adminToken);

  // Check URL path and query params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        // Will be validated once user is loaded
        setViewModeState('admin_panel');
      } else {
        const stored = localStorage.getItem('tasktracker_view_mode') as any;
        if (stored && stored !== 'admin_panel') setViewModeState(stored);
      }

      const token = getStoredAdminToken();
      if (!token) {
        setIsAdminLoading(false);
        return;
      }

      api.getAdminSession(token)
        .then((admin) => {
          setAdminToken(token);
          setAdminUser(admin);
        })
        .catch((error) => {
          clearStoredAdminToken();
          if (!(error instanceof Error && error.message.includes('401'))) {
            console.warn('Could not restore administrator session:', error);
          }
        })
        .finally(() => setIsAdminLoading(false));
    }
  }, []);

  const setViewMode = (mode: 'mobile_device' | 'mobile_full' | 'admin_panel') => {
    if (mode === 'admin_panel' && !isUserAdmin) {
      alert('Administrator sign-in is required to access the Admin Panel.');
      return;
    }

    setViewModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tasktracker_view_mode', mode);
      if (mode === 'admin_panel' && window.location.pathname !== '/admin') {
        window.history.pushState({}, '', '/admin');
      } else if (mode !== 'admin_panel' && window.location.pathname === '/admin') {
        window.history.pushState({}, '', '/');
      }
    }
  };

  const loginAdmin = async (email: string, password: string) => {
    const res = await api.loginAdmin(email, password);
    setStoredAdminToken(res.token);
    setAdminToken(res.token);
    setAdminUser(res.admin);
    setViewModeState('admin_panel');
    if (typeof window !== 'undefined') {
      localStorage.setItem('tasktracker_view_mode', 'admin_panel');
      if (window.location.pathname !== '/admin') window.history.pushState({}, '', '/admin');
    }
  };

  const logoutAdmin = async () => {
    try {
      if (adminToken) await api.logoutAdmin();
    } catch (error) {
      console.warn('Could not revoke administrator session:', error);
    } finally {
      clearStoredAdminToken();
      setAdminToken(null);
      setAdminUser(null);
      setViewModeState('mobile_device');
      if (typeof window !== 'undefined') {
        localStorage.setItem('tasktracker_view_mode', 'mobile_device');
        if (window.location.pathname === '/admin') window.history.pushState({}, '', '/');
      }
    }
  };

  const toggleAdminMode = () => {
    if (!isUserAdmin) {
      alert('Administrator sign-in is required to access the Admin Panel.');
      return;
    }
    setViewMode(viewMode === 'admin_panel' ? 'mobile_device' : 'admin_panel');
  };

  const loadProfile = async () => {
    if (!getStoredUserToken()) {
      setUser(null);
      setIsAccountModalOpen(true);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const u = await api.getUserProfile();
      setUser(u);
    } catch (error) {
      clearStoredUserToken();
      clearStoredUserId();
      setUser(null);
      setIsAccountModalOpen(true);
      if (!(error instanceof Error && error.message.includes('Sign in is required'))) {
        console.warn('Could not restore user session:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loginUser = async (email: string, name: string | undefined, password: string, register: boolean) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, name, password, register);
      setStoredUserToken(res.token);
      setStoredUserId(res.user.id);
      setUser(res.user);
      setIsAccountModalOpen(false);
      // Also reload page tasks smoothly
      if (typeof window !== 'undefined') {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = () => {
    void api.logoutUser().catch((error) => {
      console.warn('Could not revoke user session:', error);
    }).finally(() => {
      clearStoredUserToken();
      clearStoredUserId();
      setUser(null);
      setViewModeState('mobile_device');
      setIsAccountModalOpen(true);
    });
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const updated = await api.updateUserProfile(updates);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        adminUser,
        isUserAdmin,
        isAdminMode: viewMode === 'admin_panel' && isUserAdmin,
        viewMode,
        isLoading,
        isAdminLoading,
        isAccountModalOpen,
        setIsAccountModalOpen,
        loginUser,
        loginAdmin,
        logoutAdmin,
        updateUser,
        setViewMode,
        toggleAdminMode,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
