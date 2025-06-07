// public/js/register.js
import { showLoginPage } from './login.js';
import { registerUser } from '../api.js';

export async function showRegisterPage() {
  const sidebar = document.getElementById('sidebar');
  const content = document.getElementById('content');

  if (sidebar) sidebar.style.display = 'none';

  try {
    const res = await fetch('/js/templates/register.html');
    const html = await res.text();
    content.innerHTML = html;

    document.getElementById('goToLogin').addEventListener('click', showLoginPage);

    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('registerEmail').value;
      const nume = document.getElementById('registerNume').value;
      const parola = document.getElementById('registerParola').value;

      const { ok, data } = await registerUser(email, nume, parola);

      const msg = document.getElementById('registerMessage');
      if (ok) {
        msg.style.color = 'green';
        msg.textContent = 'Înregistrare reușită! Te poți autentifica acum.';
        window.location.href = '/';
      } else {
        msg.style.color = 'red';
        msg.textContent = data.err || 'Eroare la înregistrare';
      }
    });

  } catch (err) {
    console.error('Eroare la încărcarea paginii register:', err.message);
  }
}
