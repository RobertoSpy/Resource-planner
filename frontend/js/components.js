export function afiseazaProduse(selector, produse) {
  const container = document.querySelector(selector);

  if (!Array.isArray(produse)) {
    container.innerHTML = `<p style="color:red;">Eroare la afișarea produselor.</p>`;
    console.error('afiseazaProduse: Nu s-a primit un array', produse);
    return;
  }
  container.innerHTML = produse.map(p => `
    <div class="produs-card">
      <img src="${p.imagine || 'placeholder.jpg'}" alt="${p.nume}" />
      <h3>${p.nume}</h3>
      <p>Pret: ${p.pret} lei</p>
      <p>Stoc: ${p.cantitate}</p> 
    </div>
  `).join('');
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