import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { db } from '../db.ts';

export const exportRouter = Router();

function getUserId(req: any): string {
  return (req.headers['x-user-id'] as string) || 'user-siddharth';
}

// GET /api/export/tasks.csv
exportRouter.get('/tasks.csv', (req, res) => {
  const userId = getUserId(req);
  const tasks = db.getTasks(userId);

  const headers = [
    'ID',
    'Title',
    'Category',
    'Priority',
    'Status',
    'Date',
    'StartTime',
    'EndTime',
    'EstimatedMinutes',
    'ActualMinutes',
    'CompletedAt',
  ];

  const rows = tasks.map((t) => [
    `"${t.id}"`,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    `"${t.categoryName}"`,
    `"${t.priority}"`,
    `"${t.status}"`,
    `"${t.date}"`,
    `"${t.startTime}"`,
    `"${t.endTime}"`,
    t.estimatedDurationMinutes,
    t.actualDurationMinutes,
    `"${t.completedAt || ''}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="daily-tasks-export.csv"');
  return res.send(csv);
});

// GET /api/export/data.json
exportRouter.get('/data.json', (req, res) => {
  const userId = getUserId(req);
  const user = db.getUserById(userId);
  const tasks = db.getTasks(userId);
  const notifications = db.getNotifications(userId);
  const goals = db.getGoals(userId);

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    user,
    tasks,
    notifications,
    goals,
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="daily-task-tracker-backup.json"');
  return res.send(JSON.stringify(exportPayload, null, 2));
});

// GET /api/download/android-apk-bundle and /api/download/daily-task-tracker.apk
exportRouter.get(['/android-apk-bundle', '/daily-task-tracker.apk'], (req, res) => {
  const apkPath = path.resolve('public/daily-task-tracker.apk');

  if (fs.existsSync(apkPath)) {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="daily-task-tracker.apk"');
    return res.sendFile(apkPath);
  }

  return res.status(404).send('APK file not found. Please try again.');
});
