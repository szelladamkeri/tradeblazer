const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const fs = require('fs');
const ini = require('ini');
const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

// Read the ini file
const config = ini.parse(fs.readFileSync('./db/db_config.ini', 'utf-8'));

// Create a MySQL connection
const con = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.pass,
    database: config.dbname
});

con.connect(function(err) {
    if (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1);
    }
    console.log("Connected to the database!");
});

// Define API route
app.get('/api/data', (req, res) => {
    con.query('SELECT * FROM users', function (err, result) {
        if (err) {
            res.status(500).json({ error: 'Database query error' });
            return;
        }
        res.status(200).json(result);
    });
});

app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
});
