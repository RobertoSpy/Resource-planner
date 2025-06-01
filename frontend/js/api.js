// api.js
export async function fetchCategorii() {
  const res = await fetch('/api/categorie');
  if (!res.ok) throw new Error('Eroare la încărcarea categoriilor');
  return await res.json();
}

export async function fetchArticole() {
  const res = await fetch('/api/articole');
  if (!res.ok) throw new Error('Eroare la încărcarea categoriilor');
  return await res.json();
}

export async function adaugaCategorie(categorie) {
  const res = await fetch('/api/categorie', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categorie)
  });
  if (!res.ok) throw new Error('Eroare la adaugarea categoriei');
  return await res.json();
}

export async function modificaCategorie(id, categorie) {
  const res = await fetch(`/api/categorie/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categorie)
  });
  if (!res.ok) throw new Error('Eroare la modificarea categoriei');
  return await res.json();
}

export async function stergeCategorie(id) {
  const res = await fetch(`/api/categorie/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Eroare la stergerea categoriei');
  return await res.json();
}

export async function fetchArticoleLowStock() {
  const res = await fetch('/api/articole/low-stock');
  if (!res.ok) throw new Error('Eroare la încărcarea produselor cu stoc mic');
  const data = await res.json();
  console.log('LOW STOCK:', data); 
  return data;
}


export async function fetchArticoleLowPrice() {
  const res = await fetch('/api/articole/low-price');
  if (!res.ok) {
    const text = await res.text();
    console.error('Răspuns server:', res.status, text);
    throw new Error(`Eroare la încărcarea produselor ieftine: ${res.status}`);
  }
  return await res.json();
}



