export function afiseazaProduseDashboard(selector, produse) {
  const container = document.querySelector(selector);
  if (!Array.isArray(produse)) {
    container.innerHTML = `<p style="color:red;">Eroare la afișarea produselor.</p>`;
    return;
  }

  container.innerHTML = produse.map(p => `
    <div class="produs-card">
      <img src="resources/articole.jpg" alt="${p.nume}" />
      <h3>${p.nume}</h3>
     <p style="margin: 0.25rem 0;">Preț: ${p.pret} lei</p>
      <p style="margin: 0.25rem 0;">Stoc: ${p.cantitate}</p>
    </div>
  `).join('');
}



export function afiseazaProduseCategorie(selector, produse, onDelete, onEdit) {
  const container = document.querySelector(selector);

  if (!Array.isArray(produse)) {
    container.innerHTML = `<p style="color:red;">Eroare la afișarea produselor.</p>`;
    console.error('afiseazaProduse: Nu s-a primit un array', produse);
    return;
  }

  container.innerHTML = produse.map(p => `
    <div class="produs-card">
      <div class="card-header">
        <button class="btn-edit" data-id="${p.id}">✏️</button>
        <button class="btn-delete" data-id="${p.id}">🗑️</button>
      </div>
      <img src="/resources/articole.jpg" alt="${p.nume}" />
      <h3>${p.nume}</h3>
      <p>Pret: ${p.pret} lei</p>
      <p>Stoc: ${p.cantitate}</p> 
    </div>
  `).join('');

  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (confirm('Sigur vrei să ștergi acest produs?')) {
        onDelete?.(parseInt(id));
      }
    });
  });

  container.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      onEdit?.(parseInt(id));
    });
  });
}


export function afiseazaCategorii(selector, categorii, onClick, onDelete) {
  const container = document.querySelector(selector);
  container.innerHTML = '';

  categorii.forEach(cat => {
    const card = document.createElement('div');
    card.classList.add('categorie-card');

    const img = document.createElement('img');
    img.src = "/resources/articole.jpg";
    img.alt = cat.nume;

    const titlu = document.createElement('div');
    titlu.classList.add('categorie-nume');
    titlu.textContent = cat.nume;

    // Butonul de ștergere
    const btnDelete = document.createElement('button');
    btnDelete.textContent = '🗑️';
    btnDelete.title = 'Șterge categoria';
    btnDelete.style.marginLeft = '10px';
    btnDelete.style.cursor = 'pointer';

    // Eveniment pentru ștergere cu confirmare
    btnDelete.addEventListener('click', async (e) => {
      e.stopPropagation(); // previne declanșarea click-ului pe card
      if (confirm(`Sigur vrei să ștergi categoria "${cat.nume}" și toate articolele din ea?`)) {
        try {
          await onDelete(cat);
          alert('Categoria a fost ștearsă cu succes.');
        } catch (err) {
          alert('Eroare la ștergerea categoriei: ' + err.message);
        }
      }
    });

    card.appendChild(img);
    card.appendChild(titlu);
    card.appendChild(btnDelete);

    
    card.addEventListener('click', () => onClick(cat));

    container.appendChild(card);
  });
}


export function afiseazaModal(modalId, onClose) {
  const modal = document.getElementById(modalId);
  const closeModalBtn = modal.querySelector('.btn-rosu');

  // Afișează modalul
  modal.style.display = 'flex';

  // Închide modalul
  closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    if (onClose) onClose(); // Callback opțional la închidere
  });
}