const nodemailer = require('nodemailer');
const { pool } = require('./db'); // Importă conexiunea la baza de date

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'coceaiustin2004@gmail.com', // Emailul expeditorului
    pass: 'snkn pwii sskp ocls' // App Password generat
  }
});

async function trimiteEmail(notificari) {
  try {
    console.log('Încep procesul de trimitere emailuri...');
    console.log(`Notificări primite pentru trimitere: ${JSON.stringify(notificari)}`);

    // Verifică dacă notificari este un array valid
    if (!Array.isArray(notificari) || notificari.length === 0) {
      console.error('Parametrul notificari este gol sau invalid:', notificari);
      return;
    }

    // Obține lista de emailuri ale utilizatorilor
    console.log('Obțin lista de utilizatori din baza de date...');
    const utilizatori = await pool.query('SELECT email FROM utilizator');
    const emailuri = utilizatori.rows.map(u => u.email).join(',');
    console.log(`Emailuri destinatar: ${emailuri}`);

    if (utilizatori.rows.length === 0) {
      console.log('Nu există utilizatori în baza de date.');
      return;
    }

    // Construiește lista de notificări
    console.log('Construiesc lista de notificări...');
    const listaNotificari = notificari
      .map(n => n.nume ? `- Stoc scăzut pentru articolul ${n.nume} (stoc: ${n.stoc})` : '- Mesaj lipsă')
      .join('\n');
    console.log(`Notificări generate:\n${listaNotificari}`);

    const mesaj = {
      from: 'coceaiustin2004@gmail.com', // Emailul expeditorului
      bcc: emailuri, // Trimitere către toți utilizatorii folosind BCC
      subject: 'Notificare: Produse cu stoc redus',
      text: `Următoarele notificări au fost generate:\n\n${listaNotificari}`
    };

    console.log('Trimit emailul...');
    await transporter.sendMail(mesaj);
    console.log('Email trimis cu succes către utilizatori.');
  } catch (err) {
    console.error('Eroare la trimiterea emailurilor:', err.message);
    console.error('Detalii eroare:', err);
  }
}

module.exports = { trimiteEmail };