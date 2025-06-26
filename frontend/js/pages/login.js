import { showRegisterPage } from './register.js';
import { loginUser } from '../api.js';

export async function showLoginPage() {
  const sidebar = document.getElementById('sidebar');
  const content = document.getElementById('content');

  if (sidebar) sidebar.style.display = 'none';

  try {
    const res = await fetch('/js/templates/login.html');
    const html = await res.text();
    content.innerHTML = html;

    document.getElementById('goToRegister').addEventListener('click', showRegisterPage);

    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const parola = document.getElementById('loginParola').value;

      const { ok, data } = await loginUser(email, parola);
      if (ok) {
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard';
      } else {
        document.getElementById('loginMessage').textContent = data.err || 'Eroare la autentificare';
      }
    });

  } catch (err) {
    console.error('Eroare la încărcarea paginii login:', err.message);
  }
}
