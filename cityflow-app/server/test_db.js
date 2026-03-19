const { initDb, getDb } = require('./src/db/database');
async function test() {
  try {
    await initDb();
    const db = getDb();
    const user = await db.get('SELECT * FROM users LIMIT 1');
    console.log('SUCCESS:', user ? user.email : 'No user');
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    process.exit(0);
  }
}
test();
