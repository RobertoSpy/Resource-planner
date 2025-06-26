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
      console.log(`Aștept PostgreSQL (${i + 1}/${retries})...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }

  console.error(' Nu s-a putut realiza conexiunea la PostgreSQL.');

  process.exit(1);
}

async function getUserById(id) {
  try {
    console.log('ID primit pentru interogare:', id); // Log pentru ID-ul primit
    const query = 'SELECT id, email, rol FROM utilizator WHERE id = $1';
    const result = await pool.query(query, [id]);
    console.log('Rezultatul interogării:', result.rows); // Log pentru rezultatul interogării

    if (result.rows.length === 0) {
      return null; // Utilizatorul nu a fost găsit
    }

    return result.rows[0]; // Returnează utilizatorul
  } catch (err) {
    console.error('Eroare la interogarea utilizatorului:', err.message);
    throw err;
  }
}

module.exports = { pool, testConnection, getUserById };
