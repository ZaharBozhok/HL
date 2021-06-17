DROP TABLE IF EXISTS measurement CASCADE;
CREATE TABLE measurement (
    city_id         int not null,
    logdate         date not null,
    peaktemp        int,
    unitsales       int
);

DROP TABLE IF EXISTS measurement_y2006m02;
CREATE TABLE measurement_y2006m02 (
    CHECK ( logdate >= DATE '2006-02-01' AND logdate < DATE '2006-03-01' )
) INHERITS (measurement);

DROP TABLE IF EXISTS measurement_y2006m03;
CREATE TABLE measurement_y2006m03 (
    CHECK ( logdate >= DATE '2006-03-01' AND logdate < DATE '2006-04-01' )
) INHERITS (measurement);

CREATE INDEX measurement_logdate ON measurement (logdate);
CREATE INDEX measurement_y2006m02_logdate ON measurement_y2006m02 (logdate);
CREATE INDEX measurement_y2006m03_logdate ON measurement_y2006m03 (logdate);

CREATE RULE measurement_insert_y2006m02 AS
ON INSERT TO measurement WHERE
    ( logdate >= DATE '2006-02-01' AND logdate < DATE '2006-03-01' )
DO INSTEAD
    INSERT INTO measurement_y2006m02 VALUES (NEW.*);

CREATE RULE measurement_insert_y2006m03 AS
ON INSERT TO measurement WHERE
    ( logdate >= DATE '2006-03-01' AND logdate < DATE '2006-04-01' )
DO INSTEAD
    INSERT INTO measurement_y2006m03 VALUES (NEW.*);

CREATE RULE measurement_insert AS 
ON INSERT TO measurement
DO INSTEAD NOTHING;

INSERT INTO measurement(
	city_id, logdate, peaktemp, unitsales)
	VALUES (1, '2006-02-02', 1, 1);
INSERT INTO measurement(
	city_id, logdate, peaktemp, unitsales)
	VALUES (1, '2006-03-02', 1, 1);
	
SELECT * FROM measurement;