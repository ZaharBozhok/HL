-- Creating table books on shard1 for WHERE category_id == 1
DROP TABLE IF EXISTS books_cat1 CASCADE;
CREATE TABLE books_cat1 (
	id bigint not null,
	category_id  int not null,
	CONSTRAINT category_id_check CHECK ( category_id = 1 ),
	author character varying not null,
	title character varying not null,
	year int not null
);
CREATE INDEX books_category_id_idx ON books_cat1 USING btree(category_id);