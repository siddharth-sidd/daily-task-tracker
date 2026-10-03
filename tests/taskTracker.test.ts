import { db } from '../server/db.ts';

async function runTests() {
  console.log('--- Starting Daily Task Tracker Automated Test Suite ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
      failed++;
    }
  }

  // Test 1: Create an isolated user for task operations
  const userId = 'user-test-runner';
  const existingUser = db.getUserById(userId);
  const user = existingUser || db.createUser({
    id: userId,
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
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
  assert(!!user, 'Test user created or loaded');

  // Test 2: Task Creation
  const today = new Date().toISOString().split('T')[0];
  const testTask = db.createTask({
    userId,
    title: 'Automated Test Task',
    description: 'Verifying task engine integrity',
    categoryId: 'cat-3',
    categoryName: 'Coding',
    categoryColor: '#3b82f6',
    priority: 'high',
    status: 'pending',
    date: today,
    startTime: '14:00',
    endTime: '15:30',
    estimatedDurationMinutes: 90,
    reminderType: '15m_before',
    isRecurring: false,
    dueDate: `${today} 15:30`,
    tags: ['Test', 'Automation'],
    subtasks: [],
  });
  assert(!!testTask.id, 'Task successfully created with unique ID');
  assert(testTask.status === 'pending', 'Initial status is pending');

  // Test 3: Subtask addition and toggle
  const sub = db.addSubtask(testTask.id, 'Verify subtask checklist');
  assert(!!sub, 'Subtask added successfully');
  const toggled = db.toggleSubtask(testTask.id, sub!.id);
  assert(toggled?.isCompleted === true, 'Subtask toggled to completed');

  // Test 4: Timer start, pause, resume, complete (RULE 5 & 6)
  const started = db.startTaskTimer(testTask.id, userId);
  assert(started?.status === 'in_progress', 'Timer start sets status to in_progress');
  assert(!!started?.activeSessionStart, 'activeSessionStart timestamp recorded');

  const paused = db.pauseTaskTimer(testTask.id, userId, 20);
  assert(paused?.status === 'paused', 'Timer pause sets status to paused');
  assert(paused?.actualDurationMinutes === 20, 'Actual duration logged 20 minutes');

  const resumed = db.resumeTaskTimer(testTask.id, userId);
  assert(resumed?.status === 'in_progress', 'Timer resumed sets status to in_progress');

  const completed = db.completeTaskTimer(testTask.id, userId, 10);
  assert(completed?.status === 'completed', 'Timer complete sets status to completed');
  assert(completed?.actualDurationMinutes === 30, 'Total actual duration accumulated to 30 minutes');
  assert(!!completed?.completedAt, 'completedAt timestamp is recorded');

  // Test 5: Rule 1 - Completed task clears reminders
  const notifs = db.getNotifications(userId);
  const activeReminderForCompleted = notifs.find((n) => n.taskId === testTask.id && n.type === 'reminder' && !n.isRead);
  assert(!activeReminderForCompleted, 'RULE 1: Completed task cleared unread reminder notifications');

  // Test 6: Rule 10 - Productivity Score Calculation
  const breakdown = db.getProductivityBreakdown(userId, today);
  assert(typeof breakdown.score === 'number' && breakdown.score >= 0 && breakdown.score <= 100, 'Productivity score is between 0 and 100');
  assert(breakdown.taskCompletionRate >= 0 && breakdown.taskCompletionRate <= 100, 'Task completion rate is valid');
  assert(typeof breakdown.explanation === 'string', 'Transparent formula explanation exists');

  // Test 7: Carry over tasks to tomorrow
  const carried = db.carryOverToTomorrow(userId, [testTask.id]);
  assert(carried.length === 1, 'Task carried over to tomorrow');

  // Test 8: Admin Dashboard Statistics
  const adminStats = db.getAdminStats();
  assert(adminStats.totalUsers >= 1, 'Admin stats report registered users');
  assert(adminStats.totalTasks >= 1, 'Admin stats report created tasks');
  assert(adminStats.totalFocusHours > 0, 'Admin stats report accumulated focus hours');

  // Test 9: Admin Audit Log
  const log = db.createAuditLog({
    adminId: 'admin-1',
    adminName: 'Master Administrator',
    action: 'Unit Test Audit Verification',
    targetType: 'task',
    targetId: testTask.id,
    details: 'Automated verification test completed.',
  });
  assert(!!log.id, 'Audit log created with ID');
  const allLogs = db.getAuditLogs();
  assert(allLogs.some((l) => l.id === log.id), 'Audit log retrieved from immutable trail');

  // Test 10: Admin User Creation & Role Isolation
  const invitedEmail = `team-${Date.now()}@example.com`;
  const newCreatedUser = db.createUser({
    id: `user-test-${Date.now()}`,
    name: 'Invited Team Member',
    email: invitedEmail,
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
  assert(!!newCreatedUser.id, 'New user created successfully by admin');
  const foundUser = db.getUserByEmail(invitedEmail);
  assert(foundUser?.name === 'Invited Team Member', 'New user found by email for direct login');
  assert(foundUser?.role === 'user', 'Regular user has role "user"');

  assert(user.role === 'user', 'Regular user records do not grant admin access');

  const promoted = db.updateUser(newCreatedUser.id, { role: 'admin' });
  assert(promoted?.role === 'admin', 'Admin can promote user to admin role');

  console.log(`\n--- Test Results: ${passed} passed, ${failed} failed ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
