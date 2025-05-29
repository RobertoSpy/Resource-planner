const jwt = require('jsonwebtoken')

// verifică dacă cererea HTTP conține un token JWT
function verifyToken(req, res, callback) {
  // extrage antetul Authorization din cererea HTTP
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  // dacă token este null sau undefined, returnează un răspuns HTTP cu codul de stare 401
  if (!token) {
    res.writeHead(401, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ err: 'token lipsă' }))
    return
  }

  // jwt.verify verifica dacă token-ul JWT este valid
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
   // dacă token-ul este invalid returnează un răspuns HTTP cu codul de stare 403 și un mesaj JSON
    if (err) {
      res.writeHead(403, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ err: 'token invalid' }))
      return
    }
    // dcă token-ul este valid, decodează informațiile din token
    req.user = user
    callback()
  })
}
// eportă funcția verifyToken pentru a fi utilizată în alte fișiere
module.exports = verifyToken
