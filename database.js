const mysql = require('mysql2/promise');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8')).database;

const pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.name,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

async function getConnection() {
    return pool.getConnection();
}

module.exports = { getConnection, pool };
