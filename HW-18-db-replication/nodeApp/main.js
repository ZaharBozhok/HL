const mysql = require('mysql2/promise');
require('dotenv').config()
const env = process.env;
const tui = require('./tui.js');

const master = {
    host: env.MYSQL_MASTER_HOST,
    user: env.MYSQL_MASTER_USER,
    pass: env.MYSQL_MASTER_PASSWORD
};

const slave1 = {
    user: env.MYSQL_SLAVE1_USER,
    pass: env.MYSQL_SLAVE1_PASSWORD,
    host: env.MYSQL_SLAVE1_HOST,
    rootUser: env.MYSQL_SLAVE1_ROOT_USER,
    rootPass: env.MYSQL_SLAVE1_ROOT_PASS
}

const slave2 = {
    user: env.MYSQL_SLAVE2_USER,
    pass: env.MYSQL_SLAVE2_PASSWORD,
    host: env.MYSQL_SLAVE2_HOST,
    rootUser: env.MYSQL_SLAVE2_ROOT_USER,
    rootPass: env.MYSQL_SLAVE2_ROOT_PASS
}

const DropUserIfExists = user => { return `DROP USER IF EXISTS '${user}'@'%'` }
const CreateUserForReplica = (user, password) => { return `CREATE USER '${user}'@'%' IDENTIFIED BY '${password}';` }
const ShowUsers = () => { return `SELECT HOST, USER FROM MYSQL.USER;` }
const GrantReplicationFor = (user) => { return `GRANT REPLICATION SLAVE ON *.* TO '${user}'@'%';` }
const FlushPrivileges = () => { return `FLUSH PRIVILEGES;` }
const ShowMasterStatus = () => { return `SHOW MASTER STATUS;` }
const ChangeMaster = (masterHost, masterUser, masterPass, masterLogFile, masterLogPos) => {
    return `CHANGE MASTER TO MASTER_HOST = '${masterHost}',
MASTER_USER = '${masterUser}',
MASTER_PASSWORD = '${masterPass}',
MASTER_LOG_FILE = '${masterLogFile}',
MASTER_LOG_POS = ${masterLogPos};`;
}
const StartReplica = () => { return "START REPLICA;" };
const StopReplica = () => { return "STOP REPLICA;" }
const ShowReplicaStatus = () => { return "SHOW REPLICA STATUS;" }
const CreateBooksTable = () => {
    return "CREATE TABLE IF NOT EXISTS `books`.`books`( `id` INT NOT NULL AUTO_INCREMENT , `name` TEXT NOT NULL , `author` TEXT NOT NULL , `year` INT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;";
}
const DropTableBooks = () => {
    return "DROP TABLE IF EXISTS `books`.`book`;"
}
const ShowTables = () => { return "SHOW TABLES;"; }
const ShowBooksTable = () => { return "SELECT * FROM books;" }
const GrantPrivilegesToBooksDb = (user) => { return `GRANT ALL PRIVILEGES ON books.* TO '${user}'@'%';`; }
const InsertIntoBooks = (name, author, year) => {
    return `INSERT INTO \`books\`(\`name\`, \`author\`, \`year\`) VALUES ('${name}','${author}','${year}');`
}
const DropYearColumn = () => { return `ALTER TABLE books DROP COLUMN year;` }
const DropNameColumn = () => { return `ALTER TABLE books DROP COLUMN name;` }

const GetConnection = async (host, user, pass, db) => {
    return await mysql.createConnection({
        host: host,
        user: user,
        password: pass,
        database: db
    });
}

