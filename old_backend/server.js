const express = require('express')
const cors = require('cors')
const mysql = require('mysql')
const fs = require('fs')
const ini = require('ini')
const path = require('path')
// Add dotenv at the top of the file
require('dotenv').config()
const priceAlertService = require('./services/priceAlertService');
const priceUpdateService = require('./services/priceUpdateService'); // Import the new service
const { transporter, mailGenerator } = require('./config/email')
const assetsRouter = require('./routes/assets'); // Import the assets router

// Initialize Express application
const app = express()
const port = 3000

// Put this in a separate file for better organization
const alphaKey = "0W6GD6NKNOXOXN6P";

/**
 * Database Configuration
 * Reading from configuration file for security and flexibility
 */
const config = ini.parse(fs.readFileSync('./db/db_config.ini', 'utf-8'))

// Create connection pool instead of single connection for better performance
const pool = mysql.createPool({
  host: config.host,
  user: config.user,
  password: config.pass,
  database: config.dbname,
  connectionLimit: 10,
  waitForConnections: true
})

/**
 * CORS Configuration
 * Allowing frontend to communicate with backend
 */
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
)

// Parse JSON request bodies
app.use(express.json())

/**
 * Request Logging Middleware
 * Logs detailed information about each request for debugging
 */
app.use((req, res, next) => {
  const requestStartTime = new Date()
  
  // Format the time in local timezone with a cleaner format
  const formattedStartTime = requestStartTime.toLocaleString('en-US', { 
    timeZone: 'Europe/Budapest',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  // Save the original end method to hook into it
  const originalEnd = res.end
  
  // Override the end method to log after response is sent
  res.end = function() {
    const responseEndTime = new Date()
    const duration = responseEndTime.getTime() - requestStartTime.getTime()
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    
    // Clean format with CMD-compatible characters instead of emojis
    console.log(`\n>> ${formattedStartTime} | ${req.method} ${req.originalUrl}`)
    console.log(`   Status: ${res.statusCode} | Duration: ${duration}ms`)
    
    // Only print body data for POST/PUT requests
    if ((req.method === 'POST' || req.method === 'PUT') && req.body && Object.keys(req.body).length > 0) {
      try {
        console.log('Body:')
        console.log(JSON.stringify(req.body, null, 2)) // Pretty print
      } catch (e) {
        console.log('Body: [Circular structure]')
      }
    }
    
    // Call the original end method
    return originalEnd.apply(this, arguments)
  }
  
  next()
})

// Serve static files from the avatars directory
app.use('/uploads/avatars', express.static(path.join(__dirname, '../frontend/src/assets/avatars')))

/**
 * Database Connection Test
 * Tests if the connection to the database is working
 * With automatic reconnection logic
 */
const testConnection = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
          console.error('Database connection lost. Attempting to reconnect...')
          // Force pool to get a new connection
          pool.end(() => {
            pool.getConnection((err, connection) => {
              if (err) {
                reject(new Error('MySQL server is not running. Please start XAMPP MySQL service.'))
              } else {
                connection.release()
                resolve()
              }
            })
          })
        } else {
          reject(err)
        }
      } else {
        connection.release()
        resolve()
      }
    })
  })
}

/**
 * Async Handler Utility
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// Test database connection on startup
pool.getConnection(function (err, connection) {
  if (err) {
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection failed: MySQL server is not running.')
    } else {
      console.error('Database connection error:', err.message)
    }
  } else {
    console.log('Connected to the database!')
    connection.release()
  }
})

// --- Routes Configuration --- 

// Mount the assets router BEFORE specific asset-related routes
// This ensures routes like /prices and /trending defined in assets.js are registered
app.use('/api/assets', assetsRouter(pool, asyncHandler));

// Other specific routes (ensure no overlap with assetsRouter paths)
app.use('/api', require('./routes')(pool, asyncHandler)) // General routes like /diagnostics/database
app.use('/api/portfolio', require('./routes/portfolio')(pool, asyncHandler))
app.use('/api/auth', require('./routes/auth')(pool, asyncHandler));
app.use('/api/verification', require('./routes/verification')(pool, asyncHandler));
app.use('/api/transactions', require('./routes/transactions')(pool, asyncHandler));
app.use('/api/admin', require('./routes/admin')(pool, asyncHandler));
app.use('/api/user', require('./routes/user')(pool, asyncHandler));
app.use('/api/orders', require('./routes/orders')(pool, asyncHandler));
app.use('/api/watchlist', require('./routes/watchlist')(pool, asyncHandler)); // Add this line

// --- Remove potentially duplicate or conflicting route definitions below --- 

// // Add an endpoint to resend verification email (Should be in verification.js)
// app.post('/api/verification/resend', ...);

// // Asset Search API Endpoint (Should be in assets.js)
// app.get('/api/assets/search', ...);

// // Single Asset API Endpoint (Should be in assets.js)
// app.get('/api/assets/:id', ...);

// // Watchlist Endpoints (Should ideally be in a separate watchlist.js or user.js)
// app.get('/api/users/:userId/watchlist', ...);
// app.post('/api/watchlist/:assetId', ...);
// app.delete('/api/watchlist/:id', ...);
// app.get('/api/users/:userId/watchlist/check/:assetId', ...);
// app.post('/api/watchlist/:id/alert', ...);

// // Price History API Endpoint (Should be in assets.js or a dedicated price.js)
// app.get('/api/prices/:symbol', ...);

// // Database Reconnection Endpoint (Keep or move to a general route file)
// app.post('/api/reconnect', ...);

// // Add debug email endpoint (Keep or move to a general/debug route file)
// app.post('/api/debug/email', ...);

/**
 * Global Error Handling Middleware
 * Catches and formats all errors consistently
 */
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

// Start the server
const server = app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`)
})

// Start background services
priceAlertService.start();
priceUpdateService.startPeriodicFetching(); // Start fetching prices

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server and background services');
  priceAlertService.stop();
  priceUpdateService.stopPeriodicFetching(); // Stop fetching on shutdown
  server.close(() => {
    console.log('HTTP server closed');
    // Close database connection if necessary
    // db.end(); 
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server and background services');
  priceAlertService.stop();
  priceUpdateService.stopPeriodicFetching(); // Stop fetching on shutdown
  server.close(() => {
    console.log('HTTP server closed');
    // Close database connection if necessary
    // db.end();
    process.exit(0);
  });
});
