export function afiseazaProduseDashboard(selector, produse) {
  const container = document.querySelector(selector);
  if (!Array.isArray(produse)) {
    container.innerHTML = `<p style="color:red;">Eroare la afișarea produselor.</p>`;
    return;
  }

  container.innerHTML = produse.map(p => `
    <div class="produs-card">
      <img src="${p.imagine || 'placeholder.jpg'}" alt="${p.nume}" />
      <h3>${p.nume}</h3>
      <p>Preț: ${p.pret} lei</p>
      <p>Stoc: ${p.cantitate}</p>
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
      <img src="${p.imagine || 'placeholder.jpg'}" alt="${p.nume}" />
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


export function afiseazaCategorii(selector, categorii, onClick) {
  const container = document.querySelector(selector);
  container.innerHTML = '';
  categorii.forEach(cat => {
    const card = document.createElement('div');
    card.classList.add('categorie-card');
    card.textContent = cat.nume;
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