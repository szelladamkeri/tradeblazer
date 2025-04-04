const express = require('express')
const router = express.Router()

/**
 * Authentication routes module
 * Handles user registration and login functionality
 */
module.exports = (pool, asyncHandler) => {
  /**
   * User Registration
   * Creates a new user account
   */
  router.post('/register', asyncHandler(async (req, res) => {
    const { username, email, password } = req.body
    console.log('Register attempt:', { username, email })

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Username, email and password are required',
      })
    }

    // Check if email already exists
    pool.query('SELECT id FROM users WHERE email = ?', 
      [email], 
      (err, result) => {
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
        pool.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
          [username, email, password], 
          (insertErr) => {
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
          }
        )
      }
    )
  }))

  /**
   * User Login
   * Authenticates a user and returns their data
   */
  router.post('/login', asyncHandler(async (req, res) => {
    console.log('Login request received:', req.body)
    const { emailOrUsername, password } = req.body

    // Validate required fields
    if (!emailOrUsername || !password) {
      console.log('Missing credentials')
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Username/Email and password are required',
      })
    }

    // Find user by email or username
    pool.query(
      `SELECT id, username, email, role, created_at FROM users 
       WHERE email = ? OR username = ? LIMIT 1`,
      [emailOrUsername, emailOrUsername],
      (err, result) => {
        if (err) {
          console.error('Login query error usercheck:', err)
          return res.status(500).json({
            error: 'Database error',
            message: 'Internal server error',
          })
        }

        if (!result || result.length === 0) {
          return res.status(401).json({
            error: 'Authentication failed',
            message: 'Invalid email or username',
          })
        }

        const user = result[0]
        
        // Verify password
        pool.query(
          `SELECT id FROM users 
           WHERE (email = ? OR username = ?) AND password = ? LIMIT 1`,
          [emailOrUsername, emailOrUsername, password],
          (err, result) => {
            if (err || !result || result.length === 0) {
              return res.status(401).json({
                error: 'Authentication failed',
                message: 'Invalid password',
              })
            }

            console.log('Login successful', user)
            res.json({
              success: true,
              user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                created_at: user.created_at,
              },
            })
          }
        )
      }
    )
  }))

  return router
}
