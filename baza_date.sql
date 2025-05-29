-- Creare tabele
CREATE TABLE categorie (
    id SERIAL PRIMARY KEY,
    nume VARCHAR(100) UNIQUE NOT NULL
);



CREATE TABLE articol (
    id SERIAL PRIMARY KEY,
    nume VARCHAR(150) NOT NULL,
    cantitate INTEGER NOT NULL CHECK (cantitate >= 0),
    categorie_id INTEGER NOT NULL,
    pret NUMBER(10, 2),
    CONSTRAINT fk_categorie FOREIGN KEY (categorie_id) REFERENCES categorie(id)
);

CREATE TABLE stoc (
    id_stoc SERIAL PRIMARY KEY,
    id_articol INTEGER REFERENCES articol(id_articol),
    id_utilizator INTEGER REFERENCES utilizator(id_utilizator),
    cantitate INTEGER NOT NULL,
    prag_alerta INTEGER NOT NULL
);

CREATE TABLE utilizator (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nume VARCHAR(100) NOT NULL
);


CREATE TABLE notificare (
    id SERIAL PRIMARY KEY,
    articol_id INTEGER NOT NULL,
    utilizator_id INTEGER NOT NULL,
    mesaj TEXT NOT NULL,
    data_notificare TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_articol FOREIGN KEY (articol_id) REFERENCES articol(id),
    CONSTRAINT fk_utilizator FOREIGN KEY (utilizator_id) REFERENCES utilizator(id)
);


-- Populare categorii
INSERT INTO categorie (nume) VALUES
('Consumabile'),
('Piese de schimb'),
('Medicamente'),
('Cosmetice');


INSERT INTO articol (nume, cantitate, categorie_id, pret) VALUES
('Bec incandescent', 15, 1, 10),
('Lemn pentru foc', 5, 1, 20),
('Toner imprimanta', 2, 2, 120),
('Crema hidratanta', 20, 4, 5);


INSERT INTO utilizator (email, nume) VALUES
('ion.popescu@example.com', 'Ion Popescu'),
('maria.ionescu@example.com', 'Maria Ionescu');

INSERT INTO stoc(id_articol, id_utilizator, cantitate, prag_alerta) VALUES
(1, 1, 3, 5),
(2, 2, 1, 2),
(3, 1, 10, 3);

-- Functie PL/pgSQL care returneaza articole cu cantitate sub un prag
CREATE OR REPLACE FUNCTION verifica_stocuri(prag INTEGER DEFAULT 5)
RETURNS TABLE(id INTEGER, nume VARCHAR, cantitate INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT id, nume, cantitate FROM articol WHERE cantitate < prag;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION trigger_notificare_stoc()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.cantitate < 3 THEN
        INSERT INTO notificare (articol_id, utilizator_id, mesaj)
        VALUES (NEW.id, 1, 'Stoc scazut pentru articolul ' || NEW.nume);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notificare_stoc
AFTER INSERT OR UPDATE ON articol
FOR EACH ROW
EXECUTE FUNCTION trigger_notificare_stoc();


-- Trigger: la adăugare articol, verifică să nu fie duplicat
CREATE OR REPLACE FUNCTION trigger_verifica_dublura_articol() RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM articol
        WHERE denumire = NEW.denumire AND id_categorie = NEW.id_categorie
    ) THEN
        RAISE EXCEPTION 'Articol duplicat!';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_dublura_articol
BEFORE INSERT ON articol
FOR EACH ROW
EXECUTE FUNCTION trigger_verifica_dublura_articol();