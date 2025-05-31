import { categorii, produseLowStock, produseLowPrice } from './data.js';
import { afiseazaProduse, afiseazaCategorii } from './components.js';

// Funcție pentru Dashboard
export function loadDashboard() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <h1>Dashboard</h1>
    <section>
      <h2>Top 5 Produse cele mai ieftine</h2>
      <div class="scroll-container" id="lowPrice"></div>
    </section>
    <section>
      <h2>Top 5 Produse aproape epuizate</h2>
      <div class="scroll-container" id="almostEmpty"></div>
    </section>
  `;

  const lowPrice = produseLowPrice.slice(0, 50);
  const almostEmpty = produseLowStock.filter(p => p.stoc < 50).slice(0, 10);

  afiseazaProduse('#lowPrice', lowPrice);
  afiseazaProduse('#almostEmpty', almostEmpty);
}

// Funcție pentru Stocuri
export function loadStocuri() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <h1>Categorii Produse</h1>
    <div class="scroll-container" id="categorii"></div>
    <div id="produse-categorie"></div>
  `;

  afiseazaCategorii('#categorii', categorii, (categorie) => {
    const toateProdusele = [...produseLowStock, ...produseLowPrice];
    const produseFiltrate = toateProdusele.filter(p => p.categorieId === categorie.id);

    const produseContainer = document.getElementById('produse-categorie');
    produseContainer.innerHTML = `<h2>Produse în categoria: ${categorie.nume}</h2><div class="scroll-container" id="produse"></div>`;
    afiseazaProduse('#produse', produseFiltrate);
  });
}

// Funcție pentru pagina de utilizatori
import { fetchUtilizatori, adaugaUtilizator, stergeUtilizator } from './api.js';

