const mysql = require('mysql2/promise');
const fs = require('fs');

// Read database configuration from config.json
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8')).database;

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.name,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Export the connection pool and utility function
module.exports = {
    pool,
    getConnection: () => pool.getConnection()
};
