const { pool } = require('../db');

async function getArticole(req, res) {
  try {
    const query = `
      SELECT articol.*, categorie.nume AS categorie_nume
      FROM articol
      JOIN categorie ON articol.categorie_id = categorie.id
      ORDER BY articol.id
    `;
    const result = await pool.query(query);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.rows));
  } catch (err) {
    res.writeHead(500);
    res.end('Eroare la citirea articolelor');
  }
}

async function addArticol(req, res, body) {
  try {
    const { nume, cantitate, categorie_id } = JSON.parse(body);
    
    if (!nume || cantitate == null || categorie_id == null) {
      res.writeHead(400);
      return res.end('Date incomplete pentru articol');
    }
    const query = `
      INSERT INTO articol (nume, cantitate, categorie_id)
      VALUES ($1, $2, $3) RETURNING *
    `;
    const result = await pool.query(query, [nume, cantitate, categorie_id]);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.rows[0]));
  } catch (err) {
    res.writeHead(400);
    res.end('Eroare la adăugarea articolului');
  }
}

async function updateArticol(req, res, id, body) {
  try {
    const { nume, cantitate, categorie_id } = JSON.parse(body);
    if (!nume || cantitate == null || categorie_id == null) {
      res.writeHead(400);
      return res.end('Date incomplete pentru articol');
    }
    const query = `
      UPDATE articol SET nume = $1, cantitate = $2, categorie_id = $3
      WHERE id = $4 RETURNING *
    `;
    const result = await pool.query(query, [nume, cantitate, categorie_id, id]);
    if (result.rowCount === 0) {
      res.writeHead(404);
      res.end('Articolul nu a fost găsit');
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows[0]));
    }
  } catch (err) {
    res.writeHead(400);
    res.end('Eroare la actualizarea articolului');
  }
}

async function deleteArticol(req, res, id) {
  try {
    const result = await pool.query('DELETE FROM articol WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      res.writeHead(404);
      res.end('Articolul nu a fost găsit');
    } else {
      res.writeHead(200);
      res.end('Articolul a fost șters');
    }
  } catch (err) {
    res.writeHead(400);
    res.end('Eroare la ștergerea articolului');
  }
}


async function getArticoleLowStock(req, res) {
  try {
    const result = await pool.query('SELECT * FROM verifica_stocuri($1)', [5]);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.rows));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Eroare la interogarea articolelor cu stoc mic' }));
  }
}

module.exports = {
  getArticole,
  addArticol,
  updateArticol,
  deleteArticol,
  getArticoleLowStock
};
