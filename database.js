const mysql = require('mysql2/promise');
const config = require('./config.json'); // Import database credentials

// Create and export a database connection pool
const db = mysql.createPool({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name,
});

module.exports = db;
