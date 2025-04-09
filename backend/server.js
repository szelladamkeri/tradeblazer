const express = require('express')
const cors = require('cors')
const mysql = require('mysql')
const fs = require('fs')
const ini = require('ini')
const path = require('path')
// Add dotenv at the top of the file
require('dotenv').config()
const priceAlertService = require('./services/priceAlertService');
const { transporter, mailGenerator } = require('./config/email')

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

// Routes configuration
app.use('/api', require('./routes')(pool, asyncHandler))
app.use('/api/portfolio', require('./routes/portfolio')(pool, asyncHandler))

/**
 * Single Asset API Endpoint
 * Fetches details of a specific asset by ID
 */
app.get('/api/assets/:id', asyncHandler(async (req, res) => {
  const assetId = parseInt(req.params.id)
  
  if (isNaN(assetId)) {
    return res.status(400).json({ message: 'Invalid asset ID' })
  }

  const query = `
    SELECT a.*, 
           COALESCE(
             (SELECT (a.price - t.price) / t.price * 100
              FROM trades t 
              WHERE t.asset_id = a.id 
              ORDER BY t.created_at DESC 
              LIMIT 1
             ), 
             0
           ) as change_24h
    FROM assets a
    WHERE a.id = ?
  `
  
  pool.query(query, [assetId], (err, results) => {
    if (err) {
      console.error('Asset fetch error:', err)
      return res.status(500).json({ message: 'Database error' })
    }
    
    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'Asset not found' })
    }

    res.json(results[0])
  })
}))

/**
 * Asset Search API Endpoint
 * Allows searching assets by name or symbol
 */
app.get('/api/assets/search', (req, res) => {
  const searchQuery = req.query.q?.toLowerCase()
  
  if (!searchQuery) {
    return res.json([])
  }

  const query = `
    SELECT id, name, symbol, type, price
    FROM assets
    WHERE LOWER(name) LIKE ? OR LOWER(symbol) LIKE ?
    LIMIT 10
  `
  
  pool.query(query, [`%${searchQuery}%`, `%${searchQuery}%`], (err, results) => {
    if (err) {
      console.error('Search error:', err)
      return res.status(500).json({ message: 'Database error' })
    }
    res.json(results)
  })
})

/**
 * Watchlist Endpoints
 */
app.get('/api/users/:userId/watchlist', asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.userId)

  const query = `
    SELECT w.id as watchlistId, a.*, w.created_at as added_at
    FROM watchlist w
    JOIN assets a ON w.asset_id = a.id
    WHERE w.user_id = ?
    ORDER BY w.created_at DESC
  `

  pool.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Watchlist fetch error:', err)
      return res.status(500).json({ message: 'Database error' })
    }
    res.json(results)
  })
}))

app.post('/api/watchlist/:assetId', asyncHandler(async (req, res) => {
  const { userId } = req.body
  const assetId = parseInt(req.params.assetId)
  
  // Better validation
  if (!userId) {
    return res.status(400).json({ 
      error: 'Missing user ID', 
      message: 'User ID is required in the request body' 
    })
  }
  
  if (isNaN(assetId) || assetId <= 0) {
    return res.status(400).json({ 
      error: 'Invalid asset ID', 
      message: 'Asset ID must be a positive number' 
    })
  }

  console.log(`Adding asset ${assetId} to watchlist for user ${userId}`)
  
  const query = 'INSERT INTO watchlist (user_id, asset_id) VALUES (?, ?)'

  pool.query(query, [userId, assetId], (err, result) => {
    if (err) {
      console.error('Watchlist add detailed error:', err)
      
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ 
          error: 'Duplicate entry', 
          message: 'Asset already in watchlist' 
        })
      }
      
      if (err.code === 'ER_NO_REFERENCED_ROW' || err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ 
          error: 'Foreign key constraint failed', 
          message: 'Invalid user ID or asset ID' 
        })
      }
      
      return res.status(500).json({ 
        error: 'Database error', 
        message: `Failed to add to watchlist: ${err.message}` 
      })
    }
    
    res.status(201).json({ id: result.insertId })
  })
}))

