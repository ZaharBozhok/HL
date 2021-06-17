# PostgreSQL database sharding
## Tasks:
1. Create 3 docker containers: postgresql-b, postgresql-b1, postgresql-b2
2. Setup horizontal sharding as it’s described in this lesson
3. Insert 1 000 000 rows into books
4. Measure performance
5. Do the same without sharding
6. Compare performance


## 1. Create 3 docker containers
Docker containers are described in [docker-compose.yml]

[docker-compose.yml]: <https://github.com/ZaharBozhok/HL/blob/main/HW-19-db-sharding/docker-compose.yml>

## 2. Setup horizontal sharding 
To configure horizontal sharding you first have to run all instances 
```sh
docker-compose up -d
```
And then you can do all further actions in pgadmin on localhost in your browser.
Connect to `postgres-b1`, and run following script 
`sql-scripts/horizontal-sharding/init-shard1.sql`.
Connect to `postgres-b2`, and run following script:
`sql-scripts/horizontal-sharding/init-shard2.sql`.
And finally connect to `postgres-b`, and run following script
`sql-scripts/horizontal-sharding/horizontal-sharding.sql`.
## 3. Insert 1 000 000 rows into books
To test insertion time with horizontal sharding run:
`sql-scripts/tests/test-horizontal-sharding.sql`.
## 4. Measure performance
Pgadmin automatically shows how much time took any operation
## 5. Do the same without sharding
To test insertion time without sharding run:
`sql-scripts/tests/test-no-sharding.sql`
## 6. Compare performance
On my Macbook air m1 2020 insertion of 1.000.000 rows with horizontal sharding took about 4 minutes, while insertion without sharding about 3 seconds. But it seems like it isn't honest test because docker adds to much impact on interacting with filesystem.