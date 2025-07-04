const http = require('http');
const fs = require('fs');
const path = require('path');
const { testConnection } = require('./db');
const { trimiteEmail } = require('./email');
const { pool } = require('./db'); // Importă conexiunea la baza de date

// Import funcții API

const { getUtilizatori, addUtilizator, updateUtilizator, deleteUtilizator, getUtilizatorAutentificat, getTopAngajat } = require('./api/utilizatori');

const { getArticole, addArticol, updateArticol, deleteArticol, getArticoleLowStock, getArticoleLowPrice, adaugaStocArticol } = require('./api/articole');

const { getCategorie, addCategorie, updateCategorie, deleteCategorie } = require('./api/categorie');

// Import funcții pentru autentificare
const { handleAuthRoutes } = require('./routes/auth');
const verifyToken = require('./middleware/verifyToken');
require('dotenv').config();
 
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};


const server = http.createServer(async (req, res) => {
  console.log(`Cerere primită: ${req.method} ${req.url}`); // Log pentru fiecare cerere

  // Configurare CORS
  res.setHeader('Access-Control-Allow-Origin', 'http://4.210.141.142:8081'); // Permite cererile din frontend
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Permite metodele HTTP
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Permite anteturile necesare

  // Gestionează cererile OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    console.log('Cerere OPTIONS gestionată');
    res.writeHead(204);
    res.end();
    return;
  }

  const { trimiteNotificariStocRedus, getNotificari } = require('./api/notificari');


// Adaugă ruta pentru notificări
if (req.url === '/api/notificari/stoc-redus' && req.method === 'GET') {
  console.log('Cerere GET la /api/notificari/stoc-redus - Ruta detectată corect');
  await trimiteNotificariStocRedus(req, res);
  return;
}

if (req.url === '/api/notificari' && req.method === 'GET') {
  console.log('Cerere GET la /api/notificari - Ruta detectată corect');
  await getNotificari(req, res);
  return;
}

if (req.url === '/api/top-angajat' && req.method === 'GET') {
  console.log('Cerere GET la /api/top-angajat - Ruta detectată corect');
  await getTopAngajat(req, res);
  return;
}


  if (req.url === '/api/utilizatori/me' && req.method === 'GET') {
    console.log('Cerere GET la /api/utilizatori/me');
  
    verifyToken(req, res, async () => {
      const userId = req.user?.id;
  
      if (!userId) {
        if (!res.headersSent) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Utilizator neautentificat' }));
        }
        return;
      }
  
      try {
        const utilizatorAutentificat = await getUtilizatorAutentificat(req, res);
  
        if (!utilizatorAutentificat) {
          if (!res.headersSent) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Utilizatorul nu a fost găsit' }));
          }
          return;
        }
  
        if (!res.headersSent) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(utilizatorAutentificat));
        }
      } catch (err) {
        console.error('Eroare la obținerea utilizatorului:', err.message);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Eroare server' }));
        }
      }
    });
    return;
  }

  if (req.url === '/protected' && req.method === 'GET') {
    console.log('Cerere GET la /protected');
    verifyToken(req, res, () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ msg: `Salut, utilizator ${req.user.id}` }));
    });
    return;
  }

  // Rutele de autentificare
  if (req.url.startsWith('/api/auth')) {
    console.log('Cerere la ruta de autentificare');
    await handleAuthRoutes(req, res);
    return;
  }

  // Rute API pentru utilizatori
  if (req.url.startsWith('/api/utilizatori')) {
    console.log('Cerere la ruta /api/utilizatori');
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', async () => {
      console.log(`Body primit: ${body}`);
      const idMatch = req.url.match(/^\/api\/utilizatori\/(\d+)/);
  
      try {
        if (req.method === 'GET' && req.url === '/api/utilizatori') {
          console.log('GET utilizatori');
          await getUtilizatori(req, res);
        } else if (req.method === 'POST') {
          console.log('POST utilizator');
          await addUtilizator(req, res, body);
        } else if (req.method === 'PUT' && idMatch) {
          console.log(`PUT utilizator cu ID: ${idMatch[1]}`);
          await updateUtilizator(req, res, idMatch[1], body);
        } else if (req.method === 'DELETE' && idMatch) {
          console.log(`DELETE utilizator cu ID: ${idMatch[1]}`);
          await deleteUtilizator(req, res, idMatch[1]);
        } else {
          console.log('Ruta utilizatori necunoscută');
          if (!res.headersSent) {
            res.writeHead(404);
            res.end('Not found');
          }
        }
      } catch (err) {
        console.error('Eroare la gestionarea cererii:', err.message);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Eroare server' }));
        }
      }
    });
    return;
  }

  // Rute API pentru articole
  if (req.url.startsWith('/api/articole')) {
  console.log('Cerere la ruta /api/articole');
  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', () => {
    console.log(`Body primit: ${body}`);
    const idMatch = req.url.match(/^\/api\/articole\/(\d+)/);
    const adaugaStocMatch = req.url.match(/^\/api\/articole\/(\d+)\/adauga-stoc$/);

    if (req.method === 'GET') {
      if (req.url === '/api/articole') {
        console.log('GET articole');
        getArticole(req, res);
      } else if (req.url === '/api/articole/low-stock') {
        console.log('GET articole low-stock');
        getArticoleLowStock(req, res);
      } else if (req.url === '/api/articole/low-price') {
        getArticoleLowPrice(req, res);
      } else {
        console.log('Ruta articole necunoscută');
        res.writeHead(404);
        res.end('Not found');
      }
    } else if (req.method === 'POST') {
      console.log('POST articol');
      addArticol(req, res, body);
    } else if (req.method === 'PUT') {
      if (adaugaStocMatch) {
        console.log(`PUT adauga-stoc articol cu ID: ${adaugaStocMatch[1]}`);
        adaugaStocArticol(req, res, adaugaStocMatch[1], body);
      } else if (idMatch) {
        console.log(`PUT update articol cu ID: ${idMatch[1]}`);
        updateArticol(req, res, idMatch[1], body);
      } else {
        console.log('Ruta PUT necunoscută');
        res.writeHead(404);
        res.end('Not found');
      }
    } else if (req.method === 'DELETE' && idMatch) {
      console.log(`DELETE articol cu ID: ${idMatch[1]}`);
      deleteArticol(req, res, idMatch[1]);
    } else {
      console.log('Ruta articole necunoscută');
      res.writeHead(404);
      res.end('Not found');
    }
  });
  return;
}

  
  // Rute API pentru categorii
  if (req.url.startsWith('/api/categorie')) {
    console.log('Cerere la ruta /api/categorie');
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      console.log(`Body primit: ${body}`);
      const idMatch = req.url.match(/^\/api\/categorie\/(\d+)/);
      if (req.method === 'GET' && req.url === '/api/categorie') {
        console.log('GET categorii');
        getCategorie(req, res);
      } else if (req.method === 'POST') {
        console.log('POST categorie');
        addCategorie(req, res, body);
      } else if (req.method === 'PUT' && idMatch) {
        console.log(`PUT categorie cu ID: ${idMatch[1]}`);
        updateCategorie(req, res, idMatch[1], body);
      } else if (req.method === 'DELETE' && idMatch) {
        console.log(`DELETE categorie cu ID: ${idMatch[1]}`);
        deleteCategorie(req, res, idMatch[1]);
      } else {
        console.log('Ruta categorii necunoscută');
        res.writeHead(404);
        res.end('Not found');
      }
    });
    return;
  }

  // Servire fișiere statice
  let filePath = path.join(__dirname, '..', 'frontend', req.url === '/' ? 'index.html' : req.url);
  let ext = path.extname(filePath);
  let contentType = mimeTypes[ext] || 'text/plain';


  console.log(`Servire fișier static: ${filePath}`);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.log('Fișier static nu a fost găsit, servire index.html');
        fs.readFile(path.join(__dirname, '..', 'frontend', 'index.html'), (err, content) => {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content);
        });
      } else {
        console.error('Eroare la servirea fișierului static:', err.message);
        res.writeHead(500);
        res.end('Eroare server');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

const PORT = 3000;

testConnection().then(() => {
  console.log('Conexiunea la baza de date este stabilită');
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend rulează pe http://0.0.0.0:${PORT}`);
  });

 setInterval(async () => {
  console.log('Interval: Verificare notificări automate');

  try {
    // 1. Selectează articolele cu stoc redus
    const produse = await pool.query(`
      SELECT id, nume, cantitate AS stoc, ultima_notificare 
      FROM articol 
      WHERE cantitate < 3 AND (ultima_notificare IS NULL OR ultima_notificare < NOW() - INTERVAL '1 day')
    `);

    const produseUnice = [...new Map(produse.rows.map(p => [p.nume, p])).values()];
    if (produseUnice.length === 0) {
      console.log('Nu există produse noi pentru notificare.');
      return;
    }

    const ids = produseUnice.map(p => p.id);

    // 2. Selectează notificările netrimise existente din DB
    const notificariExistente = await pool.query(`
      SELECT n.id, n.mesaj, a.nume, a.cantitate AS stoc, n.articol_id
      FROM notificare n
      JOIN articol a ON n.articol_id = a.id
      WHERE n.articol_id = ANY($1) AND n.trimis = FALSE
    `, [ids]);

    if (notificariExistente.rows.length > 0) {
      // 3. Trimite emailul cu notificările netrimise
      await trimiteEmail(notificariExistente.rows);

      // 4. Marchează-le ca trimise
      const notifIds = notificariExistente.rows.map(n => n.id);
      const result = await pool.query(`
        UPDATE notificare SET trimis = TRUE WHERE id = ANY($1)
      `, [notifIds]);
      console.log(`Notificări marcate ca trimise: ${result.rowCount}`);
    } else {
      console.log('Nu există notificări netrimise. Verific dacă trebuie să inserez altele...');
    }

    // 5. Inserează notificări noi doar dacă nu există deja cu trimis = FALSE
    for (const produs of produseUnice) {
      const check = await pool.query(`
        SELECT 1 FROM notificare 
        WHERE articol_id = $1 AND trimis = FALSE
      `, [produs.id]);

      if (check.rows.length === 0) {
        await pool.query(`
          INSERT INTO notificare (articol_id, mesaj, trimis, data_notificare) 
          VALUES ($1, $2, FALSE, NOW())
        `, [produs.id, `Stoc scăzut pentru articolul ${produs.nume}`]);

        console.log(`Notificare nouă adăugată pentru: ${produs.nume}`);
      } else {
        console.log(`Notificare deja existentă (netrimisă) pentru: ${produs.nume}`);
      }
    }

    // 6. Actualizează ultima_notificare în tabelul articol
    const resultArticol = await pool.query(`
      UPDATE articol 
      SET ultima_notificare = NOW() 
      WHERE id = ANY($1)
    `, [ids]);
    console.log(`Articole actualizate cu ultima_notificare: ${resultArticol.rowCount}`);

    console.log('Notificările automate au fost procesate cu succes.');
  } catch (err) {
    console.error('Eroare la procesarea notificărilor automate:', err.message);
  }
}, 30 * 1000);


}).catch((err) => {
  console.error('Eroare la conexiunea cu baza de date:', err.message);
  process.exit(1);
});