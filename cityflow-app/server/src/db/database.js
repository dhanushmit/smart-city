const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

let _pool = null;

// PostgreSQL pool wrapper that mimics the SQLite API (get, all, run)
function createDbWrapper(pool) {
  return {
    get: async (query, params = []) => {
      const q = convertQuery(query);
      const res = await pool.query(q, params);
      return res.rows[0] || null;
    },
    all: async (query, params = []) => {
      const q = convertQuery(query);
      const res = await pool.query(q, params);
      return res.rows;
    },
    run: async (query, params = []) => {
      const q = convertQuery(query);
      const res = await pool.query(q, params);
      return { lastID: res.rows[0]?.id || null, changes: res.rowCount };
    },
    exec: async (query) => {
      await pool.query(query);
    },
  };
}

// Convert SQLite ? placeholders to PostgreSQL $1, $2...
function convertQuery(query) {
  let i = 0;
  return query.replace(/\?/g, () => `$${++i}`);
}

async function initDb() {
  if (_pool) return createDbWrapper(_pool);

  _pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const db = createDbWrapper(_pool);

  // Create all tables
  await _pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      display_id TEXT UNIQUE,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT DEFAULT '',
      last_name TEXT DEFAULT '',
      role TEXT CHECK(role IN ('admin', 'worker', 'citizen')) NOT NULL DEFAULT 'citizen',
      ward TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      category TEXT DEFAULT '',
      gender TEXT DEFAULT '',
      dob TEXT DEFAULT '',
      street TEXT DEFAULT '',
      landmark TEXT DEFAULT '',
      profile_photo TEXT,
      joined_date TIMESTAMPTZ DEFAULT NOW(),
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS issues (
      id SERIAL PRIMARY KEY,
      display_id TEXT UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'Road',
      status TEXT CHECK(status IN ('Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed')) DEFAULT 'Submitted',
      priority TEXT CHECK(priority IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
      location_lat REAL,
      location_lng REAL,
      location_text TEXT DEFAULT '',
      ward TEXT DEFAULT '',
      image_url TEXT,
      completion_photo TEXT,
      ai_completion_score INTEGER,
      ai_completion_verdict TEXT,
      reported_by INTEGER NOT NULL REFERENCES users(id),
      assigned_to INTEGER REFERENCES users(id),
      is_public INTEGER DEFAULT 1,
      upvotes INTEGER DEFAULT 0,
      reported_at TIMESTAMPTZ DEFAULT NOW(),
      resolved_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      issue_id INTEGER NOT NULL REFERENCES issues(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS timelines (
      id SERIAL PRIMARY KEY,
      issue_id INTEGER NOT NULL REFERENCES issues(id),
      status TEXT NOT NULL,
      note TEXT,
      changed_at TIMESTAMPTZ DEFAULT NOW(),
      changed_by INTEGER REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS upvotes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      issue_id INTEGER NOT NULL REFERENCES issues(id),
      UNIQUE(user_id, issue_id)
    );

    CREATE TABLE IF NOT EXISTS garbage_bins (
      id SERIAL PRIMARY KEY,
      bin_id TEXT UNIQUE,
      ward TEXT DEFAULT '',
      location_lat REAL,
      location_lng REAL,
      location_text TEXT DEFAULT '',
      fill_level INTEGER DEFAULT 0,
      last_collected TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Auto-seed default accounts
  const adminCheck = await db.get('SELECT id FROM users WHERE email = ?', ['admin@cityflow.gov.in']);
  if (!adminCheck) {
    console.log('🌱 Seeding admin account...');
    const hp = await bcrypt.hash('admin123', 10);
    await _pool.query(
      `INSERT INTO users (display_id, username, email, password_hash, first_name, last_name, role) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
      ['ADM-1', 'admin_1', 'admin@cityflow.gov.in', hp, 'System', 'Admin', 'admin']
    );
  }

  const citizenCheck = await db.get('SELECT id FROM users WHERE email = ?', ['citizen1@example.com']);
  if (!citizenCheck) {
    const cp = await bcrypt.hash('citizen123', 10);
    await _pool.query(
      `INSERT INTO users (display_id, username, email, password_hash, first_name, last_name, role, ward) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING`,
      ['CIT-1', 'citizen_1', 'citizen1@example.com', cp, 'John', 'Citizen', 'citizen', 'Ward 1']
    );
  }

  const workerCheck = await db.get('SELECT id FROM users WHERE email = ?', ['worker1@smartcity.com']);
  if (!workerCheck) {
    const wp = await bcrypt.hash('worker123', 10);
    await _pool.query(
      `INSERT INTO users (display_id, username, email, password_hash, first_name, last_name, role, ward) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING`,
      ['WRK-1', 'worker_1', 'worker1@smartcity.com', wp, 'Bob', 'Worker', 'worker', 'Ward 1']
    );
  }

  console.log('✅ PostgreSQL connected & tables ready');
  return db;
}

function getDb() {
  if (!_pool) throw new Error('Database not initialized. Call initDb() first.');
  return createDbWrapper(_pool);
}

module.exports = { initDb, getDb };
