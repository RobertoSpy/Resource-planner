export async function fetchCategorii() {
  const res = await fetch('/api/categorie');
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
}

export async function fetchArticoleLowStock() {
  const res = await fetch('/api/articole/lowstock');
  if (!res.ok) throw new Error('Eroare la încărcarea produselor cu stoc mic');
  return await res.json();
}

export async function fetchUtilizatori() {
  const res = await fetch('/api/utilizatori', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!res.ok) throw new Error('Eroare la încărcarea utilizatorilor');
  return await res.json();
}

export async function adaugaUtilizator(utilizator) {
  const res = await fetch('/api/utilizatori', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(utilizator)
  });
  if (!res.ok) throw new Error('Eroare la adăugarea utilizatorului');
  return await res.json();
}

// Șterge un utilizator (doar pentru administratori)
export async function stergeUtilizator(id) {
  const res = await fetch(`/api/utilizatori/${id}`, { // Ruta corectă
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}` // Dacă autentificarea este necesară
    }
  });
  if (!res.ok) throw new Error('Eroare la ștergerea utilizatorului');
  // Nu parsezi răspunsul ca JSON, deoarece este gol
}

// Modifică un utilizator (doar pentru administratori)
export async function modificaUtilizator(id, utilizator) {
  const res = await fetch(`/auth/utilizatori/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(utilizator)
  });
  if (!res.ok) throw new Error('Eroare la modificarea utilizatorului');
  return await res.json();
}

export async function fetchUtilizatorCurent() {
  const res = await fetch('/api/utilizatori/me', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}` // Trimite token-ul pentru autentificare
    }
  });
  if (!res.ok) throw new Error('Eroare la obținerea utilizatorului curent');
  return await res.json(); // Returnează informațiile utilizatorului curent
}