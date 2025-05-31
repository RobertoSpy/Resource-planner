const { pool } = require('../db'); // Importă pool-ul din db.js
const bcrypt = require('bcrypt'); // Importă bcrypt pentru hash-ul parolei
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Încarcă variabilele de mediu din .env



function getUserIdFromToken(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (err) {
    console.error('Eroare la decodarea token-ului:', err.message);
    return null;
  }
}

async function getUtilizatori(req, res) {
  try {
    const result = await pool.query('SELECT * FROM utilizator'); // Modificat: utilizatori -> utilizator
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.rows));
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  }
} 

async function getUtilizatorAutentificat(req, res) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      if (!res.headersSent) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Token invalid sau lipsă' }));
      }
      return;
    }

    const result = await pool.query(
      'SELECT id, email, nume, rol FROM utilizator WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      if (!res.headersSent) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Utilizatorul nu a fost găsit' }));
      }
      return;
    }

    if (!res.headersSent) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows[0]));
    }
  } catch (err) {
    console.error('Eroare la obținerea utilizatorului autentificat:', err.message);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

async function addUtilizator(req, res, body) {
  try {
    const userId = getUserIdFromToken(req);
    console.log('userId extras din token:', userId);

    if (!userId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'ID-ul utilizatorului este necesar' }));
      return;
    }

    // Verificăm rolul utilizatorului care face cererea
    const userResult = await pool.query(
      'SELECT rol FROM utilizator WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Acces interzis: utilizatorul nu există' }));
      return;
    }

    const userRole = userResult.rows[0].rol;

    if (userRole !== 'ADMINISTRATOR') {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Acces interzis: doar utilizatorii ADMIN pot crea utilizatori noi' }));
      return;
    }

    // Continuăm cu crearea utilizatorului
    const { email, nume, parola, rol } = JSON.parse(body);
    console.log('Valori primite:', { email, nume, parola, rol });

    const hash = await bcrypt.hash(parola, 10); // Hash pentru parola
    const result = await pool.query(
      'INSERT INTO utilizator (email, nume, parola, rol) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, nume, hash, rol || 'VANZATOR'] // Rol implicit: VANZATOR
    );
    console.log('Utilizator creat cu succes:', result.rows[0]);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.rows[0]));
  } catch (err) {
    console.error('Eroare la crearea utilizatorului:', err.message);
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  }
}

async function updateUtilizator(req, res, id, body) {
  const { nume, rol } = JSON.parse(body);
  try {
    const result = await pool.query(
      'UPDATE utilizator SET nume = $1, rol = $2 WHERE id = $3 RETURNING *', // Modificat: utilizatori -> utilizator
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
    const userId = getUserIdFromToken(req); // Extrage userId din token
    console.log('userId extras din token:', userId);

    if (!userId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'ID-ul utilizatorului este necesar' }));
      return;
    }

    // Verificăm rolul utilizatorului care face cererea
    const userResult = await pool.query(
      'SELECT rol FROM utilizator WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Acces interzis: utilizatorul nu există' }));
      return;
    }

    const userRole = userResult.rows[0].rol;

    if (userRole !== 'ADMINISTRATOR') {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Acces interzis: doar utilizatorii ADMIN pot șterge utilizatori' }));
      return;
    }

    // Continuăm cu ștergerea utilizatorului
    console.log(`Ștergere utilizator cu ID: ${id}`); // Log pentru ID-ul primit
    await pool.query('DELETE FROM utilizator WHERE id = $1', [id]); // Interogare SQL pentru ștergere
    res.writeHead(204); // Răspuns fără conținut
    res.end();
  } catch (err) {
    console.error('Eroare la ștergerea utilizatorului:', err.message); // Log pentru eroare
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}


module.exports = {
  getUtilizatori,
  addUtilizator,
  updateUtilizator,
  deleteUtilizator,
  getUtilizatorAutentificat
};