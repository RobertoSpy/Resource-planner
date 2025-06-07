import { categorii, produseLowStock, produseLowPrice } from './data.js';
import { afiseazaCategorii, afiseazaProduseCategorie, afiseazaProduseDashboard } from './components.js';
import { fetchArticoleLowStock, fetchArticoleLowPrice, fetchCategorii, fetchArticole, adaugaCategorie, adaugaStoc, fetchNotificari, stergeCategorie} from './api.js';
import { adaugaArticol, deleteArticol1, updateArticol } from './apiFetch/articolFetch.js';
import { loadUtilizatori } from './pages/utilizatori.js';
import { showLoginPage } from './pages/login.js';

// Funcția loadDashboard 

const { jsPDF } = window.jspdf;

export async function loadDashboard() {
  const content = document.getElementById('content');
  console.log('loadDashboard a fost apelată');

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

    <section id="sectiune-pdf">
      <h2>Exportă statisticile</h2>
      <div style="text-align: center; margin-top: 20px;">
        <button id="btn-generare-pdf">Generează PDF statistici</button>
      </div>
    </section>
  `;

  const produseLowPrice = await fetchArticoleLowPrice();
  const produseLowStock = await fetchArticoleLowStock();

  afiseazaProduseDashboard('#lowPrice', produseLowPrice.slice(0, 5));
  afiseazaProduseDashboard('#almostEmpty', produseLowStock.slice(0, 5));

  const btnPDF = document.getElementById('btn-generare-pdf');
  if (!btnPDF) {
    console.error('Butonul PDF nu a fost găsit în DOM!');
    return;
  }

  btnPDF.addEventListener('click', async () => {
    console.log('Butonul Generează PDF a fost apăsat.');

    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(16);
    doc.text('Statistica completă stocuri', 10, y);
    y += 10;

    try {
      const categorii = await fetchCategorii();
      const articole = await fetchArticole();

      for (const categorie of categorii) {
        doc.setFontSize(14);
        doc.text(`Categorie: ${categorie.nume}`, 10, y);
        y += 8;

        const produse = articole.filter(p => p.categorie_id === categorie.id);

        if (produse.length === 0) {
          doc.setFontSize(11);
          doc.text('— Fara produse —', 14, y);
          y += 6;
          continue;
        }

        doc.setFontSize(11);
        doc.text('Nume', 14, y);
        doc.text('Cant.', 80, y);
        doc.text('Pret (lei)', 120, y);
        y += 6;

        for (const produs of produse) {
          const pret = parseFloat(produs.pret);  // Verificăm dacă produs.pret este un număr valid
          doc.text(produs.nume, 14, y);
          doc.text(String(produs.cantitate), 80, y);
          doc.text(pret.toFixed(2), 120, y);  // Aplicăm toFixed doar după ce am validat că pret este un număr
          y += 6;

          if (y > 270) {
            doc.addPage();
            y = 10;
          }
        }

        y += 4;
      }

      doc.save('statistica-stocuri.pdf');
    } catch (err) {
      alert('Eroare la generarea PDF-ului: ' + err.message);
    }
  });
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
        <button id="btn-adauga-categorie" class="btn">➕ Adaugă categorie</button>
        <button id="btn-importa-stocuri" class="btn">📁 Importă stocuri</button>
        <input type="file" id="input-import-fisier" accept=".csv" style="display:none;" />
      </div>
      <div class="scroll-container" id="categorii"></div>
      <div id="produse-categorie"></div>
      <div id="form-categorie-container" style="margin-top: 10px;"></div>
    `;

    document.getElementById('btn-importa-stocuri').addEventListener('click', () => {
      document.getElementById('input-import-fisier').click();
    });

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

    // Afișăm categoriile cu callback pentru afișare produse și ștergere categorie
    afiseazaCategorii('#categorii', categorii,
      (categorie) => {  // afișare produse categorie
        const produseFiltrate = articole.filter(p => p.categorie_id === categorie.id);

        const produseContainer = document.getElementById('produse-categorie');
        produseContainer.innerHTML = `
          <h2>Produse în categoria: ${categorie.nume}</h2>
          <form id="add-produs-form">
            <input type="hidden" name="categorie_id" value="${categorie.id}" />
            <input type="text" class="form-control" name="nume" placeholder="Nume produs" required />
            <input type="number" class="form-control" name="cantitate" placeholder="Cantitate" required />
            <input type="number" class="form-control" name="pret" placeholder="Preț" required step="0.01" />
            <button type="submit" class="btn">✅ Adaugă produs</button>
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
      },
      async (categorie) => {  // funcția de ștergere categorie cu confirmare
        if (!confirm(`Ești sigur că vrei să ștergi categoria "${categorie.nume}" și toate produsele ei?`)) {
          return;
        }
        try {
          // Ștergem toate articolele din categoria respectivă
          const articoleDeSters = articole.filter(a => a.categorie_id === categorie.id);
          for (const articol of articoleDeSters) {
            await deleteArticol1(articol.id);
          }
          // Ștergem categoria
          await stergeCategorie(categorie.id);

          // Reîncărcăm datele și UI-ul
          categorii = await fetchCategorii();
          articole = await fetchArticole();
          loadStocuri();
        } catch (err) {
          alert('Eroare la ștergerea categoriei: ' + err.message);
        }
      }
    );

    // Buton adaugă categorie
    document.getElementById('btn-adauga-categorie').addEventListener('click', () => {
      const formContainer = document.getElementById('form-categorie-container');
      formContainer.innerHTML = `
        <form id="form-adauga-categorie">
          <input type="text" name="nume" class="form-control" placeholder="Nume categorie" required />
          <div style="display: flex; gap: 10px;">
            <button type="submit" class="btn">💾 Salvează</button>
            <button type="button" class="btn" id="btn-anuleaza-categorie">❌ Anulează</button>
          </div>
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
let navigate;  // declaram în afara
let renderRoute;
export function setupRouting() {
  const sidebar = document.getElementById('sidebar');
  const content = document.getElementById('content');

  // Verifică dacă utilizatorul este autentificat
  function isAuthenticated() {
    return !!localStorage.getItem('token');
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

  function navigate (path) {
    history.pushState({ path }, '', path);
    renderRoute(path);
  }

  function renderRoute (path) {
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