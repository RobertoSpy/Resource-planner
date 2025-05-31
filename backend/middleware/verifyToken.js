const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(req, res, callback) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Token lipsă' }));
    return;
  }

  console.log('JWT_SECRET utilizat pentru verificare:', process.env.JWT_SECRET);
  console.log('Token primit:', token);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Eroare la decodarea token-ului:', err.message);
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Token invalid' }));
      return;
    }
    req.user = user; // Setează utilizatorul în req.user
    console.log('Payload token:', req.user); // Log pentru payload-ul token-ului
    callback();
  });
}

module.exports = verifyToken;