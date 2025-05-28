const http = require('http')
const fs = require('fs')
const path = require('path')
const { handleAuthRoutes } = require('./routes/auth')
const verifyToken = require('./verifyToken')
require('dotenv').config()

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
}

const server = http.createServer(async (req, res) => {
  // ✅ Mutat aici!
  if (req.url === '/protected' && req.method === 'GET') {
    verifyToken(req, res, () => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ msg: `Salut, utilizator ${req.user.id}` }))
    })
    return
  }

  if (req.url.startsWith('/auth')) {
    await handleAuthRoutes(req, res)
    return
  }

  // Servește fișiere statice din frontend
  let filePath = path.join(__dirname, '..', 'frontend', req.url === '/' ? 'index.html' : req.url)
  let ext = path.extname(filePath)
  let contentType = mimeTypes[ext] || 'text/plain'

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(__dirname, '..', 'frontend', 'index.html'), (err, content) => {
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end(content)
        })
      } else {
        res.writeHead(500)
        res.end('Eroare server')
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType })
      res.end(content)
    }
  })
})

const PORT = 3000
server.listen(PORT, () => {
  console.log(`✅ Server pornit pe http://localhost:${PORT}`)
})
