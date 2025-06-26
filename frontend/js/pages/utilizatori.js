import { fetchUtilizatori, adaugaUtilizator, stergeUtilizator, fetchUtilizatorCurent } from '../api.js';
import { showNotification } from '../components.js';


export async function loadUtilizatori() {
  const content = document.getElementById('content');
    
  const response = await fetch('/js/templates/utilizatori.html');
  const html = await response.text();
  content.innerHTML = html;

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

    // afiseaza utilizatorii in tabel
    function renderUtilizatori(utilizatori, rolCurent) {
      tbody.innerHTML = '';
      utilizatori.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
  <td data-label="NUME">${u.nume}</td>
  <td data-label="ID">${u.id}</td>
  <td data-label="ROL">${u.rol}</td>
  <td data-label="">
    ${rolCurent === 'ADMINISTRATOR' && u.rol !== 'ADMINISTRATOR' ? `<button class="delete-btn" data-id="${u.id}" data-nume="${u.nume}">ELIMINARE</button>` : ''}
  </td>
`;

        tbody.appendChild(tr);
      });

      document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', () => {
          utilizatorDeSters = button.dataset.id;
          const numeUtilizator = button.dataset.nume;
          deleteMessage.textContent = `Sigur doriți să ștergeți utilizatorul ${numeUtilizator}?`;
          deleteModal.style.display = 'flex';
        });
      });
    }

    async function afiseazaUtilizatori() {
      try {
        const utilizatori = await fetchUtilizatori();
        renderUtilizatori(utilizatori, rol);
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
      const rolFiltru = option.dataset.rol;
      try {
        const utilizatori = await fetchUtilizatori();
        const filtrati = utilizatori.filter(u => u.rol === rolFiltru);
        renderUtilizatori(filtrati, rol); // folosim rolul utilizatorului curent
      } catch (err) {
        console.error('Eroare la filtrarea utilizatorilor:', err.message);
      }
      filtruMeniu.style.display = 'none';
    });
  });

  } catch (err) {
    console.error('Eroare la obținerea rolului utilizatorului:', err.message);
  }
}