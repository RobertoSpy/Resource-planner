

export async function adaugaArticol(articol) {
  const res = await fetch('/api/articole', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(articol)
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data.error || 'Eroare la adăugarea articolului';
    throw new Error(msg);
  }

  return await res.json();
}


export async function deleteArticol1(id) {
  const response = await fetch(`/api/articole/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Eroare la ștergerea articolului');
  }
  return response.text();
}

export async function updateArticol(id, articol) {
  const res = await fetch(`/api/articole/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(articol)
  });
  if (!res.ok) throw new Error('Eroare la modificarea articolului');
  return await res.json();
}
