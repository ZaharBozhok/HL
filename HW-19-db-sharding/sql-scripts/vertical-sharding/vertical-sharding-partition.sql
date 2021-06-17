DROP TABLE IF EXISTS measurement CASCADE;
CREATE TABLE measurement (
    city_id         int not null,
    logdate         date not null,
    peaktemp        int,
    unitsales       int
) PARTITION BY RANGE (logdate);

DROP TABLE IF EXISTS measurement_y2006m02;
CREATE TABLE measurement_y2006m02 PARTITION OF measurement
    FOR VALUES FROM ('2006-02-01') TO ('2006-03-01');

DROP TABLE IF EXISTS measurement_y2006m03;
CREATE TABLE measurement_y2006m03 PARTITION OF measurement
    FOR VALUES FROM ('2006-03-01') TO ('2006-04-01');

CREATE INDEX measurement_logdate ON measurement (logdate);
CREATE INDEX measurement_y2006m02_logdate ON measurement_y2006m02 (logdate);
CREATE INDEX measurement_y2006m03_logdate ON measurement_y2006m03 (logdate);

INSERT INTO measurement(
	city_id, logdate, peaktemp, unitsales)
	VALUES (1, '2006-02-02', 1, 1);
INSERT INTO measurement(
	city_id, logdate, peaktemp, unitsales)
	VALUES (1, '2006-03-02', 1, 1);
	
SELECT * FROM measurement;