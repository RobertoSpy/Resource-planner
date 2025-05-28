const { pool } = require('../db');


function getCategorie(req, res) {
  pool.query('SELECT * FROM categorie ORDER BY id')
    .then(result => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows));
    })
    .catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Eroare la interogarea bazei de date' }));
    });
}

module.exports = { getCategorie };


async function addCategorie(req, res, body) {
  try {
    const { nume } = JSON.parse(body);
    const result = await pool.query('INSERT INTO categorie (nume) VALUES ($1) RETURNING *', [nume]);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.rows[0]));
  } catch (err) {
    res.writeHead(400);
    res.end('Eroare la adăugarea categoriei');
  }
}

async function updateCategorie(req, res, id, body) {
  try {
    const { nume } = JSON.parse(body);
    const result = await pool.query('UPDATE categorie SET nume = $1 WHERE id = $2 RETURNING *', [nume, id]);
    if (result.rowCount === 0) {
      res.writeHead(404);
      res.end('Categoria nu a fost găsită');
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows[0]));
    }
  } catch (err) {
    res.writeHead(400);
    res.end('Eroare la actualizarea categoriei');
  }
}

async function deleteCategorie(req, res, id) {
  try {
    const result = await pool.query('DELETE FROM categorie WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      res.writeHead(404);
      res.end('Categoria nu a fost găsită');
    } else {
      res.writeHead(200);
      res.end('Categoria a fost ștearsă');
    }
  } catch (err) {
    res.writeHead(400);
    res.end('Eroare la ștergerea categoriei');
  }
}

module.exports = {
  getCategorie,
  addCategorie,
  updateCategorie,
  deleteCategorie
};
