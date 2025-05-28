const bcrypt = require('bcrypt');

(async () => {
  const parole = ['parola123', 'parola456'];
  for (const parola of parole) {
    const hash = await bcrypt.hash(parola, 10);
    console.log(`Parola: ${parola} -> Hash: ${hash}`);
  }
})();