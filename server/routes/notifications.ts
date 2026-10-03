import { Router } from 'express';
import { db } from '../db.ts';

export const notificationsRouter = Router();

function getUserId(req: any): string {
  return (req.headers['x-user-id'] as string) || 'user-siddharth';
}

// GET /api/notifications
notificationsRouter.get('/', (req, res) => {
  const userId = getUserId(req);
  const notifications = db.getNotifications(userId);
  return res.json({ notifications });
});

// PUT /api/notifications/:id/read
notificationsRouter.put('/:id/read', (req, res) => {
  const success = db.markNotificationRead(req.params.id);
  return res.json({ success });
});

// POST /api/notifications/read-all
notificationsRouter.post('/read-all', (req, res) => {
  const userId = getUserId(req);
  const success = db.markAllNotificationsRead(userId);
  return res.json({ success });
});

// DELETE /api/notifications/:id
notificationsRouter.delete('/:id', (req, res) => {
  const success = db.deleteNotification(req.params.id);
  return res.json({ success });
});
