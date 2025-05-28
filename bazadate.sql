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
    CONSTRAINT fk_categorie FOREIGN KEY (categorie_id) REFERENCES categorie(id)
);

CREATE TABLE utilizator (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nume VARCHAR(100) NOT NULL,
    parola VARCHAR(255) NOT NULL
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

-- Populare articole exemplu
INSERT INTO articol (nume, cantitate, categorie_id) VALUES
('Bec incandescent', 15, 1),
('Lemn pentru foc', 5, 1),
('Toner imprimanta', 2, 2),
('Crema hidratanta', 20, 4);

-- Populare utilizatori exemplu
INSERT INTO utilizator (email, nume, parola) VALUES
('ion.popescu@example.com', 'Ion Popescu', 'parola123'),
('maria.ionescu@example.com', 'Maria Ionescu', 'parola456');

-- Functie PL/pgSQL care returneaza articole cu cantitate sub un prag
CREATE OR REPLACE FUNCTION verifica_stocuri(prag INTEGER DEFAULT 5)
RETURNS TABLE(id INTEGER, nume VARCHAR, cantitate INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT id, nume, cantitate FROM articol WHERE cantitate < COALESCE(prag, 5);
END;
$$ LANGUAGE plpgsql;

-- Trigger function care insereaza o notificare automat cand stocul scade sub 3
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

-- Trigger care apeleaza functia la update pe tabela articol
CREATE TRIGGER trg_notificare_stoc
AFTER UPDATE OF cantitate ON articol
FOR EACH ROW
EXECUTE FUNCTION trigger_notificare_stoc();

-- Al doilea trigger - exemplu: la inserarea unei notificari se scrie in consola (pentru exemplu)
CREATE OR REPLACE FUNCTION trigger_log_notificare()
RETURNS TRIGGER AS $$
BEGIN
    RAISE NOTICE 'Notificare inserata pentru articol_id=%', NEW.articol_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_notificare
AFTER INSERT ON notificare
FOR EACH ROW
EXECUTE FUNCTION trigger_log_notificare();

-- Trigger: la adăugare articol, verifică să nu fie duplicat
CREATE OR REPLACE FUNCTION trigger_verifica_dublura_articol() RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM articol
        WHERE nume = NEW.nume AND categorie_id = NEW.categorie_id
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