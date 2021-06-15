const mysql = require('mysql2');
require('dotenv').config()
const env = process.env;


const master = {
    host: env.MYSQL_MASTER_HOST,
    user: env.MYSQL_MASTER_ROOT_USER,
    pass: env.MYSQL_MASTER_ROOT_PASSWORD
}

const replications = [
    {
        user: env.MYSQL_SLAVE1_USER,
        pass: env.MYSQL_SLAVE1_PASSWORD,
        host: env.MYSQL_SLAVE1_HOST
    },
    {
        user: env.MYSQL_SLAVE2_USER,
        pass: env.MYSQL_SLAVE2_PASSWORD,
        host: env.MYSQL_SLAVE2_HOST
    }
];
const DropUserIfExists = user => { return `DROP USER IF EXISTS '${user}'@'%'` }
const CreateUserForReplica = (user, password) => { return `CREATE USER '${user}'@'%' IDENTIFIED BY '${password}';` }
const ShowUsers = () => { return `SELECT HOST, USER FROM MYSQL.USER;` }

(async () => {
    const connection = await mysql.createConnection({
        host: master.host,
        user: master.user,
        password: master.pass,
        database: env.MYSQL_DATABASE
    });

    for await (replica of replications) {
        const drop = await connection.execute(
            DropUserIfExists(replica.user)
        )
        const create = await connection.execute(
            CreateUserForReplica(replica.user, replica.pass)
        )
    }

    console.log(await connection.execute(ShowUsers()))

})().then(() => console.log('Bye!'))
