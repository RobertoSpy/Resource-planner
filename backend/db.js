const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'WEB',
  host: 'my-postgres',
  port: 5432,
  database: 'postgres',
});


async function testConnection(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT NOW()');
      console.log('Conexiune la baza de date reușită');
      return;
    } catch (err) {
      console.log(`⏳ Aștept PostgreSQL (${i + 1}/${retries})...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  console.error('Nu s-a putut realiza conexiunea la PostgreSQL.');
  process.exit(1);
}

module.exports = { pool, testConnection };