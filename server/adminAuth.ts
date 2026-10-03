import { randomBytes, timingSafeEqual } from 'crypto';
import type { Request, RequestHandler } from 'express';

const SESSION_LIFETIME_MS = 8 * 60 * 60 * 1000;

export interface AdminSession {
  id: string;
  name: string;
  email: string;
  role: 'super_admin';
  expiresAt: number;
  lastActive: string;
  createdAt: string;
}

const sessions = new Map<string, AdminSession>();

function constantTimeEqual(value: string, expected: string): boolean {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  return valueBuffer.length === expectedBuffer.length && timingSafeEqual(valueBuffer, expectedBuffer);
}

export function isAdminConfigured(): boolean {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  return Boolean(email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && password && password.length >= 16);
}

export function verifyAdminCredentials(email: unknown, password: unknown): boolean {
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredEmail || !configuredPassword || typeof email !== 'string' || typeof password !== 'string') {
    return false;
  }

  return (
    constantTimeEqual(email.trim().toLowerCase(), configuredEmail) &&
    constantTimeEqual(password, configuredPassword)
  );
}

export function createAdminSession(): { token: string; admin: AdminSession } {
  const now = Date.now();
  for (const [existingToken, session] of sessions) {
    if (session.expiresAt <= now) sessions.delete(existingToken);
  }
  const token = randomBytes(32).toString('base64url');
  const admin: AdminSession = {
    id: 'configured-admin',
    name: 'Administrator',
    email: process.env.ADMIN_EMAIL!.trim(),
    role: 'super_admin',
    expiresAt: now + SESSION_LIFETIME_MS,
    lastActive: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  sessions.set(token, admin);
  return { token, admin };
}

export function getAdminSession(req: Request): AdminSession | undefined {
  const authorization = req.header('authorization');
  const match = authorization?.match(/^Bearer ([A-Za-z0-9_-]+)$/);
  if (!match) return undefined;

  const session = sessions.get(match[1]);
  if (session && session.expiresAt <= Date.now()) {
    sessions.delete(match[1]);
    return undefined;
  }
  return session;
}

export function revokeAdminSession(req: Request): void {
  const authorization = req.header('authorization');
  const match = authorization?.match(/^Bearer ([A-Za-z0-9_-]+)$/);
  if (match) sessions.delete(match[1]);
}

export const requireAdmin: RequestHandler = (req, res, next) => {
  const admin = getAdminSession(req);
  if (!admin) {
    res.status(401).json({ error: 'Administrator authentication required' });
    return;
  }
  res.locals.admin = admin;
  next();
};