app.delete('/api/watchlist/:id', asyncHandler(async (req, res) => {
  const watchlistId = parseInt(req.params.id)

  pool.query('DELETE FROM watchlist WHERE id = ?', [watchlistId], (err, result) => {
    if (err) {
      console.error('Watchlist remove error:', err)
      return res.status(500).json({ message: 'Database error' })
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Watchlist item not found' })
    }
    res.status(204).send()
  })
}))

/**
 * Check if Asset is in Watchlist Endpoint
 * Checks if a specific asset is in a user's watchlist
 */
app.get('/api/users/:userId/watchlist/check/:assetId', asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.userId)
  const assetId = parseInt(req.params.assetId)
  
  if (isNaN(userId) || isNaN(assetId)) {
    return res.status(400).json({ 
      error: 'Invalid parameters', 
      message: 'User ID and Asset ID must be numeric values' 
    })
  }

  const query = `
    SELECT * FROM watchlist 
    WHERE user_id = ? AND asset_id = ?
    LIMIT 1
  `

  pool.query(query, [userId, assetId], (err, results) => {
    if (err) {
      console.error('Watchlist check error:', err)
      return res.status(500).json({ message: 'Database error' })
    }
    
    // Return whether the asset is in the watchlist and the watchlist item id if it exists
    res.json({
      isInWatchlist: results.length > 0,
      watchlistId: results.length > 0 ? results[0].id : null
    })
  })
}))

// Rate limiting setup
const rateLimit = {
  windowMs: 60 * 1000, // 1 minute
  count: 0,
  lastReset: Date.now(),
  maxRequests: 5 // Alpha Vantage free tier limit
}

// Cache setup
const priceCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Price History API Endpoint
 * Proxies requests to Alpha Vantage with caching and rate limiting
 */
app.get('/api/prices/:symbol', asyncHandler(async (req, res) => {
  const { symbol } = req.params
  const { interval = '5min', type = 'stock' } = req.query
  
  // Check cache first
  const cacheKey = `${symbol}-${interval}`
  const cached = priceCache.get(cacheKey)
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    return res.json(cached.data)
  }

  // Rate limiting check
  if (Date.now() - rateLimit.lastReset > rateLimit.windowMs) {
    rateLimit.count = 0
    rateLimit.lastReset = Date.now()
  }

  if (rateLimit.count >= rateLimit.maxRequests) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Please try again in a minute'
    })
  }

  try {
    const functionName = type === 'forex' ? 'FX_INTRADAY' 
                      : type === 'crypto' ? 'CRYPTO_INTRADAY'
                      : 'TIME_SERIES_INTRADAY'

    const url = `https://www.alphavantage.co/query?function=${functionName}&symbol=${symbol}&interval=${interval}&apikey=${alphaKey}`
    
    const response = await fetch(url)
    if (!response.ok) throw new Error('Alpha Vantage API error')
    
    const data = await response.json()
    
    if (data['Error Message']) {
      throw new Error(data['Error Message'])
    }

    // Cache the successful response
    priceCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    })
    
    rateLimit.count++
    res.json(data)

  } catch (err) {
    console.error('Price history error:', err)
    res.status(500).json({
      error: 'Failed to fetch price data',
      message: err.message
    })
  }
}))

/**
 * Database Reconnection Endpoint
 * Allows the frontend to trigger a reconnection attempt
 */
app.post('/api/reconnect', async (req, res) => {
  try {
    await testConnection()
    res.json({ success: true, message: 'Database connection restored' })
  } catch (error) {
    res.status(503).json({
      error: 'Database connection error',
      message: error.message
    })
  }
})

// Add debug email endpoint
app.post('/api/debug/email', asyncHandler(async (req, res) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER,
      subject: `${process.env.EMAIL_SUBJECT_PREFIX} Debug Test`,
      html: mailGenerator.generate({
        body: {
          name: 'Developer',
          intro: 'This is a debug test email from TradeBlazer.',
          outro: `Sent at: ${new Date().toLocaleString()}`
        }
      })
    }

    await transporter.sendMail(mailOptions)
    res.json({ message: 'Debug email sent successfully' })
  } catch (error) {
    console.error('Email error:', error)
    res.status(500).json({
      error: 'Email service error',
      message: error.message
    })
  }
}))

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
app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`)
})

// Start price alert service
priceAlertService.start();