export function loadUtilizatori() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <h1>Utilizatori</h1>
    <div class="utilizatori-controls">
      <button id="adauga-utilizator-btn" class="btn-albastru">Adaugă utilizator nou</button>
      <div class="filtru-dropdown">
        <button class="btn-albastru" id="filtreaza-btn">Filtrează utilizator</button>
        <div class="filtru-meniu" id="filtru-meniu" style="display:none;">
          <div data-rol="ADMINISTRATOR">ADMINISTRATOR</div>
          <div data-rol="VANZATOR">VÂNZĂTOR</div>
        </div>
      </div>
    </div>
    <table class="utilizatori-table">
      <thead>
        <tr>
          <th>NUME</th>
          <th>ID</th>
          <th>ROL</th>
          <th></th>
        </tr>
      </thead>
      <tbody id="utilizatori-body"></tbody>
    </table>
  `;

  const adaugaUtilizatorBtn = document.getElementById('adauga-utilizator-btn');
  console.log('adaugaUtilizatorBtn:', adaugaUtilizatorBtn); // Debugging

  if (!adaugaUtilizatorBtn) {
    console.error('Elementul adauga-utilizator-btn nu a fost găsit în DOM.');
    return;
  }

  const rol = localStorage.getItem('rol');
  console.log(rol);
  if (rol === 'ADMINISTRATOR') {
    adaugaUtilizatorBtn.style.display = 'block';
  } else {
    adaugaUtilizatorBtn.style.display = 'block';
  }

  const tbody = document.getElementById('utilizatori-body');

  async function afiseazaUtilizatori() {
    try {
      const utilizatori = await fetchUtilizatori();
      tbody.innerHTML = '';
      utilizatori.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${u.nume}</td>
          <td>${u.id}</td>
          <td>${u.rol}</td>
          <td>
            ${u.rol !== 'ADMINISTRATOR' ? `<button class="delete-btn" data-id="${u.id}">ELIMINARE</button>` : ''}
          </td>
        `;
        tbody.appendChild(tr);
      });

      const deleteButtons = document.querySelectorAll('.delete-btn');
      deleteButtons.forEach(button => {
        button.addEventListener('click', async () => {
          const id = button.dataset.id;
          const confirmare = confirm(`Sigur doriți să eliminați utilizatorul cu ID ${id}?`);
          if (!confirmare) return;

          try {
            await stergeUtilizator(id);
            alert('Utilizator eliminat cu succes!');
            afiseazaUtilizatori();
          } catch (err) {
            console.error('Eroare la eliminarea utilizatorului:', err.message);
            alert('Eroare la eliminarea utilizatorului!');
          }
        });
      });
    } catch (err) {
      console.error('Eroare la încărcarea utilizatorilor:', err.message);
    }
  }

  afiseazaUtilizatori();

  const filtruBtn = document.getElementById('filtreaza-btn');
  const filtruMeniu = document.getElementById('filtru-meniu');
  filtruBtn.addEventListener('click', () => {
    filtruMeniu.style.display = filtruMeniu.style.display === 'none' ? 'block' : 'none';
  });

  filtruMeniu.querySelectorAll('div').forEach(option => {
    option.addEventListener('click', async () => {
      const rol = option.dataset.rol;
      try {
        const utilizatori = await fetchUtilizatori();
        const filtrati = utilizatori.filter(u => u.rol === rol);
        tbody.innerHTML = '';
        filtrati.forEach(u => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${u.nume}</td>
            <td>${u.id}</td>
            <td>${u.rol}</td>
            <td>
              ${u.rol !== 'ADMINISTRATOR' ? `<button class="delete-btn" data-id="${u.id}">ELIMINARE</button>` : ''}
            </td>
          `;
          tbody.appendChild(tr);
        });
      } catch (err) {
        console.error('Eroare la filtrarea utilizatorilor:', err.message);
      }
      filtruMeniu.style.display = 'none';
    });
  });

  adaugaUtilizatorBtn.addEventListener('click', async () => {
    const email = prompt('Introduceți emailul utilizatorului:');
    const nume = prompt('Introduceți numele utilizatorului:');
    const parola = prompt('Introduceți parola utilizatorului:');

    if (!email || !nume || !parola) {
      alert('Toate câmpurile sunt obligatorii!');
      return;
    }

    const utilizator = { email, nume, parola };

    try {
      const rezultat = await adaugaUtilizator(utilizator);
      alert('Utilizator adăugat cu succes!');
      afiseazaUtilizatori();
    } catch (err) {
      console.error('Eroare la adăugarea utilizatorului:', err.message);
      alert('Eroare la adăugarea utilizatorului!');
    }
  });
}

// Funcție pentru Notificări
export function loadNotificari() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <h1>Notificari</h1>
    <table class="notificari-table">
      <thead>
        <tr>
          <th>PRODUS</th>
          <th>ID</th>
          <th>STOC</th>
          <th>VERIFICARE</th>
        </tr>
      </thead>
      <tbody id="notificari-body"></tbody>
    </table>
  `;

  const toateProdusele = [...produseLowStock, ...produseLowPrice];
  const produseUnice = toateProdusele.filter((p, index, self) =>
    index === self.findIndex((x) => x.id === p.id)
  );

  const tbody = document.getElementById('notificari-body');
  produseUnice.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.nume}</td>
      <td>${p.id}</td>
      <td>${p.stoc}</td>
      <td><button class="verificare-btn">${p.stoc === 0 ? 'DA' : 'NU'}</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// Setup sidebar și routing
export function setupRouting() {
  const sidebar = document.getElementById('sidebar');
  const content = document.getElementById('content');

  // Verifică dacă utilizatorul este autentificat
  function isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  // Afișează pagina de login
  function showLoginPage() {
    sidebar.innerHTML = ''; // Ascunde sidebar-ul
    content.innerHTML = `
      <h1>Autentificare</h1>
      <form id="loginForm">
        <input type="email" id="loginEmail" placeholder="Email" required />
        <input type="password" id="loginParola" placeholder="Parolă" required />
        <button type="submit">Autentificare</button>
      </form>
      <p id="loginMessage" style="color: red;"></p>
      <p>Nu ai cont? <button id="goToRegister" style="background: none; color: blue; border: none; cursor: pointer;">Înregistrează-te</button></p>
    `;

    document.getElementById('goToRegister').addEventListener('click', showRegisterPage);

    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const parola = document.getElementById('loginParola').value;

      try {
        const response = await fetch('http://localhost:3000/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, parola }),
        });

        const data = await response.json();
        if (response.ok) {
          localStorage.setItem('token', data.token); // Salvează token-ul
          location.reload(); // Reîncarcă pagina după autentificare
        } else {
          document.getElementById('loginMessage').textContent = data.err || 'Eroare la autentificare';
        }
      } catch (err) {
        console.error('Eroare:', err);
      }
    });
  }

  // Afișează pagina de înregistrare
  function showRegisterPage() {
    sidebar.innerHTML = ''; // Ascunde sidebar-ul
    content.innerHTML = `
      <h1>Înregistrare</h1>
      <form id="registerForm">
        <input type="email" id="registerEmail" placeholder="Email" required />
        <input type="text" id="registerNume" placeholder="Nume" required />
        <input type="password" id="registerParola" placeholder="Parolă" required />
        <button type="submit">Înregistrează-te</button>
      </form>
      <p id="registerMessage" style="color: red;"></p>
      <p>Ai deja cont? <button id="goToLogin" style="background: none; color: blue; border: none; cursor: pointer;">Autentifică-te</button></p>
    `;

    document.getElementById('goToLogin').addEventListener('click', showLoginPage);

    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('registerEmail').value;
      const nume = document.getElementById('registerNume').value;
      const parola = document.getElementById('registerParola').value;

      try {
        const response = await fetch('http://localhost:3000/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, nume, parola }),
        });

        const data = await response.json();
        if (response.ok) {
          document.getElementById('registerMessage').style.color = 'green';
          document.getElementById('registerMessage').textContent = 'Înregistrare reușită! Te poți autentifica acum.';
        } else {
          document.getElementById('registerMessage').textContent = data.err || 'Eroare la înregistrare';
        }
      } catch (err) {
        console.error('Eroare:', err);
      }
    });
  }

  // Logout
  function logout() {
    localStorage.removeItem('token'); // Șterge token-ul
    location.reload(); // Reîncarcă pagina
  }

  // Dacă utilizatorul nu este autentificat, afișează pagina de login
  if (!isAuthenticated()) {
    showLoginPage();
    return;
  }

  // Afișează sidebar-ul și configurează rutele
  sidebar.innerHTML = `
    <button id="btn-dashboard">Dashboard</button>
    <button id="btn-stocuri">Stocuri</button>
    <button id="btn-utilizatori">Utilizatori</button>
    <button id="btn-notificari">Notificări</button>
    <button id="btn-logout">Logout</button>
  `;

  document.getElementById('btn-logout').addEventListener('click', logout);

  function navigate(path) {
    history.pushState({ path }, '', path);
    renderRoute(path);
  }

  function renderRoute(path) {
    if (path === '/dashboard') {
      loadDashboard();
      setActiveButton('btn-dashboard');
    } else if (path === '/dashboard/stocuri') {
      loadStocuri();
      setActiveButton('btn-stocuri');
    } else if (path === '/dashboard/utilizatori') {
      loadUtilizatori();
      setActiveButton('btn-utilizatori');
    } else if (path === '/dashboard/notificari') {
      loadNotificari();
      setActiveButton('btn-notificari');
    } else {
      history.replaceState({ path: '/dashboard' }, '', '/dashboard');
      loadDashboard();
      setActiveButton('btn-dashboard');
    }
  }

  function setActiveButton(btnId) {
    document.querySelectorAll('#sidebar button').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(btnId);
    if (btn) btn.classList.add('active');
  }

  document.getElementById('btn-dashboard').addEventListener('click', () => navigate('/dashboard'));
  document.getElementById('btn-stocuri').addEventListener('click', () => navigate('/dashboard/stocuri'));
  document.getElementById('btn-utilizatori').addEventListener('click', () => navigate('/dashboard/utilizatori'));
  document.getElementById('btn-notificari').addEventListener('click', () => navigate('/dashboard/notificari'));

  window.addEventListener('popstate', (event) => {
    if (event.state && event.state.path) {
      renderRoute(event.state.path);
    } else {
      renderRoute(location.pathname);
    }
  });

  renderRoute(location.pathname);
}