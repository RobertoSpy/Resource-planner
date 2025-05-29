
const { pool } = require('../db');

async function getUtilizatori(req, res) {
  try {
    const result = await pool.query('SELECT * FROM utilizatori');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.rows));
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  }
}

async function addUtilizator(req, res, body) {
  const { nume, rol } = JSON.parse(body);
  try {
    const result = await pool.query(
      'INSERT INTO utilizatori (nume, rol) VALUES ($1, $2) RETURNING *',
      [nume, rol]
    );
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.rows[0]));
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  }
}

async function updateUtilizator(req, res, id, body) {
  const { nume, rol } = JSON.parse(body);
  try {
    const result = await pool.query(
      'UPDATE utilizatori SET nume = $1, rol = $2 WHERE id = $3 RETURNING *',
      [nume, rol, id]
    );
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.rows[0]));
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  }
}

async function deleteUtilizator(req, res, id) {
  try {
    await pool.query('DELETE FROM utilizatori WHERE id = $1', [id]);
    res.writeHead(204);
    res.end();
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  }
}

module.exports = {
  getUtilizatori,
  addUtilizator,
  updateUtilizator,
  deleteUtilizator
};
