const jwt = require('jsonwebtoken')

function verifyToken(req, res, callback) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    res.writeHead(401, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ err: 'token lipsă' }))
    return
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      res.writeHead(403, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ err: 'token invalid' }))
      return
    }
    req.user = user
    callback()
  })
}

module.exports = verifyToken
