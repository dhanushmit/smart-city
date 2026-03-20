const express = require('express');
const { getDb } = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', '..', '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `issue_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

// Helpers
const PRIORITY_MAP = { Road: 30, Water: 40, Electricity: 50, Garbage: 20, Traffic: 30, 'Public Facilities': 10 };
function calculatePriority(cat, hoursSince) {
  const base = PRIORITY_MAP[cat] || 20;
  const score = base + Math.min(hoursSince * 0.5, 50);
  return score > 70 ? 'High' : score > 40 ? 'Medium' : 'Low';
}

async function getIssueAnalytics(db, issueId) {
  const comments = await db.all('SELECT c.*, u.first_name || " " || u.last_name as user_name FROM comments c JOIN users u ON c.user_id = u.id WHERE c.issue_id = ? ORDER BY c.created_at DESC', [issueId]);
  const timeline = await db.all('SELECT * FROM timelines WHERE issue_id = ? ORDER BY changed_at DESC', [issueId]);
  return { comments, timeline };
}

// Routes
router.get('/', authMiddleware, async (req, res) => {
  const { status, priority, ward, category, search, assigned_to } = req.query;
  const db = getDb();
  let query = 'SELECT i.*, u.first_name || " " || u.last_name as reported_by_name FROM issues i JOIN users u ON i.reported_by = u.id WHERE 1=1';
  const params = [];

  if (status) { query += ' AND i.status = ?'; params.push(status); }
  if (priority) { query += ' AND i.priority = ?'; params.push(priority); }
  if (ward) { query += ' AND i.ward = ?'; params.push(ward); }
  if (category) { query += ' AND i.category = ?'; params.push(category); }
  if (assigned_to) { query += ' AND i.assigned_to = ?'; params.push(assigned_to); }
  if (search) { query += ' AND (i.title LIKE ? OR i.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  const issues = await db.all(query + ' ORDER BY i.reported_at DESC', params);
  
  // Attach stats for upvotes/comments count
  const results = await Promise.all(issues.map(async (i) => {
    const upvoted = await db.get('SELECT id FROM upvotes WHERE user_id = ? AND issue_id = ?', [req.userId, i.id]);
    const { comments } = await getIssueAnalytics(db, i.id);
    return { ...i, upvoted_by_user: !!upvoted, comments_count: comments.length };
  }));
  
  return res.json(results);
});

router.get('/my/issues/', authMiddleware, async (req, res) => {
  const db = getDb();
  const issues = await db.all('SELECT * FROM issues WHERE reported_by = ? ORDER BY reported_at DESC', [req.userId]);
  const results = await Promise.all(issues.map(async i => {
    const extras = await getIssueAnalytics(db, i.id);
    return { ...i, ...extras };
  }));
  return res.json(results);
});

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  const { title, description, category, ward, location_text, location_lat, location_lng, is_public } = req.body;
  const db = getDb();
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const result = await db.run(`
    INSERT INTO issues (title, description, category, ward, location_text, location_lat, location_lng, image_url, reported_by, is_public)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [title, description, category || 'Road', ward || '', location_text || '', location_lat || 0, location_lng || 0, imageUrl, req.userId, is_public === 'false' ? 0 : 1]);

  const issueId = result.lastID;
  const displayId = `CP-${2000 + issueId}`;
  await db.run('UPDATE issues SET display_id = ?, priority = ? WHERE id = ?', [displayId, calculatePriority(category, 0), issueId]);
  await db.run('INSERT INTO timelines (issue_id, status, note, changed_by) VALUES (?, ?, ?, ?)', [issueId, 'Submitted', 'Issue reported and recorded.', req.userId]);

  // Auto-assign worker
  const worker = await db.get('SELECT id FROM users WHERE role = "worker" AND ward = ? LIMIT 1', [ward]);
  if (worker) {
    await db.run('UPDATE issues SET assigned_to = ?, status = "Assigned" WHERE id = ?', [worker.id, issueId]);
    await db.run('INSERT INTO timelines (issue_id, status, note, changed_by) VALUES (?, ?, ?, ?)', [issueId, 'Assigned', 'Automatically assigned to ward worker.', null]);
  }

  const issue = await db.get('SELECT * FROM issues WHERE id = ?', [issueId]);
  return res.status(201).json(issue);
});

// GET single issue by ID
router.get('/:id/', authMiddleware, async (req, res) => {
  const db = getDb();
  const issue = await db.get(
    `SELECT i.*, 
      u.first_name || ' ' || u.last_name as reported_by_name,
      w.first_name || ' ' || w.last_name as assigned_to_name
     FROM issues i 
     LEFT JOIN users u ON i.reported_by = u.id
     LEFT JOIN users w ON i.assigned_to = w.id
     WHERE i.id = ?`,
    [req.params.id]
  );
  if (!issue) return res.status(404).json({ detail: 'Issue not found' });
  const { comments, timeline } = await getIssueAnalytics(db, issue.id);
  return res.json({ ...issue, comments, timeline });
});

router.patch('/:id/status/', authMiddleware, async (req, res) => {
  const { status, note } = req.body;
  const db = getDb();
  const issue = await db.get('SELECT * FROM issues WHERE id = ?', [req.params.id]);
  if (!issue) return res.status(404).json({ detail: 'Not found' });

  await db.run('UPDATE issues SET status = ?, resolved_at = ? WHERE id = ?', [status, status === 'Resolved' ? new Date().toISOString() : issue.resolved_at, req.params.id]);
  await db.run('INSERT INTO timelines (issue_id, status, note, changed_by) VALUES (?, ?, ?, ?)', [req.params.id, status, note || `Status changed to ${status}`, req.userId]);

  return res.json({ status: 'success' });
});

router.post('/:id/upvote/', authMiddleware, async (req, res) => {
  const db = getDb();
  const existing = await db.get('SELECT id FROM upvotes WHERE user_id = ? AND issue_id = ?', [req.userId, req.params.id]);
  if (existing) {
    await db.run('DELETE FROM upvotes WHERE id = ?', [existing.id]);
    await db.run('UPDATE issues SET upvotes = upvotes - 1 WHERE id = ?', [req.params.id]);
    return res.json({ upvoted: false, upvotes: (await db.get('SELECT upvotes FROM issues WHERE id = ?', [req.params.id])).upvotes });
  } else {
    await db.run('INSERT INTO upvotes (user_id, issue_id) VALUES (?, ?)', [req.userId, req.params.id]);
    await db.run('UPDATE issues SET upvotes = upvotes + 1 WHERE id = ?', [req.params.id]);
    return res.json({ upvoted: true, upvotes: (await db.get('SELECT upvotes FROM issues WHERE id = ?', [req.params.id])).upvotes });
  }
});

router.post('/:id/comment/', authMiddleware, async (req, res) => {
  const { text } = req.body;
  const db = getDb();
  const result = await db.run('INSERT INTO comments (issue_id, user_id, text) VALUES (?, ?, ?)', [req.params.id, req.userId, text]);
  const comment = await db.get('SELECT c.*, u.first_name || " " || u.last_name as user_name FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?', [result.lastID]);
  return res.json(comment);
});

module.exports = router;
