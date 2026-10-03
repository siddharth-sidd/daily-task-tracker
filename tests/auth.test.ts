import express from 'express';
import { randomUUID } from 'crypto';
import { createServer } from 'http';
import { once } from 'events';
import { adminRouter } from '../server/routes/admin.ts';
import { authRouter } from '../server/routes/auth.ts';
import { tasksRouter } from '../server/routes/tasks.ts';
import { db } from '../server/db.ts';
import { requireUser, hashPassword, verifyPassword } from '../server/userAuth.ts';

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

async function runAuthTests() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword || adminPassword.length < 16) {
    throw new Error('Set test-only ADMIN_EMAIL and ADMIN_PASSWORD environment variables before running this test.');
  }

  const passwordHash = hashPassword('test-user-password-long');
  assert(verifyPassword('test-user-password-long', passwordHash), 'scrypt hash accepts the correct password');
  assert(!verifyPassword('incorrect-password-long', passwordHash), 'scrypt hash rejects an incorrect password');

  const testEmail = `auth-test-${randomUUID()}@example.com`;
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);
  app.use('/api/tasks', requireUser, tasksRouter);
  app.use('/api/admin', adminRouter);

  const server = createServer(app);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Test server did not bind to a TCP port');
  const origin = `http://127.0.0.1:${address.port}`;

  const request = (path: string, options: RequestInit = {}) =>
    fetch(`${origin}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers as Record<string, string>) },
    });

  try {
    const anonymousTasks = await request('/api/tasks');
    assert(anonymousTasks.status === 401, 'task API rejects requests without a user session');

    const anonymousAdmin = await request('/api/admin/dashboard');
    assert(anonymousAdmin.status === 401, 'admin API rejects requests without an admin session');

    const registerResponse = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        name: 'Auth Test',
        password: 'test-user-password-long',
        register: true,
      }),
    });
    assert(registerResponse.status === 200, 'new user can register');
    const registered = await registerResponse.json() as { token: string; user: { id: string; role: string } };
    assert(Boolean(registered.token), 'registration returns a session token');
    assert(registered.user.role === 'user', 'new account cannot register as an administrator');

    const duplicateResponse = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        name: 'Auth Test',
        password: 'test-user-password-long',
        register: true,
      }),
    });
    assert(duplicateResponse.status === 409, 'duplicate email cannot claim an existing account');

    const foreignUserId = 'auth-test-foreign-user';
    db.createUser({
      id: foreignUserId,
      name: 'Other User',
      email: 'other-auth-test@example.com',
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
    });
    const date = new Date().toISOString().slice(0, 10);
    db.createTask({
      userId: foreignUserId,
      title: 'Private task',
      description: '',
      categoryId: 'cat-1',
      categoryName: 'Work',
      categoryColor: '#0d9488',
      priority: 'medium',
      status: 'pending',
      date,
      startTime: '09:00',
      endTime: '10:00',
      estimatedDurationMinutes: 60,
      reminderType: 'none',
      isRecurring: false,
      dueDate: date,
      tags: [],
      subtasks: [],
    });

    const crossAccountResponse = await request('/api/tasks', {
      headers: {
        Authorization: `Bearer ${registered.token}`,
        'x-user-id': foreignUserId,
      },
    });
    assert(crossAccountResponse.status === 200, 'authenticated user can fetch own task list');
    const crossAccountData = await crossAccountResponse.json() as { tasks: Array<{ userId: string }> };
    assert(
      crossAccountData.tasks.every((task) => task.userId === registered.user.id),
      'forged user ID cannot access another account task data',
    );

    const wrongPassword = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, password: 'incorrect-password-long' }),
    });
    assert(wrongPassword.status === 401, 'sign-in rejects an incorrect password');

    const userToAdmin = await request('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${registered.token}` },
    });
    assert(userToAdmin.status === 401, 'user session cannot access the admin API');

    const invalidAdmin = await request('/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email: adminEmail, password: 'wrong-admin-password-long' }),
    });
    assert(invalidAdmin.status === 401, 'admin sign-in rejects an incorrect password');

    const adminLogin = await request('/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email: adminEmail, password: adminPassword }),
    });
    assert(adminLogin.status === 200, 'configured administrator can sign in');
    const adminSession = await adminLogin.json() as { token: string };
    const adminDashboard = await request('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminSession.token}` },
    });
    assert(adminDashboard.status === 200, 'admin session can access protected dashboard APIs');

    const adminOnUserApi = await request('/api/tasks', {
      headers: { Authorization: `Bearer ${adminSession.token}` },
    });
    assert(adminOnUserApi.status === 401, 'admin session is not accepted as a user session');

    await request('/api/auth/admin-logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminSession.token}` },
    });
    const revokedAdmin = await request('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminSession.token}` },
    });
    assert(revokedAdmin.status === 401, 'admin logout revokes its session');

    await request('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${registered.token}` },
    });
    const revokedUser = await request('/api/tasks', {
      headers: { Authorization: `Bearer ${registered.token}` },
    });
    assert(revokedUser.status === 401, 'user logout revokes its session');
  } finally {
    server.close();
    await once(server, 'close');
  }

  console.log('Authentication integration tests passed.');
}

runAuthTests().catch((error) => {
  console.error(error);
  process.exit(1);
});
