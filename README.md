# Resource Planner: Raport de proiect

**Autori:** RobertoSpy,CoceaIustin 

---

## 1. Introducere

Resource Planner este o aplicație Web pentru gestiunea și monitorizarea stocurilor de produse, dedicată companiilor mici și mijlocii. Oferă funcționalități de administrare a articolelor, categoriilor, utilizatorilor, precum și notificări automate la stoc redus.

---

## 2. Cerințe funcționale

- Autentificare pe bază de email/parolă, roluri (administrator/vânzător)
- CRUD articole și categorii
- CRUD utilizatori (doar administrator)
- Notificări automate prin email la stoc redus
- Export PDF statistici, import CSV stocuri
- Dashboard cu produse ieftine și aproape epuizate

---

## 3. Cerințe non-funcționale

- Aplicație Web responsive (HTML5, CSS3)
- Securitate: JWT, parole hash-uite
- Portabilitate: Docker, baze de date SQL standard
- Licență liberă pentru cod și conținut (MIT)

---

## 4. Arhitectura sistemului

![Arhitectură sistem Resource Planner](context.png)  
![Arhitectură sistem Resource Planner](container.png) 
![Arhitectură sistem Resource Planner](component.png) 
*Figura 1. Diagrama arhitecturii de ansamblu (model C4 - context & containere)*

Aplicația are o arhitectură tipică client-server: frontend SPA (JS/HTML/CSS), backend Node.js (REST API), bază de date PostgreSQL, email pentru notificări. Backend-ul expune endpointuri REST documentate OpenAPI.

---

## 5. Modelarea datelor

- **articol**: id, nume, cantitate, pret, categorie_id, ultima_notificare
- **categorie**: id, nume
- **utilizator**: id, email, nume, parola (hash), rol
- **notificare**: id, articol_id, mesaj, trimis, data_notificare

Datele pot fi importate rapid via CSV.

---

## 6. Design UI

Interfața este responsive, minimalistă.

---

## 7. Flux de utilizare

Utilizatorul se autentifică, accesează dashboard-ul, administrează produse/categorii, primește notificări la stoc redus, poate exporta rapoarte în PDF.

---

## 8. Etapele dezvoltării

- Prototipare UI & modelare date
- Implementare frontend SPA
- Implementare backend REST & notificări
- Testare, populare cu date de test
- Documentație OpenAPI și raport

---

## 9. Concluzii

Resource Planner oferă o soluție completă, extensibilă și ușor de folosit pentru gestiunea resurselor și notificarea automată privind stocurile.
