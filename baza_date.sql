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
    pret NUMERIC(10, 2),
    CONSTRAINT fk_categorie FOREIGN KEY (categorie_id) REFERENCES categorie(id)
);

CREATE TABLE utilizator (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  nume VARCHAR(255) NOT NULL,
  parola VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL
);


CREATE TABLE notificare (
    id SERIAL PRIMARY KEY,
    articol_id INTEGER NOT NULL,
    mesaj TEXT NOT NULL,
    trimis BOOLEAN default FALSE,
    data_notificare TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_articol FOREIGN KEY (articol_id) REFERENCES articol(id),
 
);


CREATE OR REPLACE FUNCTION verifica_stocuri(prag INTEGER DEFAULT 5)
RETURNS TABLE(id INTEGER, nume VARCHAR, cantitate INTEGER, pret NUMERIC) AS $$
BEGIN
    RETURN QUERY
    SELECT articol.id, articol.nume, articol.cantitate, articol.pret
    FROM articol
    WHERE articol.cantitate < prag;
END;
$$ LANGUAGE plpgsql;





CREATE OR REPLACE FUNCTION trigger_notificare_stoc()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.cantitate < 3 THEN
       
        IF NOT EXISTS (
            SELECT 1 FROM notificare
            WHERE articol_id = NEW.id
        ) THEN
            INSERT INTO notificare (articol_id, mesaj, trimis)
            VALUES (
                NEW.id,
                'Stoc scăzut pentru articolul ' || NEW.nume,
                FALSE
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notificare_stoc ON articol;

CREATE TRIGGER trg_notificare_stoc
AFTER INSERT OR UPDATE ON articol
FOR EACH ROW
EXECUTE FUNCTION trigger_notificare_stoc();



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




CREATE OR REPLACE FUNCTION preconizeaza_top_angajat_saptamanal()
RETURNS TABLE (
  angajat_id INTEGER,
  total_completari INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    aa.angajat_id,
    COUNT(*) AS total_completari
  FROM actiuni_angajati aa
  JOIN articol a ON a.id = aa.articol_id
  WHERE aa.timestamp >= NOW() - INTERVAL '7 days'
    AND a.cantitate >= 3
  GROUP BY aa.angajat_id
  ORDER BY total_completari DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
