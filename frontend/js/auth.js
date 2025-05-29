document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
  
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
  
        try {
          const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, parola: password }),
          });
  
          const data = await response.json();
          if (response.ok) {
            document.getElementById('loginMessage').textContent = 'Login reușit!';
            console.log('Token:', data.token);
          } else {
            document.getElementById('loginMessage').textContent = data.err;
          }
        } catch (err) {
          console.error('Eroare:', err);
        }
      });
    }
  
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const name = document.getElementById('name').value;
        const password = document.getElementById('password').value;
  
        try {
          const response = await fetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, nume: name, parola: password }),
          });
  
          const data = await response.json();
          if (response.ok) {
            document.getElementById('registerMessage').textContent = 'Înregistrare reușită!';
          } else {
            document.getElementById('registerMessage').textContent = data.err;
          }
        } catch (err) {
          console.error('Eroare:', err);
        }
      });
    }
  });