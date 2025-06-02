const { pool } = require('../db');
const { trimiteEmail } = require('../email'); // Importă funcția pentru trimiterea emailurilor

// Funcție pentru trimiterea notificărilor de stoc redus
async function trimiteNotificariStocRedus(req, res) {
  try {
    // Selectează notificările netrimise
  const notificari = await pool.query(`
  SELECT n.id, n.mesaj, a.nume, a.cantitate AS stoc
  FROM notificare n
  JOIN articol a ON n.articol_id = a.id
  WHERE n.trimis = FALSE
`);

    console.log(`Rezultate interogare: ${JSON.stringify(notificari.rows)}`);

    if (notificari.rows.length > 0) {
      // Trimite un singur email cu toate notificările
      await trimiteEmail(notificari.rows);

      // Marchează toate notificările ca trimise
      const ids = notificari.rows.map(n => n.id);
      const result = await pool.query('UPDATE notificare SET trimis = TRUE WHERE id = ANY($1)', [ids]);
      console.log(`Rânduri actualizate: ${result.rowCount}`);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Notificările au fost trimise cu succes!' }));
  } catch (err) {
    console.error('Eroare la trimiterea notificărilor:', err.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Eroare la trimiterea notificărilor' }));
  }
}

async function getNotificari(req, res) {
  try {
    const result = await pool.query(`
      SELECT n.id, n.mesaj, a.nume AS articol, a.cantitate AS stoc,  a.id AS articol_id
      FROM notificare n
      JOIN articol a ON n.articol_id = a.id
      WHERE n.trimis = TRUE
    `);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.rows));
  } catch (err) {
    console.error('Eroare la preluarea notificărilor:', err.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Eroare la preluarea notificărilor' }));
  }
}


module.exports = {
  trimiteNotificariStocRedus,
  getNotificari,
};