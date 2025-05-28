// routes/auth.js
const { Pool } = require('pg')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => (body += chunk))
    req.on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch (err) {
        reject(err)
      }
    })
  })
}

async function handleAuthRoutes(req, res) {
  if (req.method === 'POST' && req.url === '/auth/register') {
    try {
      const { email, nume, parola } = await parseBody(req)
      const hash = await bcrypt.hash(parola, 10)
      await pool.query(
        'INSERT INTO utilizator (email, nume, parola) VALUES ($1, $2, $3)',
        [email, nume, hash]
      )
      res.writeHead(201, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ msg: 'utilizator înregistrat' }))
    } catch (err) {
      console.error('❌ Eroare la înregistrare:', err)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ err: 'eroare la înregistrare' }))
    }
    return
  }

  if (req.method === 'POST' && req.url === '/auth/login') {
    try {
      const { email, parola } = await parseBody(req)
      const result = await pool.query('SELECT * FROM utilizator WHERE email = $1', [email])
      if (result.rows.length === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ err: 'email incorect' }))
        return
      }
      const user = result.rows[0]
      const valid = await bcrypt.compare(parola, user.parola)
      if (!valid) {
        res.writeHead(401, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ err: 'parolă greșită' }))
        return
      }
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' })
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ token }))
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ err: 'eroare la login' }))
    }
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ err: 'ruta inexistentă' }))
}

module.exports = { handleAuthRoutes }
