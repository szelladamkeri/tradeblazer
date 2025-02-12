const express = require('express')
const cors = require('cors')
const mysql = require('mysql')
const fs = require('fs')
const ini = require('ini')
const app = express()
const port = 3000

//NEEDS RESTART IF ANYTHING IS CHANGED

// Update CORS configuration
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  })
)

// Add middleware before routes
app.use(express.json())
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}:`, req.body)
  next()
})

// Read the ini file
const config = ini.parse(fs.readFileSync('./db/db_config.ini', 'utf-8'))

// Create a MySQL connection
const con = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.pass,
  database: config.dbname,
})

con.connect(function (err) {
  if (err) {
    console.error('Error connecting to the database:', err)
    process.exit(1)
  }
  console.log('Connected to the database!')
})

// Test database connection before query
const testConnection = () => {
  return new Promise((resolve, reject) => {
    con.ping((err) => {
      if (err) reject(err)
      resolve()
    })
  })
}

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body
  console.log('Register attempt:', { username, email })

  if (!username || !email || !password) {
    return res.status(400).json({
      error: 'Missing credentials',
      message: 'Username, email and password are required',
    })
  }

  try {
    await testConnection()

    // Check if email already exists
    con.query('SELECT id FROM users WHERE email = ?', [email], (err, result) => {
      if (err) {
        console.error('Email check error:', err)
        return res.status(500).json({
          error: 'Database error',
          message: 'Internal server error',
        })
      }

      if (result && result.length > 0) {
        return res.status(400).json({
          error: 'Registration failed',
          message: 'Email already exists',
        })
      }

      // Create new user
      const insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)'
      con.query(insertQuery, [username, email, password], (insertErr) => {
        if (insertErr) {
          console.error('User creation error:', insertErr)
          return res.status(500).json({
            error: 'Registration failed',
            message: 'Could not create user',
          })
        }

        res.status(201).json({
          success: true,
          message: 'Registration successful',
        })
      })
    })
  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    })
  }
})

//Data on home page
app.get('/api/data', async (req, res) => {
  try {
    await testConnection()
    con.query('SELECT * FROM assets', function (err, result) {
      if (err) {
        console.error('Database query error:', err)
        return res.status(500).json({
          error: 'Database query error',
          message: err.message,
        })
      }

      if (!result || result.length === 0) {
        return res.status(404).json({
          error: 'No data found',
          message: 'The assets table is empty',
        })
      }

      res.json(result)
    })
  } catch (error) {
    console.error('Database connection error:', error)
    res.status(500).json({
      error: 'Database connection error',
      message: error.message,
    })
  }
})

//Asset types on homepage
app.get('/api/types', async (req, res) => {
  try {
    await testConnection()
    con.query('SELECT DISTINCT type FROM assets', function (err, result) {
      if (err) {
        console.error('Database query error:', err)
        return res.status(500).json({
          error: 'Database query error',
          message: err.message,
        })
      }

      if (!result || result.length === 0) {
        return res.status(404).json({
          error: 'No types found',
          message: 'The assets table has no types',
        })
      }

      const types = result.map((row) => row.type)
      res.json(types)
    })
  } catch (error) {
    console.error('Database connection error:', error)
    res.status(500).json({
      error: 'Database connection error',
      message: error.message,
    })
  }
})

//Login endpoint
app.post('/api/login', async (req, res) => {
  console.log('Login request received:', req.body)
  const { emailOrUsername, password } = req.body // Match the parameter name from frontend

  if (!emailOrUsername || !password) {
    console.log('Missing credentials')
    return res.status(400).json({
      error: 'Missing credentials',
      message: 'Username/Email and password are required', // Updated error message
    })
  }

  try {
    await testConnection()
    con.query(
      'SELECT id, username, email FROM users WHERE (email = ? OR username = ?) AND password = ?',
      [emailOrUsername, emailOrUsername, password],
      (err, result) => {
        if (err) {
          console.error('Login query error:', err)
          return res.status(500).json({
            error: 'Database error',
            message: 'Internal server error',
          })
        }

        console.log('Query result:', result)

        if (!result || result.length === 0) {
          return res.status(401).json({
            error: 'Authentication failed',
            message: 'Invalid email or password',
          })
        }

        const response = {
          success: true,
          user: {
            id: result[0].id,
            username: result[0].username,
            email: result[0].email,
          },
        }

        res.setHeader('Content-Type', 'application/json')
        console.log('Sending response:', response)
        res.json(response)
      }
    )
  } catch (error) {
    console.error('Database connection error:', error)
    res.status(500).json({
      error: 'Database connection error',
      message: error.message,
    })
  }
})

//Profile change endpoint
app.put('/api/user/update', async (req, res) => {
  console.log('Update request received:', req.body)
  const { id, username, email, currentPassword, newPassword } = req.body

  if (!id || !username || !email || !currentPassword) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'All fields are required except new password',
    })
  }

  try {
    await testConnection()
    // First verify current password
    con.query(
      'SELECT id FROM users WHERE id = ? AND password = ?',
      [id, currentPassword],
      (err, result) => {
        if (err) {
          console.error('Verification error:', err)
          return res.status(500).json({
            error: 'Database error',
            message: 'Internal server error',
          })
        }

        if (!result || result.length === 0) {
          return res.status(401).json({
            error: 'Authentication failed',
            message: 'Current password is incorrect',
          })
        }

        // Update user information
        const updateQuery = newPassword
          ? 'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?'
          : 'UPDATE users SET username = ?, email = ? WHERE id = ?'
        const updateParams = newPassword
          ? [username, email, newPassword, id]
          : [username, email, id]

        con.query(updateQuery, updateParams, (updateErr, updateResult) => {
          if (updateErr) {
            console.error('Update error:', updateErr)
            return res.status(500).json({
              error: 'Database error',
              message: 'Failed to update profile',
            })
          }

          if (updateResult.affectedRows === 0) {
            return res.status(404).json({
              error: 'Update failed',
              message: 'User not found',
            })
          }

          res.json({
            success: true,
            user: {
              id,
              username,
              email,
            },
          })
        })
      }
    )
  } catch (error) {
    console.error('Database connection error:', error)
    res.status(500).json({
      error: 'Database connection error',
      message: error.message,
    })
  }
})

//Get api health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() })
})

// Get trending asset in last 7 days for most trending endpoint
app.get('/api/trending-asset', async (req, res) => {
  try {
    await testConnection()
    const query = `
      SELECT a.*, COUNT(t.id) as trade_count
      FROM assets a
      LEFT JOIN trades t ON a.id = t.asset_id AND t.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY a.id
      ORDER BY trade_count DESC, a.id ASC
      LIMIT 1
    `
    con.query(query, function (err, result) {
      if (err) {
        console.error('Database query error:', err)
        return res.status(500).json({
          error: 'Database query error',
          message: err.message,
        })
      }

      if (!result || result.length === 0) {
        // If no assets found at all, return 404
        return res.status(404).json({
          error: 'No assets found',
          message: 'The assets table is empty',
        })
      }

      // Always return the first result, even if it has no trades
      res.json(result[0])
    })
  } catch (error) {
    console.error('Database connection error:', error)
    res.status(500).json({
      error: 'Database connection error',
      message: error.message,
    })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    error: 'Server error',
    message: err.message,
  })
})

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`)
})
