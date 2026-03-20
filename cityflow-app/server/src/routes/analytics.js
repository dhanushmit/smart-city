const express = require('express');
const { getDb } = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard-stats', authMiddleware, async (req, res) => {
  const db = getDb();
  const total = await db.get('SELECT COUNT(*) as count FROM issues');
  const high = await db.get("SELECT COUNT(*) as count FROM issues WHERE priority = 'High' AND status != 'Resolved'");
  const bins = await db.get('SELECT COUNT(*) as count FROM garbage_bins WHERE fill_level >= 90');
  const workers = await db.get("SELECT COUNT(*) as count FROM users WHERE role = 'worker'");
  
  return res.json({
    total_issues: total.count || 0,
    high_priority: high.count || 0,
    overflow_bins: bins.count || 0,
    active_workers: workers.count || 0,
    avg_resolution_hours: 42,
  });
});

router.get('/wards', authMiddleware, async (req, res) => {
  const db = getDb();
  const wards = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6', 'Ward 7', 'Ward 8'];
  const result = await Promise.all(wards.map(async (w) => {
    const resolved = await db.get("SELECT COUNT(*) as count FROM issues WHERE ward = ? AND status = 'Resolved'", [w]);
    const pending = await db.get("SELECT COUNT(*) as count FROM issues WHERE ward = ? AND status != 'Resolved'", [w]);
    return { id: w, name: w, resolved: resolved.count || 0, pending: pending.count || 0 };
  }));
  return res.json(result);
});

router.get('/category-trend', authMiddleware, async (req, res) => {
  const db = getDb();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const categories = ['Road', 'Water', 'Electricity', 'Garbage', 'Traffic'];
  
  const result = months.map(m => {
    const row = { month: m };
    categories.forEach(c => row[c] = Math.floor(Math.random() * 20));
    return row;
  });
  return res.json(result);
});

router.get('/resolution-trend', authMiddleware, async (req, res) => {
  const result = [
    { month: 'Jan', avgHours: 58 },
    { month: 'Feb', avgHours: 52 },
    { month: 'Mar', avgHours: 48 },
    { month: 'Apr', avgHours: 42 },
  ];
  return res.json(result);
});

router.get('/activity-log', authMiddleware, async (req, res) => {
  const db = getDb();
  const logs = await db.all('SELECT t.*, i.display_id, i.title FROM timelines t JOIN issues i ON t.issue_id = i.id ORDER BY t.changed_at DESC LIMIT 20');
  return res.json(logs);
});

module.exports = router;
