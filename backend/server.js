const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const fs = require('fs');
const ini = require('ini');
const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

// Add middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Test database connection before query
const testConnection = () => {
    return new Promise((resolve, reject) => {
        con.ping((err) => {
            if (err) reject(err);
            resolve();
        });
    });
};

// Updated API route with proper query and validation
app.get('/api/data', async (req, res) => {
    try {
        await testConnection();
        con.query('SELECT * FROM assets', function (err, result) {
            if (err) {
                console.error('Database query error:', err);
                return res.status(500).json({ 
                    error: 'Database query error', 
                    message: err.message 
                });
            }
            
            if (!result || result.length === 0) {
                return res.status(404).json({
                    error: 'No data found',
                    message: 'The assets table is empty'
                });
            }

            res.json(result);
        });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ 
            error: 'Database connection error', 
            message: error.message 
        });
    }
});

// Add a health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Server error', 
        message: err.message 
    });
});

app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
});
