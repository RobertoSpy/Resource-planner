import { categorii, produseLowStock, produseLowPrice } from './data.js';
import { afiseazaCategorii, afiseazaProduseCategorie, afiseazaProduseDashboard } from './components.js';


import { fetchArticoleLowStock, fetchArticoleLowPrice, fetchCategorii, fetchArticole, adaugaCategorie, adaugaStoc, fetchNotificari} from './api.js';
import { adaugaArticol, deleteArticol1, updateArticol } from './apiFetch/articolFetch.js';


// Funcția loadDashboard 
export async function loadDashboard() {
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

  
   const produseLowPrice = await fetchArticoleLowPrice();

  const produseLowStock = await fetchArticoleLowStock();

  afiseazaProduseDashboard('#almostEmpty', produseLowStock.slice(0, 10));
  afiseazaProduseDashboard('#lowPrice', produseLowPrice.slice(0, 10));
}

async function gasesteSauCreeazaCategorie(numeCategorie) {
  const categorii = await fetchCategorii();
  const gasita = categorii.find(c => c.nume.toLowerCase() === numeCategorie.toLowerCase());
  if (gasita) return gasita.id;

  const nouaCategorie = await adaugaCategorie({ nume: numeCategorie });
  return nouaCategorie.id;
}


// Funcție pentru încărcarea stocurilor și afișarea categoriilor + produse
export async function loadStocuri() {
  try {
    let categorii = await fetchCategorii();
    let articole = await fetchArticole();

    const content = document.getElementById('content');
    content.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h1>Categorii Produse</h1>
        <button id="btn-adauga-categorie">Adaugă categorie</button>
        <button id="btn-importa-stocuri">Importă stocuri</button>
        <input type="file" id="input-import-fisier" accept=".csv" style="display:none;" />
      </div>
      <div class="scroll-container" id="categorii"></div>
      <div id="produse-categorie"></div>
      <div id="form-categorie-container" style="margin-top: 10px;"></div>
    `;

    // Atașăm event listener pentru butonul de import
    document.getElementById('btn-importa-stocuri').addEventListener('click', () => {
      document.getElementById('input-import-fisier').click();
    });

    

    // Atașăm event listener pentru inputul de fișier
    document.getElementById('input-import-fisier').addEventListener('change', (e) => {

  const Papa = window.Papa; 
  if (!Papa) {
    console.error("PapaParse nu este încărcat!");
    return;
  }

      const file = e.target.files[0];
      if (!file) return;

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const rows = results.data;
          for (const row of rows) {
            try {
              const categorieId = await gasesteSauCreeazaCategorie(row.categorie);
              await adaugaArticol({
                nume: row.nume,
                cantitate: parseFloat(row.cantitate),
                pret: parseFloat(row.pret),
                categorie_id: categorieId
              });
            } catch (err) {
              console.error('Eroare la import articol:', err.message);
            }
          }
          alert('Import complet!');
          loadStocuri();
        }
      });
    });

    // Funcție pentru afișarea categoriilor și atașarea eventurilor
    afiseazaCategorii('#categorii', categorii, (categorie) => {
      const produseFiltrate = articole.filter(p => p.categorie_id === categorie.id);

      const produseContainer = document.getElementById('produse-categorie');
      produseContainer.innerHTML = `
        <h2>Produse în categoria: ${categorie.nume}</h2>
        <form id="add-produs-form">
          <input type="hidden" name="categorie_id" value="${categorie.id}" />
          <input type="text" name="nume" placeholder="Nume produs" required />
          <input type="number" name="cantitate" placeholder="Cantitate" required />
          <input type="number" name="pret" placeholder="Preț" required step="0.01" />
          <button type="submit">Adaugă</button>
        </form>
        <div class="scroll-container" id="produse"></div>
      `;

      afiseazaProduseCategorie('#produse', produseFiltrate, handleDelete, handleEdit);

      const form = document.getElementById('add-produs-form');
      let idEdit = null;

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const produs = {
          nume: formData.get('nume'),
          cantitate: parseInt(formData.get('cantitate')),
          pret: parseFloat(formData.get('pret')),
          categorie_id: parseInt(formData.get('categorie_id'))
        };

        try {
          if (idEdit) {
            await updateArticol(idEdit, produs);
            articole = articole.map(a => a.id === idEdit ? { ...a, ...produs } : a);
          } else {
            const produsAdaugat = await adaugaArticol(produs);
            articole.push(produsAdaugat);
          }
          const produseReincarcate = articole.filter(p => p.categorie_id === categorie.id);
          afiseazaProduseCategorie('#produse', produseReincarcate, handleDelete, handleEdit);
          form.reset();
          idEdit = null;
        } catch (err) {
          alert(err.message || 'Eroare necunoscută la adăugarea produsului');
        }
      });

      function handleEdit(id) {
        const articol = articole.find(a => a.id === id);
        if (!articol) return;
        form.nume.value = articol.nume;
        form.cantitate.value = articol.cantitate;
        form.pret.value = articol.pret;
        form.categorie_id.value = articol.categorie_id;
        idEdit = id;
      }

      async function handleDelete(id) {
        try {
          await deleteArticol1(id);
          articole = articole.filter(a => a.id !== id);
          const produseReincarcate = articole.filter(p => p.categorie_id === categorie.id);
          afiseazaProduseCategorie('#produse', produseReincarcate, handleDelete, handleEdit);
          if (idEdit === id) {
            form.reset();
            idEdit = null;
          }
        } catch (err) {
          alert('Eroare la ștergerea articolului');
        }
      }
    });

    // Buton adaugă categorie
    document.getElementById('btn-adauga-categorie').addEventListener('click', () => {
      const formContainer = document.getElementById('form-categorie-container');
      formContainer.innerHTML = `
        <form id="form-adauga-categorie">
          <input type="text" name="nume" placeholder="Nume categorie" required />
          <button type="submit">Salvează</button>
          <button type="button" id="btn-anuleaza-categorie">Anulează</button>
        </form>
      `;

      document.getElementById('btn-anuleaza-categorie').addEventListener('click', () => {
        formContainer.innerHTML = '';
      });

      document.getElementById('form-adauga-categorie').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nume = e.target.nume.value.trim();
        if (!nume) {
          alert('Completează numele categoriei');
          return;
        }

        try {
          await adaugaCategorie({ nume });
          formContainer.innerHTML = '';
          categorii = await fetchCategorii();
          articole = await fetchArticole();
          loadStocuri();
        } catch (err) {
          alert('Eroare la adăugarea categoriei: ' + err.message);
        }
      });
    });

  } catch (err) {
    console.error('Eroare la încărcarea datelor:', err);
    const content = document.getElementById('content');
    content.innerHTML = `<p style="color:red;">${err.message}</p>`;
  }
}



const utilizatori = [
  { nume: 'SPIRIDON ROBERTO', id: '27372727', rol: 'ADMINISTRATOR' },
  { nume: 'COCEA IUSTIN', id: '27372727', rol: 'ANGAJAT' }
];


// Funcție pentru pagina de utilizatori
import { fetchUtilizatori, adaugaUtilizator, stergeUtilizator, fetchUtilizatorCurent } from './api.js';

export async function loadUtilizatori() {
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
    <div id="notification" style="display: none; margin-top: 10px; color: green;"></div>
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
    <!-- Modal pentru adăugarea utilizatorului -->
    <div id="add-user-modal" class="modal" style="display: none;">
      <div class="modal-content">
        <h2>Adaugă utilizator nou</h2>
        <form id="add-user-form" action="javascript:void(0);">
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" required />
          <label for="nume">Nume:</label>
          <input type="text" id="nume" name="nume" required />
          <label for="parola">Parolă:</label>
          <input type="password" id="parola" name="parola" required />
          <div class="modal-buttons">
            <button type="submit" class="btn-albastru">Adaugă utilizator</button>
            <button type="button" id="close-modal-btn" class="btn-rosu">Renunță</button>
          </div>
        </form>
      </div>
    </div>
    <!-- Modal pentru confirmarea ștergerii -->
    <div id="delete-user-modal" class="modal" style="display: none;">
      <div class="modal-content">
        <h2 id="delete-message">Sigur doriți să ștergeți utilizatorul?</h2>
        <div class="modal-buttons">
          <button id="confirm-delete-btn" class="btn-albastru">Da</button>
          <button id="cancel-delete-btn" class="btn-rosu">Nu</button>
        </div>
      </div>
    </div>
  `;

  const adaugaUtilizatorBtn = document.getElementById('adauga-utilizator-btn');
  const modal = document.getElementById('add-user-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const addUserForm = document.getElementById('add-user-form');
  const deleteModal = document.getElementById('delete-user-modal');
  const deleteMessage = document.getElementById('delete-message');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
  const tbody = document.getElementById('utilizatori-body');
  const filtruBtn = document.getElementById('filtreaza-btn');
  const filtruMeniu = document.getElementById('filtru-meniu');
  const notification = document.getElementById('notification');

  let utilizatorDeSters = null; // Variabilă pentru utilizatorul selectat pentru ștergere

  try {
    const utilizatorCurent = await fetchUtilizatorCurent(); // Obține utilizatorul curent din backend
    const rol = utilizatorCurent.rol;
    console.log('Rol utilizator:', rol);

    // Ascunde butoanele pentru utilizatorii cu rolul "VÂNZĂTOR"
    if (rol === 'VANZATOR') {
      adaugaUtilizatorBtn.style.display = 'none';
    }

    // Afișează modalul pentru adăugare utilizator
    adaugaUtilizatorBtn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.style.display = 'flex'; // Afișează modalul
    });

    // Închide modalul pentru adăugare utilizator
    closeModalBtn.addEventListener('click', () => {
      modal.style.display = 'none'; // Ascunde modalul
    });

    // Gestionarea formularului de adăugare utilizator
    addUserForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const nume = document.getElementById('nume').value;
      const parola = document.getElementById('parola').value;

      if (!email || !nume || !parola) {
        showNotification('Toate câmpurile sunt obligatorii!', 'red');
        return;
      }

      const utilizator = { email, nume, parola };

      try {
        await adaugaUtilizator(utilizator);
        showNotification('Utilizator adăugat cu succes!', 'green');
        modal.style.display = 'none'; // Închide modalul
        afiseazaUtilizatori();
      } catch (err) {
        console.error('Eroare la adăugarea utilizatorului:', err.message);
        showNotification('Eroare la adăugarea utilizatorului!', 'red');
      }
    });

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
              ${rol === 'ADMINISTRATOR' && u.rol !== 'ADMINISTRATOR' ? `<button class="delete-btn" data-id="${u.id}" data-nume="${u.nume}">ELIMINARE</button>` : ''}
            </td>
          `;
          tbody.appendChild(tr);
        });

        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
          button.addEventListener('click', () => {
            utilizatorDeSters = button.dataset.id;
            const numeUtilizator = button.dataset.nume;
            deleteMessage.textContent = `Sigur doriți să ștergeți utilizatorul ${numeUtilizator}?`;
            deleteModal.style.display = 'flex'; // Afișează modalul de confirmare
          });
        });
      } catch (err) {
        console.error('Eroare la încărcarea utilizatorilor:', err.message);
      }
    }

    // Confirmă ștergerea utilizatorului
    confirmDeleteBtn.addEventListener('click', async () => {
      try {
        await stergeUtilizator(utilizatorDeSters);
        showNotification('Utilizator eliminat cu succes!', 'green');
        deleteModal.style.display = 'none'; // Ascunde modalul de confirmare
        afiseazaUtilizatori();
      } catch (err) {
        console.error('Eroare la eliminarea utilizatorului:', err.message);
        showNotification('Eroare la eliminarea utilizatorului!', 'red');
      }
    });

    // Anulează ștergerea utilizatorului
    cancelDeleteBtn.addEventListener('click', () => {
      deleteModal.style.display = 'none'; // Ascunde modalul de confirmare
      utilizatorDeSters = null; // Resetează utilizatorul selectat
    });

    afiseazaUtilizatori();

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
                ${rol === 'ADMINISTRATOR' && u.rol !== 'ADMINISTRATOR' ? `<button class="delete-btn" data-id="${u.id}" data-nume="${u.nume}">ELIMINARE</button>` : ''}
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

    function showNotification(message, color) {
      notification.textContent = message;
      notification.style.color = color;
      notification.style.display = 'block';
      setTimeout(() => {
        notification.style.display = 'none';
      }, 3000); // Ascunde notificarea după 3 secunde
    }
  } catch (err) {
    console.error('Eroare la obținerea rolului utilizatorului:', err.message);
  }
}

export async function loadNotificari() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <h1>Notificări trimise privind stoc redus</h1>
    <table class="notificari-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>PRODUS</th>
          <th>STOC</th>
          <th>MESAJ</th>
          <th>VERIFICARE</th>
        </tr>
      </thead>
      <tbody id="notificari-body"></tbody>
    </table>
  `;

  const tbody = document.getElementById('notificari-body');

  try {
    const raspuns = await fetch('/api/notificari');
    const notificari = await raspuns.json();

    notificari.forEach(n => {
      const tr = document.createElement('tr');
      tr.dataset.articolId = n.articol_id;  
      tr.innerHTML = `
        <td>${n.id}</td>
        <td>${n.articol}</td>
        <td>${n.stoc}</td>
        <td>${n.mesaj}</td>
        <td>
          <input type="number" min="1" value="1" style="width: 60px; margin-right: 5px;" class="input-stoc" />
          <button class="adauga-stoc-btn btn-albastru">Adaugă stoc</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Event listener pentru fiecare buton
    tbody.querySelectorAll('.adauga-stoc-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const row = btn.closest('tr');
        const articolId = row.dataset.articolId;
        const input = row.querySelector('.input-stoc');
        const cantitate = parseInt(input.value);

        if (!articolId || isNaN(cantitate) || cantitate <= 0) {
          alert('Date invalide!');
          return;
        }

        try {
          await adaugaStoc(articolId, cantitate);
          row.remove(); 
        } catch (err) {
          console.error('Eroare:', err.message);
          alert('Eroare la actualizarea stocului.');
        }
      });
    });

  } catch (err) {
    console.error('Eroare la încărcarea notificărilor:', err.message);
    tbody.innerHTML = `<tr><td colspan="5" style="color:red;">Eroare la încărcarea notificărilor</td></tr>`;
  }
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
     sidebar.style.display = 'none';
content.innerHTML = `
  <div class="auth-form-container">
    <h1>Autentificare</h1>
    <form id="loginForm" class="auth-form">
      <input type="email" id="loginEmail" placeholder="Email" required class="auth-input" />
      <input type="password" id="loginParola" placeholder="Parolă" required class="auth-input" />
      <button type="submit" class="auth-submit-button">Autentificare</button>
    </form>
    <p id="loginMessage" class="auth-message"></p>
    <p class="auth-link-message">Nu ai cont? 
      <button id="goToRegister" class="auth-link-button">Înregistrează-te</button>
    </p>
  </div>
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
          navigate('/dashboard')
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
    sidebar.style.display = 'none';
    content.innerHTML = `
     <div class="auth-form-container">
      <h1>Înregistrare</h1>
      <form id="registerForm" class="auth-form">
        <input type="email" id="registerEmail" placeholder="Email" required class="auth-input" />
        <input type="text" id="registerNume" placeholder="Nume" required class="auth-input" />
        <input type="password" id="registerParola" placeholder="Parolă" required class="auth-input" />
        <button type="submit" class="auth-submit-button">Înregistrează-te</button>
      </form>
      <p id="registerMessage" class="auth-message"></p>
      <p class="auth-link-message">
        Ai deja cont?
        <button id="goToLogin" class="auth-link-button">Autentifică-te</button>
      </p>
    </div>
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
    navigate('/auth');
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
    } else if (path === '/auth') {
      showLoginPage();
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