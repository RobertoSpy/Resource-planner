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
  const almostEmpty = produseLowStock.filter(p => p.stoc < 50).slice(0, 5);

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
    // aici ar trebui să ai o funcție loadUtilizatori()
    document.getElementById('content').innerHTML = `<h1>Utilizatori (în construcție)</h1>`;
    setActiveButton('btn-utilizatori');
  } else if (path === '/dashboard/notificari') {
    // la fel, loadNotificari()
    document.getElementById('content').innerHTML = `<h1>Notificări (în construcție)</h1>`;
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

  // La încărcare pagină: setează pagina corectă în funcție de URL
  renderRoute(location.pathname);
}
