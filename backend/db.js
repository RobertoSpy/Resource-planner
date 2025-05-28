const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function testConnection(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT NOW()');
      console.log('✅ Conexiune la baza de date reușită');
      return;
    } catch (err) {
      console.log(`⏳ Aștept PostgreSQL (${i + 1}/${retries})...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  console.error('❌ Nu s-a putut realiza conexiunea la PostgreSQL.');
  process.exit(1);
}

module.exports = { pool, testConnection };