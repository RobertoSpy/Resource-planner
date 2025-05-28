const bcrypt = require('bcrypt');

const parolaIntroduse = 'parola123';
const hashStocat = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Zf4z5Q9h8J9Kq4a9F8Jm';

bcrypt.compare(parolaIntroduse, hashStocat, (err, result) => {
  if (err) {
    console.error('Eroare:', err);
  } else if (result) {
    console.log('✅ Parola este corectă!');
  } else {
    console.log('❌ Parola este greșită!');
  }
});