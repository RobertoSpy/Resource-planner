export function afiseazaProduse(selector, produse) {
  const container = document.querySelector(selector);
  container.innerHTML = '';

  produse.forEach(p => {
    const prodDiv = document.createElement('div');
    prodDiv.classList.add('produs-card');
    prodDiv.innerHTML = `
      <img src="public/images/${p.img}" alt="${p.nume}" />
      <h3>${p.nume}</h3>
      <p>Preț: ${p.pret} RON</p>
      <p>Stoc: ${p.stoc}</p>
    `;
    container.appendChild(prodDiv);
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