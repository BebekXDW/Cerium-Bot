const mysql = require('mysql2/promise');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8')).database;

// create database connection
const pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.name,
});

// export the connection pool
module.exports = {
    pool,
    getConnection: () => pool.getConnection()
};
