const http = require('http');
const fs = require('fs');
const path = require('path');
const { testConnection } = require('./db');

// Import funcții API
const { getUtilizatori, addUtilizator, updateUtilizator, deleteUtilizator } = require('./api/utilizatori');
const { getArticole, addArticol, updateArticol, deleteArticol,getArticoleLowStock  } = require('./api/articole');
const { getCategorie, addCategorie, updateCategorie, deleteCategorie } = require('./api/categorie');

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

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, '..', 'frontend', req.url === '/' ? 'index.html' : req.url);
  let ext = path.extname(filePath);
  let contentType = mimeTypes[ext] || 'text/plain';

  // Rute API pentru utilizatori
  if (req.url.startsWith('/api/utilizatori')) {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      const idMatch = req.url.match(/^\/api\/utilizatori\/(\d+)/);
      if (req.method === 'GET' && req.url === '/api/utilizatori') {
        getUtilizatori(req, res);
      } else if (req.method === 'POST') {
        addUtilizator(req, res, body);
      } else if (req.method === 'PUT' && idMatch) {
        updateUtilizator(req, res, idMatch[1], body);
      } else if (req.method === 'DELETE' && idMatch) {
        deleteUtilizator(req, res, idMatch[1]);
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    return;
  }

  // Rute API pentru articole
 if (req.url.startsWith('/api/articole')) {
  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', () => {
    const idMatch = req.url.match(/^\/api\/articole\/(\d+)/);

    if (req.method === 'GET') {
      if (req.url === '/api/articole') {
        getArticole(req, res);
      } else if (req.url === '/api/articole/low-stock') {
        getArticoleLowStock(req, res);
      } else if (idMatch) {
        // eventual get după id, dacă ai implementat
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    } else if (req.method === 'POST') {
      addArticol(req, res, body);
    } else if (req.method === 'PUT' && idMatch) {
      updateArticol(req, res, idMatch[1], body);
    } else if (req.method === 'DELETE' && idMatch) {
      deleteArticol(req, res, idMatch[1]);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });
  return;
}

// Rute API pentru categorii
  if (req.url.startsWith('/api/categorie')) {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      const idMatch = req.url.match(/^\/api\/categorie\/(\d+)/);
      if (req.method === 'GET' && req.url === '/api/categorie') {
        getCategorie(req, res);
      } else if (req.method === 'POST') {
        addCategorie(req, res, body);
      } else if (req.method === 'PUT' && idMatch) {
        updateCategorie(req, res, idMatch[1], body);
      } else if (req.method === 'DELETE' && idMatch) {
        deleteCategorie(req, res, idMatch[1]);
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    return;
  }
    


  // Servire fișiere statice
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(__dirname, '..', 'frontend', 'index.html'), (err, content) => {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content);
        });
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

const PORT = 3000;

testConnection().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Backend rulează pe http://0.0.0.0:${PORT}`);
  });
}).catch((err) => {
  console.error('❌ Eroare la conexiunea cu baza de date:', err);
  process.exit(1);
});
