-- Should insert into foreign postgres_b1
INSERT INTO books(
	id, category_id, author, title, year)
	VALUES (1, 1, 'Cool author', 'Cool-book from `Cool Author`', 1999);
-- Should be empty, cause inserted only to postgres_b1
SELECT * FROM books;
-- Should have one row (1 from b1 and 0 from b2)
SELECT * FROM books_v;
-- Should insert into foreign postgres_b2
INSERT INTO books(
	id, category_id, author, title, year)
	VALUES (2, 2, 'Bad author', 'Bad-book from `Bad Author`', 1998);
-- Should have 2 rows (1 from b1 and 1 from b2)
SELECT * FROM books_v;
-- Should still be empty
SELECT * FROM books;
-- Insert 1.000.000 -- 3 min 59 sec
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
-- Insert 100.000 -- 23 sec
do
$$
declare 
  i record;
begin
  for i in 1..50000 loop
    INSERT into books 
	VALUES (i,1, 'Author', 'Title', 2000),
	(i,2, 'Author', 'Title', 2000);
  end loop;
end;
$$
;