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

// Create connection pool instead of single connection
const pool = mysql.createPool({
  host: config.host,
  user: config.user,
  password: config.pass,
  database: config.dbname,
  connectionLimit: 10,
  waitForConnections: true
});

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

// Update the middleware that logs requests
app.use((req, res, next) => {
  const requestStartTime = new Date();
  const formattedStartTime = requestStartTime.toISOString();
  
  // Save the original end method to hook into it
  const originalEnd = res.end;
  
  // Override the end method to log after response is sent
  res.end = function() {
    const responseEndTime = new Date();
    const duration = responseEndTime.getTime() - requestStartTime.getTime();
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Format log output with better readability
    console.log('\n' + '-'.repeat(40));
    console.log(`[${formattedStartTime}]`);
    console.log(`${req.method} ${req.originalUrl}`);
    console.log(`Status: ${res.statusCode} | Duration: ${duration}ms`);
    
    // Only print body data for POST/PUT requests
    if ((req.method === 'POST' || req.method === 'PUT') && req.body && Object.keys(req.body).length > 0) {
      try {
        console.log('Body:');
        console.log(JSON.stringify(req.body, null, 2)); // Pretty print
      } catch (e) {
        console.log('Body: [Circular structure]');
      }
    }
    console.log('-'.repeat(40));
    
    // Call the original end method
    return originalEnd.apply(this, arguments);
  };
  
  next();
});

// Add this after other middleware configurations
app.use('/uploads/avatars', express.static(path.join(__dirname, '../frontend/src/assets/avatars')))

// Test connection function with reconnection logic
const testConnection = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
          console.error('Database connection lost. Attempting to reconnect...');
          // Force pool to get a new connection
          pool.end(() => {
            pool.getConnection((err, connection) => {
              if (err) {
                reject(new Error('MySQL server is not running. Please start XAMPP MySQL service.'));
              } else {
                connection.release();
                resolve();
              }
            });
          });
        } else {
          reject(err);
        }
      } else {
        connection.release();
        resolve();
      }
    });
  });
};

// Helper function for async route handling
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// Connect to database
pool.getConnection(function (err, connection) {
  if (err) {
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection failed: MySQL server is not running.')
    } else {
      console.error('Database connection error:', err.message)
    }
  } else {
    console.log('Connected to the database!')
    connection.release();
  }
})

// Routes
app.use('/api', require('./routes')(pool, asyncHandler))
// Update this line to pass the connection to portfolio router
app.use('/api/portfolio', require('./routes/portfolio')(pool, asyncHandler))

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

  pool.query(query, [`%${searchQuery}%`, `%${searchQuery}%`], (err, results) => {
    if (err) {
      console.error('Search error:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

// Add reconnection endpoint
app.post('/api/reconnect', async (req, res) => {
  try {
    await testConnection();
    res.json({ success: true, message: 'Database connection restored' });
  } catch (error) {
    res.status(503).json({
      error: 'Database connection error',
      message: error.message
    });
  }
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
