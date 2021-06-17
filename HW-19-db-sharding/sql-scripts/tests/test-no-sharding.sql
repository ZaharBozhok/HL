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

-- Insert 1.000.000 -- 3 sec
do
$$
declare 
  i record;
begin
  for i in 1..500000 loop
    INSERT into books 
	VALUES (i,1, 'Author', 'Title', 2000),
	(i,2, 'Author', 'Title', 2000);
  end loop;
end;
$$
;