import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { authRouter } from './server/routes/auth.ts';
import { tasksRouter } from './server/routes/tasks.ts';
import { analyticsRouter } from './server/routes/analytics.ts';
import { notificationsRouter } from './server/routes/notifications.ts';
import { adminRouter } from './server/routes/admin.ts';
import { exportRouter } from './server/routes/export.ts';
import { requireUser } from './server/userAuth.ts';

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

async function startServer() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(express.json());

  // Request logger in dev
  if (!isProduction) {
    app.use((req, res, next) => {
      if (req.path.startsWith('/api')) {
        console.log(`[API] ${req.method} ${req.path}`);
      }
      next();
    });
  }

  // Mount API routes
  app.use('/api/auth', authRouter);
  app.use('/api/tasks', requireUser, tasksRouter);
  app.use('/api/analytics', requireUser, analyticsRouter);
  app.use('/api/notifications', requireUser, notificationsRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/export', requireUser, exportRouter);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Direct APK file downloads
  app.get(
    [
      '/daily-task-tracker.apk',
      '/api/download/daily-task-tracker.apk',
      '/api/download/android-apk-bundle',
    ],
    (req, res) => {
      const apkPath = path.resolve('public/daily-task-tracker.apk');
      if (fs.existsSync(apkPath)) {
        res.setHeader('Content-Type', 'application/vnd.android.package-archive');
        res.setHeader('Content-Disposition', 'attachment; filename="daily-task-tracker.apk"');
        return res.sendFile(apkPath);
      }
      return res.status(404).send('APK file not found');
    }
  );

  // Direct repository archive download
  app.get('/daily-task-tracker-repo.zip', (req, res) => {
    const zipPath = path.resolve('public/daily-task-tracker-repo.zip');
    if (fs.existsSync(zipPath)) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="daily-task-tracker-repo.zip"');
      return res.sendFile(zipPath);
    }
    return res.status(404).send('Repository archive not found');
  });

  if (!isProduction) {
    // Development: integrate Vite dev middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve built static files from dist
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Daily Task Tracker server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
