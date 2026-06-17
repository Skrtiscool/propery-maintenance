const { Pool } = require('pg');

let pool;
let isMemoryMode = false;

async function createDb() {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    await pool.query('SELECT 1');
    console.log('Connected to PostgreSQL');
  } catch (err) {
    console.log('PostgreSQL not available, falling back to in-memory (pg-mem)');
    isMemoryMode = true;
    const { newDb } = require('pg-mem');
    let uuidCounter = 0;
    const memDb = newDb();
    memDb.public.registerFunction({
      name: 'gen_random_uuid',
      args: [],
      returns: 'uuid',
      implementation: () => {
        uuidCounter++;
        return [
          '00000000',
          '0000',
          '4000',
          'a000',
          uuidCounter.toString(16).padStart(12, '0'),
        ].join('-');
      },
    });
    const pgAdapter = memDb.adapters.createPg();
    pool = new pgAdapter.Pool();
  }

  if (typeof pool.on === 'function') {
    pool.on('error', (err) => {
      if (!isMemoryMode) {
        console.error('Unexpected error on idle client', err);
      }
    });
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool: () => pool,
  isMemoryMode: () => isMemoryMode,
  createDb,
};
