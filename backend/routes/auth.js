const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// configurarea conexiunii la bd
const pool = new Pool({
  user: 'postgres',
  password: 'WEB',
  host: 'my-postgres',
  port: 5432,
  database: 'postgres',
}); 
 
// citește corpul cererii HTTP și îl transformă în JSON
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        console.log('Body primit:', body); // Log pentru corpul cererii brute
        resolve(JSON.parse(body)); // transformă corpul într-un obiect JSON folosind JSON.parse
      } catch (err) {
        console.error('Eroare la parsarea corpului cererii:', err.message); // Log pentru eroare la parsare
        reject(err);
      }
    });
  });
}

async function handleAuthRoutes(req, res) {
  console.log(`Cerere primită: ${req.method} ${req.url}`); // Log pentru fiecare cerere

  if (req.method === 'POST' && req.url === '/api/auth/register') {
    try {
      const { email, nume, parola } = await parseBody(req);
      console.log('Body procesat:', { email, nume, parola }); // Log pentru corpul cererii procesate
  
      const hash = await bcrypt.hash(parola, 10);
      console.log('Hash generat:', hash); // Log pentru hash-ul parolei
  
      // Setează rolul implicit ca 'ADMINISTRATOR'
      const result = await pool.query(
        'INSERT INTO utilizator (email, nume, parola, rol) VALUES ($1, $2, $3, $4)',
        [email, nume, hash, 'ADMINISTRATOR']
      );
      console.log('Administrator creat cu succes:', result.rows); // Log pentru succesul inserării
  
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ msg: 'Administrator creat cu succes.' }));
    } catch (err) {
      console.error('Eroare la înregistrare:', err.message); // Log pentru eroare
  
      // tratează eroarea dacă emailul este duplicat
      if (err.code === '23505') { // codul de eroare pentru constrângerea UNIQUE
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ err: 'email deja folosit' }));
      } else {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ err: 'eroare la înregistrare' }));
      }
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/utilizatori') {
    verifyToken(req, res, async () => {
      try {
        const { email, nume, parola } = await parseBody(req);
        console.log('Body procesat pentru utilizator:', { email, nume, parola }); // Log pentru corpul cererii procesate
  
        // Verifică dacă utilizatorul curent este administrator
        const result = await pool.query('SELECT rol FROM utilizator WHERE id = $1', [req.user.id]);
        console.log('Rol utilizator:', result.rows); // Log pentru rolul utilizatorului
        const user = result.rows[0];
        if (!user || user.rol !== 'ADMINISTRATOR') {
          console.log('Acces interzis: utilizatorul nu este administrator');
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ err: 'Acces interzis. Doar administratorii pot crea conturi.' }));
          return;
        }
  
        const hash = await bcrypt.hash(parola, 10);
        console.log('Hash generat pentru utilizator:', hash); // Log pentru hash-ul parolei
        const insertResult = await pool.query(
          'INSERT INTO utilizator (email, nume, parola, rol) VALUES ($1, $2, $3, $4)',
          [email, nume, hash, 'VANZATOR']
        );
        console.log('Vânzător creat cu succes:', insertResult.rows); // Log pentru succesul inserării
  
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ msg: 'Vânzător creat cu succes.' }));
      } catch (err) {
        console.error('Eroare la crearea vânzătorului:', err.message); // Log pentru eroare
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ err: 'Eroare la crearea vânzătorului.' }));
      }
    });
    return;
  }
  
  if (req.method === 'POST' && req.url === '/api/auth/login') {
    try {
      const { email, parola } = await parseBody(req);
      console.log('Body procesat pentru login:', { email, parola }); // Log pentru corpul cererii procesate
      const result = await pool.query('SELECT * FROM utilizator WHERE email = $1', [email]);
      console.log('Rezultatul interogării pentru login:', result.rows); // Log pentru rezultatul interogării
      if (result.rows.length === 0) {
        console.log('Email incorect');
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ err: 'email incorect' }));
        return;
      }
      const user = result.rows[0];
  
      let valid = false;
      if (user.parola.startsWith('$2b$')) {
        valid = await bcrypt.compare(parola, user.parola);
      } else {
        valid = parola === user.parola;
      }
  
      if (!valid) {
        console.log('Parolă greșită');
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ err: 'parolă greșită' }));
        return;
      }
  
      // Generează token-ul JWT cu rolul utilizatorului
      const token = jwt.sign(
        { id: user.id, email: user.email, rol: user.rol }, // Include rolul în payload
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      console.log('JWT_SECRET utilizat pentru generare:', process.env.JWT_SECRET);
      console.log('Token generat:', token); // Log pentru token-ul generat
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ token }));
    } catch (err) {
      console.error('Eroare la login:', err.message); // Log pentru eroare
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ err: 'eroare la login' }));
    }
    return;
  }

  console.log('Ruta inexistentă:', req.url); // Log pentru ruta inexistentă
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ err: 'ruta inexistentă' }));
}

module.exports = { handleAuthRoutes };