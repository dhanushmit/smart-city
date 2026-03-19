const express = require('express');
const { getDb } = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/bins/
router.get('/', authMiddleware, async (req, res) => {
  const { ward } = req.query;
  const db = getDb();
  let query = 'SELECT * FROM garbage_bins WHERE 1=1';
  const params = [];

  if (ward) { query += ' AND ward = ?'; params.push(ward); }

  const bins = await db.all(query + ' ORDER BY bin_id ASC', params);
  return res.json(bins);
});

// GET /api/bins/:id/
router.get('/:id/', authMiddleware, async (req, res) => {
  const db = getDb();
  const bin = await db.get('SELECT * FROM garbage_bins WHERE id = ?', [req.params.id]);
  if (!bin) return res.status(404).json({ detail: 'Bin not found' });
  return res.json(bin);
});

// PATCH /api/bins/:id/ (update fill level)
router.patch('/:id/', authMiddleware, async (req, res) => {
  const { fill_level } = req.body;
  const db = getDb();
  if (fill_level < 0 || fill_level > 100) return res.status(400).json({ detail: 'Invalid fill level' });

  await db.run('UPDATE garbage_bins SET fill_level = ?, last_collected = ? WHERE id = ?', [fill_level, fill_level < 10 ? new Date().toISOString() : undefined, req.params.id]);
  const bin = await db.get('SELECT * FROM garbage_bins WHERE id = ?', [req.params.id]);
  return res.json(bin);
});

module.exports = router;
