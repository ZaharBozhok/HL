-- Creating books table on master server
DROP TABLE IF EXISTS books CASCADE;
CREATE TABLE books (
	id bigint not null,
	category_id int not null,
	author character varying not null,
	title character varying not null,
	year int not null
);
CREATE INDEX books_category_id_idx ON books USING btree(category_id);

-- Configuring shards
DROP EXTENSION IF EXISTS postgres_fdw CASCADE;
CREATE EXTENSION postgres_fdw;

CREATE RULE books_insert AS ON INSERT TO books
DO INSTEAD NOTHING;
CREATE RULE books_update AS ON UPDATE TO books
DO INSTEAD NOTHING;
CREATE RULE books_delete AS ON DELETE TO books
DO INSTEAD NOTHING;
  -- Shard1 configuration "postgres_b1"
  CREATE SERVER postgres_b1
        FOREIGN DATA WRAPPER postgres_fdw
        OPTIONS (host 'postgres-b1', port '5432', dbname 'postgres');

  CREATE USER MAPPING FOR postgres
        SERVER postgres_b1
        OPTIONS (user 'postgres', password 'pass2021');

  IMPORT FOREIGN SCHEMA public LIMIT TO (books_cat1) 
  FROM SERVER postgres_b1 INTO public;
    -- Configure redirect rule from local to "postgres_b1"
    CREATE RULE books_insert_cat1 AS
	ON INSERT TO books 
	WHERE ( category_id = 1 )
	DO INSTEAD
    	INSERT INTO books_cat1 VALUES (NEW.*);
  -- Shard2 configuration "postgres_b2"
  CREATE SERVER postgres_b2
        FOREIGN DATA WRAPPER postgres_fdw
        OPTIONS (host 'postgres-b2', port '5432', dbname 'postgres');

  CREATE USER MAPPING FOR postgres
        SERVER postgres_b2
        OPTIONS (user 'postgres', password 'pass2021');

  IMPORT FOREIGN SCHEMA public LIMIT TO (books_cat2) 
  FROM SERVER postgres_b2 INTO public;
    -- Configure redirect rule from local to "postgres_b2"
    CREATE RULE books_insert_cat2 AS
	ON INSERT TO books 
	WHERE ( category_id = 2 )
	DO INSTEAD
    	INSERT INTO books_cat2 VALUES (NEW.*);
-- "Gathering" view for all tables
CREATE VIEW books_v AS
	SELECT * FROM books_cat1
		UNION ALL
	SELECT * FROM books_cat2