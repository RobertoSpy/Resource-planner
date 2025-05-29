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

const utilizatori = [
  { nume: 'SPIRIDON ROBERTO', id: '27372727', rol: 'ADMINISTRATOR' },
  { nume: 'COCEA IUSTIN', id: '27372727', rol: 'ANGAJAT' }
];

// Funcție pentru pagina de utilizatori
export function loadUtilizatori() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <h1>Utilizatori</h1>
    <div class="utilizatori-controls">
      <button class="btn-albastru">Adauga utilizator nou</button>
      <div class="filtru-dropdown">
        <button class="btn-albastru" id="filtreaza-btn">Filtreaza utilizator</button>
        <div class="filtru-meniu" id="filtru-meniu" style="display:none;">
          <div data-rol="ADMINISTRATOR">ADMINISTRATOR</div>
          <div data-rol="ANGAJAT">ANGAJAT</div>
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

  const tbody = document.getElementById('utilizatori-body');

  function afiseazaUtilizatori(lista) {
    tbody.innerHTML = '';
    lista.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${u.nume}</td>
        <td>${u.id}</td>
        <td>${u.rol}</td>
        <td>
          <button class="edit-btn"><i class="fa fa-edit"></i></button>
          <button class="delete-btn">ELIMINARE</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  afiseazaUtilizatori(utilizatori);

  // Dropdown filtre
  const filtruBtn = document.getElementById('filtreaza-btn');
  const filtruMeniu = document.getElementById('filtru-meniu');
  filtruBtn.addEventListener('click', () => {
    filtruMeniu.style.display = filtruMeniu.style.display === 'none' ? 'block' : 'none';
  });

  filtruMeniu.querySelectorAll('div').forEach(option => {
    option.addEventListener('click', () => {
      const rol = option.dataset.rol;
      const filtrati = utilizatori.filter(u => u.rol === rol);
      afiseazaUtilizatori(filtrati);
      filtruMeniu.style.display = 'none';
    });
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
  sidebar.innerHTML = `
    <button id="btn-dashboard">Dashboard</button>
    <button id="btn-stocuri">Stocuri</button>
    <button id="btn-utilizatori">Utilizatori</button>
     <button id="btn-notificari">Notificări</button>
  `;

  // Navighează și actualizează URL-ul fără reload
  function navigate(path) {
    history.pushState({ path }, '', path);
    renderRoute(path);
  }

  // Renderizează pagina în funcție de path
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

  // Activează butonul curent în sidebar
  function setActiveButton(btnId) {
    document.querySelectorAll('#sidebar button').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(btnId);
    if (btn) btn.classList.add('active');
  }

  // Event click pe butoane
  document.getElementById('btn-dashboard').addEventListener('click', () => navigate('/dashboard'));
  document.getElementById('btn-stocuri').addEventListener('click', () => navigate('/dashboard/stocuri'));
  document.getElementById('btn-utilizatori').addEventListener('click', () => navigate('/dashboard/utilizatori'));
document.getElementById('btn-notificari').addEventListener('click', () => navigate('/dashboard/notificari'));


  // Când navighezi înapoi/înainte în browser
  window.addEventListener('popstate', (event) => {
    if (event.state && event.state.path) {
      renderRoute(event.state.path);
    } else {
      renderRoute(location.pathname);
    }
  });

  
  renderRoute(location.pathname);
}
