const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,  // adică 'postgres'
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});


async function testConnection(){
  try{
    const res = await pool.query('SELECT NOW()');
    console.log('Conexiune Ok ', res.rows[0].now);
  } catch(err){
    console.error('Eroare ', err);
  }
}

module.exports = {
  pool, testConnection,
};