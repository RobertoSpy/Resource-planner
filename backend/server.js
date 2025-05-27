const http = require('http');
const fs = require('fs');
const path = require('path');
const {testConnection} = require('./db');

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

  // Dacă fișierul nu există, trimite index.html pentru suport SPA
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Pentru SPA routing
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
server.listen(3000, '0.0.0.0', () => {
  console.log('Backend rulează pe http://0.0.0.0:3000');
});

testConnection();