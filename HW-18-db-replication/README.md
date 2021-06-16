# MySQL database replication
## Tasks:
1. Create 3 docker containers: mysql-m, mysql-s1, mysql-s2
2. Setup master slave replication (Master: mysql-m, Slave: mysql-s1, mysql-s2)
3. Write script that will frequently write data to database
4. Ensure, that replication is working
5. Try to turn off mysql-s1
6. Try to remove a column in  database on slave node

## 1. Create 3 docker containers
Docker containers are described in [docker-compose.yml]
Before running mysql instances run
```sh
./scripts/clean.sh
```

[docker-compose.yml]: <https://github.com/ZaharBozhok/HL/blob/main/HW-18-db-replication/docker-compose.yml>

## 2. Setup master slave replication
Start all mysql instances using following script
```sh
./scripts/run-mysql-instances.sh
```
And make sure that all instances are initialized properly (I was checking using this command `docker-compose logs -f mysql-<x>`, simply it should stop printing logs after some time saying that it is ready to handle new connections).
Then run replication configuration script :
```sh
./scripts/configure-replication.sh
```

## 3. Frequently write data to database
NodeApp has a command to create 50 connections and send 100 inserts (per connection).
To insert 5000 rows run script:
```sh
./scripts/insert-books.sh
```
And if you want to see inserted data use following scripts:
```sh
# To see rows on master
./scripts/show-books-m.sh
# To see rows on slave1
./scripts/show-books-s1.sh
# To see rows on slave2
./scripts/show-books-s2.sh
```
## 4. Check that replication is working
To ensure that replicaton is working you can either insert rows using scripts from section 3, or run `docker-compose up -d phpMyAdmin`, open  `localhost` in browser and connect to (`mysql-m`|`mysql-s1`|`mysql-s2`) and see that rows are inserted after inserting in master.
## 5. Turning off mysql-s1
To turn off mysql-s1 just run following:
```sh
docker-compose stop mysql-s1
```
And if you run it again it will download all needed data (if i'm not mistaken reading it from master's binlog). So after slave "reboot" not synced data will be replicated to the slave.
## 6. Removing a column on a slave db table
As for example following script removes column "name" from "books" table on slave1:
```sh
./scripts/drop-name-col-s1.sh
```
P.S. I tested dropping last column ("year") and it was still replicating good, but without last column. And when I dropped column in the middle of other columns (like "name") it inserted with shifting. Instead of not writing master's "name" to slave's "name" it writes to master's "name" to slave's "author".