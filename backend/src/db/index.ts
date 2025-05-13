import mysql, { Pool } from 'mysql2/promise';
import fs from 'fs';
import ini from 'ini';
import path from 'path';

// Read database configuration from ini file
const config = ini.parse(fs.readFileSync(path.join(__dirname, '../../db/db_config.ini'), 'utf-8'));

// Create a connection pool
const pool: Pool = mysql.createPool({
  host: config.host,
  user: config.user,
  password: config.pass,
  database: config.dbname,
  connectionLimit: 10,
  waitForConnections: true
});

export default pool; 