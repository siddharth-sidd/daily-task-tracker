import { Router, RequestHandler } from 'express';
import { randomUUID } from 'crypto';
import { db } from '../db.ts';
import { User } from '../../src/types/index.ts';
import { createUserSession, hashPassword, requireUser, revokeUserSession, verifyPassword } from '../userAuth.ts';
import {
  createAdminSession,
  getAdminSession,
  isAdminConfigured,
  requireAdmin,
  revokeAdminSession,
  verifyAdminCredentials,
} from '../adminAuth.ts';

export const authRouter = Router();

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const limitLoginAttempts: RequestHandler = (req, res, next) => {
  const now = Date.now();
  const address = req.ip || req.socket.remoteAddress || 'unknown';
  const attempt = loginAttempts.get(address);
  if (!attempt || attempt.resetAt <= now) {
    loginAttempts.set(address, { count: 1, resetAt: now + 15 * 60 * 1000 });
  } else if (attempt.count >= 10) {
    res.status(429).json({ error: 'Too many sign-in attempts. Try again in 15 minutes.' });
    return;
  } else {
    attempt.count++;
  }

  if (loginAttempts.size > 10000) {
    for (const [ip, entry] of loginAttempts) {
      if (entry.resetAt <= now) loginAttempts.delete(ip);
    }
  }
  next();
};

// User Login or Register
authRouter.post('/login', limitLoginAttempts, (req, res) => {
  const { email, name, password, register } = req.body;
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: 'A valid email address is required' });
  }
  if (typeof password !== 'string' || password.length < 12 || password.length > 256) {
    return res.status(400).json({ error: 'Password must be between 12 and 256 characters' });
  }

  const cleanEmail = email.trim().toLowerCase();
  let user = db.getUserByEmail(cleanEmail);
  if (register === true) {
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 100) {
      return res.status(400).json({ error: 'Name is required and must be 100 characters or fewer' });
    }
    if (user) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    user = {
      id: `user-${randomUUID()}`,
      name: name.trim(),
      email: cleanEmail,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
      timezone: 'UTC',
      dailyTaskGoal: 5,
      dailyFocusGoalMinutes: 240,
      reminderSettings: { enabled: true, frequency: 'normal', sound: true, vibrate: true },
      notificationPrefs: { taskReminders: true, overdueAlerts: true, dailySummary: true, goalMilestones: true },
      theme: 'light',
      role: 'user',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    db.createUser(user);
    db.setPasswordHash(user.id, hashPassword(password));
  } else {
    const passwordHash = user ? db.getPasswordHash(user.id) : undefined;
    if (!user || !passwordHash || !verifyPassword(password, passwordHash) || !user.isActive) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    user = db.updateUser(user.id, { lastLoginAt: new Date().toISOString() })!;
  }

  const token = createUserSession(user.id);
  return res.json({ token, user });
});

authRouter.post('/admin-login', limitLoginAttempts, (req, res) => {
  const { email, password } = req.body;
  if (!isAdminConfigured()) {
    return res.status(503).json({ error: 'Administrator access is not configured on this server' });
  }
  if (!verifyAdminCredentials(email, password)) {
    return res.status(401).json({ error: 'Invalid administrator credentials' });
  }

  const { token, admin } = createAdminSession();
  db.createAuditLog({
    adminId: admin.id,
    adminName: admin.name,
    action: 'Admin Login',
    targetType: 'user',
    targetId: admin.id,
    details: 'Administrator authenticated into web admin console.',
  });

  return res.json({ token, admin });
});

authRouter.get('/admin-session', requireAdmin, (req, res) => {
  return res.json({ admin: getAdminSession(req) });
});

authRouter.post('/admin-logout', requireAdmin, (req, res) => {
  revokeAdminSession(req);
  return res.json({ success: true });
});

// Current User Profile
authRouter.post('/logout', requireUser, (req, res) => {
  revokeUserSession(req);
  return res.json({ success: true });
});

authRouter.get('/me', requireUser, (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  const user = db.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({ user });
});

// Update Profile
authRouter.put('/profile', requireUser, (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  const { name, timezone, dailyTaskGoal, dailyFocusGoalMinutes, reminderSettings, notificationPrefs, theme, avatarUrl } = req.body;
  const updates: Partial<User> = {};
  if (typeof name === 'string' && name.trim() && name.trim().length <= 100) updates.name = name.trim();
  if (typeof timezone === 'string' && timezone.length <= 64) updates.timezone = timezone;
  if (Number.isFinite(dailyTaskGoal) && dailyTaskGoal >= 1 && dailyTaskGoal <= 100) updates.dailyTaskGoal = dailyTaskGoal;
  if (Number.isFinite(dailyFocusGoalMinutes) && dailyFocusGoalMinutes >= 1 && dailyFocusGoalMinutes <= 1440) {
    updates.dailyFocusGoalMinutes = dailyFocusGoalMinutes;
  }
  if (reminderSettings && typeof reminderSettings === 'object') updates.reminderSettings = reminderSettings;
  if (notificationPrefs && typeof notificationPrefs === 'object') updates.notificationPrefs = notificationPrefs;
  if (['light', 'dark', 'system'].includes(theme)) updates.theme = theme;
  if (typeof avatarUrl === 'string') updates.avatarUrl = avatarUrl.slice(0, 2048);
  const updated = db.updateUser(userId, updates);
  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({ user: updated });
});
