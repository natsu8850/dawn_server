const Pool = require('pg').Pool;

const pool = new Pool({
    user: "postgres",
    password: "zahid2k3",
    host: "localhost",
    port: 5432,
    database: "library"
})

module.exports = pool;