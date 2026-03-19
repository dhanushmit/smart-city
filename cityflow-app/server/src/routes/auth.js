const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../db/database');
const { generateToken, authMiddleware } = require('../middleware/auth');

const router = express.Router();

async function getUserById(db, id) {
  return await db.get('SELECT * FROM users WHERE id = ?', [id]);
}

function userResponse(u) {
  if (!u) return null;
  return {
    id: u.id,
    display_id: u.display_id,
    username: u.username,
    email: u.email,
    first_name: u.first_name,
    last_name: u.last_name,
    full_name: `${u.first_name} ${u.last_name}`.trim() || u.username,
    role: u.role,
    ward: u.ward,
    phone: u.phone,
    category: u.category,
    gender: u.gender,
    dob: u.dob,
    street: u.street,
    landmark: u.landmark,
    profile_photo: u.profile_photo ? `/uploads/${u.profile_photo}` : null,
    joined_date: u.joined_date,
  };
}

// POST /api/auth/login/
router.post('/login/', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ detail: 'Email and password are required.' });
  const db = getDb();
  const user = await db.get('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
  if (!user) return res.status(400).json({ detail: 'Invalid credentials.' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(400).json({ detail: 'Invalid credentials.' });

  const token = generateToken(user.id, user.role);
  return res.json({ access: token, refresh: token, user: userResponse(user) });
});

// POST /api/auth/register/
router.post('/register/', async (req, res) => {
  const { email, username, password, first_name, last_name, role, ward, phone, category } = req.body;
  if (!email || !password || !username) return res.status(400).json({ detail: 'email, username, password are required.' });
  const db = getDb();

  const existing = await db.get('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
  if (existing) return res.status(400).json({ detail: 'User with this email or username already exists.' });

  const hash = await bcrypt.hash(password, 10);
  const result = await db.run(`
    INSERT INTO users (username, email, password_hash, first_name, last_name, role, ward, phone, category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [username, email, hash, first_name || '', last_name || '', role || 'citizen', ward || '', phone || '', category || '']);

  const userId = result.lastID;
  const prefix = { citizen: 'C', worker: 'W', admin: 'A' }[role] || 'U';
  const displayId = `${prefix}-${String(userId).padStart(3, '0')}`;
  await db.run('UPDATE users SET display_id = ? WHERE id = ?', [displayId, userId]);

  const user = await getUserById(db, userId);
  const token = generateToken(user.id, user.role);
  return res.status(201).json({ access: token, refresh: token, user: userResponse(user) });
});

// GET /api/auth/me/
router.get('/me/', authMiddleware, async (req, res) => {
  const db = getDb();
  const user = await getUserById(db, req.userId);
  if (!user) return res.status(404).json({ detail: 'User not found.' });
  return res.json(userResponse(user));
});

// GET /api/auth/workers/
router.get('/workers/', authMiddleware, async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ detail: 'Forbidden' });
  const db = getDb();
  const workers = await db.all('SELECT * FROM users WHERE role = ?', ['worker']);

  const result = await Promise.all(workers.map(async (w) => {
    const stats = await db.get(`
      SELECT
        COUNT(CASE WHEN status IN ('Submitted','Assigned','In Progress') THEN 1 END) as open_tasks,
        COUNT(CASE WHEN status IN ('Resolved','Closed') THEN 1 END) as completed_tasks
      FROM issues WHERE assigned_to = ?
    `, [w.id]);
    return {
      ...userResponse(w),
      open_tasks: stats.open_tasks || 0,
      completed_tasks: stats.completed_tasks || 0,
      status: 'Active',
    };
  }));
  return res.json(result);
});

// GET /api/auth/workers/:id/
router.get('/workers/:id/', authMiddleware, async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ detail: 'Forbidden' });
  const db = getDb();
  const w = await db.get('SELECT * FROM users WHERE id = ? AND role = ?', [req.params.id, 'worker']);
  if (!w) return res.status(404).json({ detail: 'Not found' });

  const stats = await db.get(`
    SELECT
      COUNT(CASE WHEN status IN ('Submitted','Assigned','In Progress') THEN 1 END) as open_tasks,
      COUNT(CASE WHEN status IN ('Resolved','Closed') THEN 1 END) as completed_tasks
    FROM issues WHERE assigned_to = ?
  `, [w.id]);
  return res.json({ ...userResponse(w), ...stats, status: 'Active' });
});

// POST /api/auth/change-password/
router.post('/change-password/', authMiddleware, async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) return res.status(400).json({ detail: 'current_password and new_password are required.' });
  const db = getDb();
  const user = await getUserById(db, req.userId);
  const valid = await bcrypt.compare(current_password, user.password_hash);
  if (!valid) return res.status(400).json({ detail: 'Current password is incorrect.' });
  if (new_password.length < 4) return res.status(400).json({ detail: 'New password must be at least 4 characters.' });

  const hash = await bcrypt.hash(new_password, 10);
  await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.userId]);
  return res.json({ detail: 'Password changed successfully.' });
});

// PATCH /api/auth/profile/
router.patch('/profile/', authMiddleware, async (req, res) => {
  const { first_name, last_name, ward, gender, dob, street, landmark } = req.body;
  const db = getDb();
  await db.run(`
    UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name),
    ward = COALESCE(?, ward), gender = COALESCE(?, gender), dob = COALESCE(?, dob),
    street = COALESCE(?, street), landmark = COALESCE(?, landmark) WHERE id = ?
  `, [first_name, last_name, ward, gender, dob, street, landmark, req.userId]);
  const user = await getUserById(db, req.userId);
  return res.json(userResponse(user));
});

// POST /api/auth/token/refresh/
router.post('/token/refresh/', (req, res) => {
  const { refresh } = req.body;
  if (!refresh) return res.status(400).json({ detail: 'Refresh token required.' });
  try {
    const { generateToken, verifyToken } = require('../middleware/auth');
    const decoded = verifyToken(refresh);
    const newToken = generateToken(decoded.userId, decoded.role);
    return res.json({ access: newToken });
  } catch {
    return res.status(401).json({ detail: 'Invalid refresh token.' });
  }
});

// GET /api/auth/users/ (Fetch all Citizens & Workers)
router.get('/users/', authMiddleware, async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ detail: 'Forbidden' });
  const db = getDb();
  const usersList = await db.all('SELECT * FROM users WHERE role IN ("worker", "citizen")');
  return res.json(usersList.map(userResponse));
});

// PATCH /api/auth/users/:id/ (Admin Edit User/Worker)
router.patch('/users/:id/', authMiddleware, async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ detail: 'Forbidden' });
  const { first_name, last_name, email, password, phone, ward, category } = req.body;
  const db = getDb();
  const target = await getUserById(db, req.params.id);
  if (!target) return res.status(404).json({ detail: 'User not found' });

  let newHash = target.password_hash;
  if (password) {
    if (password.length < 4) return res.status(400).json({ detail: 'Password must be at least 4 characters.' });
    newHash = await bcrypt.hash(password, 10);
  }

  await db.run(`
    UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name),
    email = COALESCE(?, email), password_hash = ?, phone = COALESCE(?, phone), 
    ward = COALESCE(?, ward), category = COALESCE(?, category) WHERE id = ?
  `, [first_name, last_name, email, newHash, phone, ward, category, req.params.id]);
  
  const updatedUser = await getUserById(db, req.params.id);
  return res.json(userResponse(updatedUser));
});

// DELETE /api/auth/users/:id/
router.delete('/users/:id/', authMiddleware, async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ detail: 'Forbidden' });
  const db = getDb();
  const target = await getUserById(db, req.params.id);
  if (!target) return res.status(404).json({ detail: 'User not found' });
  
  // Automatically re-assign any open issues assigned to this worker (if applicable) back to unassigned
  if (target.role === 'worker') {
    await db.run("UPDATE issues SET assigned_to = NULL, status = 'Submitted' WHERE assigned_to = ? AND status != 'Resolved' AND status != 'Closed'", [target.id]);
  }
  
  await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
  return res.json({ detail: 'User deleted successfully' });
});

module.exports = router;
