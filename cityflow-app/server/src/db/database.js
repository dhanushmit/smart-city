const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

let _db = null;

async function initDb() {
  if (_db) return _db;
  const dbPath = path.join(__dirname, '../../cityflow.db');
  
  _db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await _db.exec('PRAGMA foreign_keys = ON;');

  // Create tables if they don't exist
  await _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      joined_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      reported_by INTEGER NOT NULL,
      assigned_to INTEGER,
      is_public INTEGER DEFAULT 1,
      upvotes INTEGER DEFAULT 0,
      reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME,
      FOREIGN KEY (reported_by) REFERENCES users(id),
      FOREIGN KEY (assigned_to) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      issue_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (issue_id) REFERENCES issues(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS timelines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      issue_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      note TEXT,
      changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      changed_by INTEGER,
      FOREIGN KEY (issue_id) REFERENCES issues(id),
      FOREIGN KEY (changed_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS upvotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      issue_id INTEGER NOT NULL,
      UNIQUE(user_id, issue_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (issue_id) REFERENCES issues(id)
    );

    CREATE TABLE IF NOT EXISTS garbage_bins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bin_id TEXT UNIQUE,
      ward TEXT DEFAULT '',
      location_lat REAL,
      location_lng REAL,
      location_text TEXT DEFAULT '',
      fill_level INTEGER DEFAULT 0,
      last_collected DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try { await _db.exec("ALTER TABLE issues ADD COLUMN ai_completion_score INTEGER;"); } catch (e) {}
  try { await _db.exec("ALTER TABLE issues ADD COLUMN ai_completion_verdict TEXT;"); } catch (e) {}

  // Auto-seed required login accounts if they don't exist individually
  const adminCheck = await _db.get('SELECT id FROM users WHERE email = ?', ['admin@cityflow.gov.in']);
  if (!adminCheck) {
    console.log('🌱 Admin account missing. Auto-seeding...');
    const hp = await bcrypt.hash('admin123', 10);
    await _db.run(`INSERT INTO users (display_id, username, email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?, ?)`, ['ADM-1', 'admin_1', 'admin@cityflow.gov.in', hp, 'System', 'Admin', 'admin']);
  }

  const citizenCheck = await _db.get('SELECT id FROM users WHERE email = ?', ['citizen1@example.com']);
  if (!citizenCheck) {
    const cp = await bcrypt.hash('citizen123', 10);
    await _db.run(`INSERT INTO users (display_id, username, email, password_hash, first_name, last_name, role, ward) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, ['CIT-1', 'citizen_1', 'citizen1@example.com', cp, 'John', 'Citizen', 'citizen', 'Ward 1']);
  }

  const workerCheck = await _db.get('SELECT id FROM users WHERE email = ?', ['worker1@smartcity.com']);
  if (!workerCheck) {
    const wp = await bcrypt.hash('worker123', 10);
    await _db.run(`INSERT INTO users (display_id, username, email, password_hash, first_name, last_name, role, ward) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, ['WRK-1', 'worker_1', 'worker1@smartcity.com', wp, 'Bob', 'Worker', 'worker', 'Ward 1']);
  }

  return _db;
}

function getDb() {
  if (!_db) throw new Error('Database not initialized. Call initDb() first.');
  return _db;
}

module.exports = { initDb, getDb };
