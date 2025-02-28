const express = require('express')
const cors = require('cors')
const mysql = require('mysql')
const fs = require('fs')
const ini = require('ini')
const path = require('path')
const app = express()
const port = 3000

// Read the ini file
const config = ini.parse(fs.readFileSync('./db/db_config.ini', 'utf-8'))

// Create a MySQL connection
const con = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.pass,
  database: config.dbname,
})

// CORS and middleware configuration
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
)

app.use(express.json())
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}:`, req.body)
  next()
})

// Add this after other middleware configurations
app.use('/uploads/avatars', express.static(path.join(__dirname, '../frontend/src/assets/avatars')))

// Database connection test function
const testConnection = () => {
  return new Promise((resolve, reject) => {
    con.ping((err) => {
      if (err) {
        if (err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
          reject(new Error('MySQL server is not running. Please start XAMPP MySQL service.'))
        } else {
          reject(err)
        }
      }
      resolve()
    })
  })
}

// Helper function for async route handling
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// Connect to database
con.connect(function (err) {
  if (err) {
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection failed: MySQL server is not running.')
    } else {
      console.error('Database connection error:', err.message)
    }
  } else {
    console.log('Connected to the database!')
  }
})

// Routes
app.use('/api', require('./routes')(con, asyncHandler))
// Update this line to pass the connection to portfolio router
app.use('/api/portfolio', require('./routes/portfolio')(con, asyncHandler))

// Add API endpoint for search
app.get('/api/assets/search', (req, res) => {
  const searchQuery = req.query.q?.toLowerCase();
  
  if (!searchQuery) {
    return res.json([]);
  }

  const query = `
    SELECT id, name, symbol, type, price
    FROM assets
    WHERE LOWER(name) LIKE ? OR LOWER(symbol) LIKE ?
    LIMIT 10
  `;

  con.query(query, [`%${searchQuery}%`, `%${searchQuery}%`], (err, results) => {
    if (err) {
      console.error('Search error:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  if (err.code === 'ECONNREFUSED') {
    res.status(503).json({
      error: 'Database connection error',
      message: 'MySQL server is not running. Please start XAMPP MySQL service.',
    })
  } else {
    res.status(500).json({
      error: 'Server error',
      message: err.message || 'An unexpected error occurred',
    })
  }
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`)
})
