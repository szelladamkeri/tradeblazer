const mysql = require('mysql');
const fs = require('fs');
const ini = require('ini');

const config = ini.parse(fs.readFileSync('./db/db_config.ini', 'utf-8'));

const pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.pass,
    database: config.dbname,
    connectionLimit: 10,
    waitForConnections: true
});

module.exports = { pool };
