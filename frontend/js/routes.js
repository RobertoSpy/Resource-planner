import { categorii, produseLowStock, produseLowPrice } from './data.js';
import { afiseazaCategorii, afiseazaProduseCategorie, afiseazaProduseDashboard } from './components.js';


import { fetchArticoleLowStock, fetchArticoleLowPrice, fetchCategorii, fetchArticole, adaugaCategorie} from './api.js';
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