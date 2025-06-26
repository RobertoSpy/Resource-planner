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

CREATE TABLE IF NOT EXISTS notificare (
    id SERIAL PRIMARY KEY,
    articol_id INTEGER NOT NULL REFERENCES articol(id) ON DELETE CASCADE,
    mesaj TEXT NOT NULL,
    data_notificare TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trimis BOOLEAN DEFAULT FALSE
);



CREATE OR REPLACE FUNCTION public.verifica_stocuri(prag integer DEFAULT 5)         
  RETURNS TABLE(id integer, nume character varying, cantitate integer, pret numeric)
  LANGUAGE plpgsql                                                                  
 AS $function$                                                                      
 BEGIN                                                                              
     RETURN QUERY                                                                   
     SELECT articol.id, articol.nume, articol.cantitate, articol.pret               
     FROM articol                                                                   
     WHERE articol.cantitate < prag;                                                
 END;                                                                               
 $function$;


 CREATE OR REPLACE FUNCTION public.trigger_notificare_stoc()                                 
  RETURNS trigger                                                                           
  LANGUAGE plpgsql                                                                           
 AS $function$                                                                               
 BEGIN                                                                                       
     IF NEW.cantitate < 3 THEN                                                               
         -- Verifică dacă există deja o notificare pentru acest articol, indiferent de trimis
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
 $function$;   



CREATE TRIGGER trg_notificare_stoc
AFTER INSERT OR UPDATE ON articol
FOR EACH ROW
EXECUTE FUNCTION trigger_notificare_stoc();


 CREATE OR REPLACE FUNCTION public.trigger_verifica_dublura_articol()
  RETURNS trigger                                                    
  LANGUAGE plpgsql                                                   
 AS $function$                                                       
 BEGIN                                                              
     IF EXISTS (                                                     
         SELECT 1 FROM articol                                       
         WHERE nume = NEW.nume AND categorie_id = NEW.categorie_id   
     ) THEN                                                          
         RAISE EXCEPTION 'Articol duplicat!';                        
     END IF;                                                         
     RETURN NEW;                                                     
 END;                                                                
 $function$;

CREATE TRIGGER trg_dublura_articol
BEFORE INSERT ON articol
FOR EACH ROW
EXECUTE FUNCTION trigger_verifica_dublura_articol();


