const bcrypt = require('bcryptjs');
const { initDb } = require('./database');

async function seed() {
  const db = await initDb();
  console.log('🌱 Starting seed...');

  try {
    // Clear existing data
    await db.exec('DELETE FROM users');
    await db.exec('DELETE FROM issues');
    await db.exec('DELETE FROM comments');
    await db.exec('DELETE FROM timelines');
    await db.exec('DELETE FROM upvotes');
    await db.exec('DELETE FROM garbage_bins');

    const hash = await bcrypt.hash('admin123', 10);
    const workerHash = await bcrypt.hash('worker123', 10);
    const citizenHash = await bcrypt.hash('citizen123', 10);

    // Seed Admin
    await db.run(`INSERT INTO users (username, email, password_hash, first_name, last_name, role, display_id) 
                  VALUES ('admin', 'admin@smartcity.com', ?, 'System', 'Admin', 'admin', 'A-001')`, [hash]);

    // Seed Workers
    const workers = [
      ['worker1', 'worker1@smartcity.com', 'Rajesh', 'Kumar', 'Ward 1', 'Infrastructure'],
      ['worker2', 'worker2@smartcity.com', 'Suresh', 'Patil', 'Ward 2', 'Sanitation'],
      ['worker3', 'worker3@smartcity.com', 'Anil', 'Desai', 'Ward 3', 'Water Supply'],
    ];
    for (const [u, e, f, l, w, c] of workers) {
      await db.run(`INSERT INTO users (username, email, password_hash, first_name, last_name, role, ward, category) 
                    VALUES (?, ?, ?, ?, ?, 'worker', ?, ?)`, [u, e, workerHash, f, l, w, c]);
    }

    // Seed Citizens
    const citizens = [
      ['citizen1', 'citizen1@example.com', 'Rahul', 'Sharma', 'Ward 1'],
      ['citizen2', 'citizen2@example.com', 'Priya', 'Verma', 'Ward 2'],
    ];
    for (const [u, e, f, l, w] of citizens) {
      await db.run(`INSERT INTO users (username, email, password_hash, first_name, last_name, role, ward) 
                    VALUES (?, ?, ?, ?, ?, 'citizen', ?)`, [u, e, citizenHash, f, l, w]);
    }

    // Seed Garbage Bins
    const bins = [
      ['BIN-101', 'Ward 1', 16.7049, 74.4674, 'Main Market'],
      ['BIN-102', 'Ward 2', 16.7100, 74.4700, 'Station Road'],
      ['BIN-103', 'Ward 1', 16.7080, 74.4650, 'Gadhi Complex'],
    ];
    for (const [id, w, lat, lng, txt] of bins) {
      await db.run(`INSERT INTO garbage_bins (bin_id, ward, location_lat, location_lng, location_text, fill_level) 
                    VALUES (?, ?, ?, ?, ?, ?)`, [id, w, lat, lng, txt, Math.floor(Math.random() * 100)]);
    }

    console.log('✅ Seed complete!');
  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    process.exit(0);
  }
}

seed();
