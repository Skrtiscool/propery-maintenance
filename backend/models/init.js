require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function init() {
  try {
    await db.createDb();

    const isMemory = db.isMemoryMode();
    const sqlPath = path.join(__dirname, isMemory ? 'init.pgmem.sql' : 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await db.query(sql);
    console.log('Database schema initialized successfully');

    const seedPath = path.join(__dirname, isMemory ? 'seed.pgmem.sql' : 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await db.query(seedSql);
    console.log('Seed data inserted successfully');

    process.exit(0);
  } catch (err) {
    console.error('Database initialization failed:', err);
    process.exit(1);
  }
}

init();