(async () => {
    let connection = null
    const cm = async () => {
        connection = await GetConnection(master.host, master.user, master.pass, env.MYSQL_DATABASE)
        console.log('Connected to master')
    }
    const cs1 = async () => {
        connection = await GetConnection(slave1.host, slave1.user, slave1.pass, env.MYSQL_DATABASE)
        console.log('Connected to slave1')
    }
    const cs2 = async () => {
        connection = await GetConnection(slave2.host, slave2.user, slave2.pass, env.MYSQL_DATABASE)
        console.log('Connected to slave2')
    }
    const rs1 = async () => {
        await cm();
        const user = slave1.user;
        const pass = slave1.pass;
        await connection.execute(DropUserIfExists(user));
        await connection.execute(CreateUserForReplica(user, pass));
        await connection.execute(GrantReplicationFor(user));
        await connection.execute(FlushPrivileges());
        const log = await sms();
        connection = await GetConnection(slave1.host, slave1.rootUser, slave1.rootPass, env.MYSQL_DATABASE)
        await connection.execute(GrantPrivilegesToBooksDb(slave1.user));
        await connection.execute(StopReplica());
        await connection.execute(ChangeMaster(master.host, slave1.user, slave1.pass, log.file, log.pos));
        await connection.execute(StartReplica());
    }
    const rs2 = async () => {
        await cm();
        const user = slave2.user;
        const pass = slave2.pass;
        await connection.execute(DropUserIfExists(user));
        await connection.execute(CreateUserForReplica(user, pass));
        await connection.execute(GrantReplicationFor(user));
        await connection.execute(FlushPrivileges());
        const log = await sms();
        connection = await GetConnection(slave2.host, slave2.rootUser, slave2.rootPass, env.MYSQL_DATABASE)
        await connection.execute(GrantPrivilegesToBooksDb(slave2.user));
        await connection.execute(StopReplica());
        await connection.execute(ChangeMaster(master.host, slave2.user, slave2.pass, log.file, log.pos));
        await connection.execute(StartReplica());
    }
    const su = async () => {
        const [rows, fields] = await connection.execute(ShowUsers());
        console.log(rows)
    }
    const sms = async () => {
        const [rows, fields] = await connection.execute(ShowMasterStatus());
        const masterStatus = {
            file: rows[0].File,
            pos: rows[0].Position,
            binlogdb: rows[0].Binlog_Do_DB
        };
        console.log(masterStatus);
        return masterStatus;
    }
    const srs = async () => {
        const [rows, fields] = await connection.execute(ShowReplicaStatus());

        console.log({
            Replica_IO_State: rows[0].Replica_IO_State,
            Source_Host: rows[0].Source_Host,
            Source_User: rows[0].Source_User,
            Source_Log_File: rows[0].Source_Log_File,
            Read_Source_Log_Pos: rows[0].Read_Source_Log_Pos,
            Relay_Log_File: rows[0].Relay_Log_File,
            Relay_Log_Pos: rows[0].Relay_Log_Pos,
            Relay_Source_Log_File: rows[0].Relay_Source_Log_File,
            Last_IO_Errno: rows[0].Last_IO_Errno,
            Last_IO_Error: rows[0].Last_IO_Error,
            Last_SQL_Errno: rows[0].Last_SQL_Errno,
            Last_SQL_Error: rows[0].Last_SQL_Error
        });
    }
    const ctb = async () => {
        await connection.execute(DropTableBooks());
        await connection.execute(CreateBooksTable());
    }
    const sb = async () => {
        const [rows] = await connection.execute(ShowTables());
        console.log(rows)
    }
    const stb = async () => {
        const [rows] = await connection.execute(ShowBooksTable());
        console.log(rows)
    }
    const ibm = async () => {
        await connection.execute(InsertIntoBooks("Harry Potter", "Joanne Rowling", "1234"))
    }
    const ibmM = async () => {
        connections = []
        for (let index = 0; index < 50; index++) {
            connections.push(await GetConnection(master.host, master.user, master.pass, env.MYSQL_DATABASE));
        }
        for (let outer = 0; outer < 100; outer++) {
            promises = []
            for (let index = 0; index < connections.length; index++) {
                promises.push(connections[index].execute(InsertIntoBooks("Harry Potter", "Joanne Rowling", "1234")));
            }
            const awaitAll = async (promises) => {
                return new Promise((resolve, reject) => {
                    Promise.all(promises)
                        .then(() => {
                            resolve()
                        })
                        .catch((err) => {
                            reject(err)
                        })
                })
            }
            await awaitAll(promises)
        }
    }
    const dcy = async () => {
        await connection.execute(DropYearColumn())
    }
    const dcn = async () => {
        await connection.execute(DropNameColumn())
    }
    const t = new tui({
        cm: {
            description: "Connect to master",
            callback: cm
        },
        cs1: {
            description: "Connect to slave1",
            callback: cs1
        },
        cs2: {
            description: "Connect to slave2",
            callback: cs2
        },
        rs1: {
            description: "Configure replication for slave1",
            callback: rs1
        },
        rs2: {
            description: "Configure replication for slave2",
            callback: rs2
        },
        su: {
            description: "Show users",
            callback: su
        },
        sms: {
            description: "Show master status",
            callback: sms
        },
        srs: {
            description: "Show replicat status",
            callback: srs
        },
        ctb: {
            description: "Create table books [id, name, author, year]",
            callback: ctb
        },
        st: {
            description: "Show tables",
            callback: sb
        },
        stb: {
            description: "Show table `books`",
            callback: stb
        },
        ibm: {
            description: "Insert data into books table on master",
            callback: ibm
        },
        ibmM: {
            description: "Inserting data into books table on master 100 000",
            callback: ibmM
        },
        dcy: {
            description: "Drop year column from books",
            callback: dcy
        },
        dcn: {
            description: "Drop name column from books",
            callback: dcn
        }
    }, (err) => {
        console.error(err)
    })
    const args = process.argv.slice(2);
    for (let index = 0; index < args.length; index++) {
        console.log(args[index])
        await t.CallManually(args[index]);
    }
    await t.Run()
})()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })