import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import type { Request, RequestHandler } from 'express';
import { db } from './db.ts';

const SESSION_LIFETIME_MS = 24 * 60 * 60 * 1000;

interface UserSession {
  userId: string;
  expiresAt: number;
}

const sessions = new Map<string, UserSession>();

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [algorithm, salt, expectedHex] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !salt || typeof expectedHex !== 'string' || !/^[a-f0-9]{128}$/i.test(expectedHex)) {
    return false;
  }

  const expected = Buffer.from(expectedHex, 'hex');
  const actual = scryptSync(password, salt, expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createUserSession(userId: string): string {
  const now = Date.now();
  for (const [existingToken, session] of sessions) {
    if (session.expiresAt <= now) sessions.delete(existingToken);
  }
  const token = randomBytes(32).toString('base64url');
  sessions.set(token, { userId, expiresAt: now + SESSION_LIFETIME_MS });
  return token;
}

function getUserSession(req: Request): UserSession | undefined {
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

export function revokeUserSession(req: Request): void {
  const authorization = req.header('authorization');
  const match = authorization?.match(/^Bearer ([A-Za-z0-9_-]+)$/);
  if (match) sessions.delete(match[1]);
}

export const requireUser: RequestHandler = (req, res, next) => {
  const session = getUserSession(req);
  if (!session) {
    res.status(401).json({ error: 'Sign in is required' });
    return;
  }

  const user = db.getUserById(session.userId);
  if (!user || !user.isActive) {
    res.status(401).json({ error: 'This account is unavailable' });
    return;
  }

  req.headers['x-user-id'] = session.userId;
  next();
};
