import { Router } from 'express';
import { db } from '../db.ts';

export const analyticsRouter = Router();

function getUserId(req: any): string {
  return (req.headers['x-user-id'] as string) || 'user-siddharth';
}

// GET /api/analytics/summary
analyticsRouter.get('/summary', (req, res) => {
  const userId = getUserId(req);
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const summary = db.getDailySummary(userId, date);
  return res.json({ summary });
});

// GET /api/analytics/productivity
analyticsRouter.get('/productivity', (req, res) => {
  const userId = getUserId(req);
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const breakdown = db.getProductivityBreakdown(userId, date);
  return res.json({ breakdown });
});

// GET /api/analytics/reports
analyticsRouter.get('/reports', (req, res) => {
  const userId = getUserId(req);
  const days = Number(req.query.days) || 7;
  const reports = db.getReports(userId, days);
  return res.json({ reports });
});

// GET /api/categories
analyticsRouter.get('/categories', (req, res) => {
  const userId = getUserId(req);
  const categories = db.getCategories(userId);
  return res.json({ categories });
});

// POST /api/categories
analyticsRouter.post('/categories', (req, res) => {
  const userId = getUserId(req);
  const { name, color } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name required' });
  const cat = db.createCategory({
    name,
    color: color || '#0d9488',
    isSystem: false,
    userId,
  });
  return res.status(201).json({ category: cat });
});

// GET /api/goals
analyticsRouter.get('/goals', (req, res) => {
  const userId = getUserId(req);
  const goals = db.getGoals(userId);
  return res.json({ goals });
});
