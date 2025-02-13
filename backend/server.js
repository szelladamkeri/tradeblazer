const express = require('express')
const cors = require('cors')
const mysql = require('mysql')
const fs = require('fs')
const ini = require('ini')
const app = express()
const port = 3000

//HAS HOTRELOAD (nodemon)

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

// Connection error handling
con.connect(function (err) {
    if (err) {
        if (err.code === 'ECONNREFUSED') {
            console.error(
                'Database connection failed: MySQL server is not running. Please start XAMPP MySQL service.'
            )
            console.error('Error details:', {
                code: err.code,
                errno: err.errno,
                syscall: err.syscall,
                port: err.port,
            })
        } else {
            console.error('Database connection error:', err.message)
        }
    } else {
        console.log('Connected to the database!')
    }
})

// Add more robust connection testing
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

// Helper function to wrap async routes
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
}

// Register endpoint
app.post(
    '/api/register',
    asyncHandler(async (req, res) => {
        const { username, email, password } = req.body
        console.log('Register attempt:', { username, email })

        if (!username || !email || !password) {
            return res.status(400).json({
                error: 'Missing credentials',
                message: 'Username, email and password are required',
            })
        }

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
    })
)

// Data on home page
app.get(
    '/api/data',
    asyncHandler(async (req, res) => {
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
    })
)

// Asset types on homepage
app.get(
    '/api/types',
    asyncHandler(async (req, res) => {
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
    })
)

// Login endpoint
app.post(
    '/api/login',
    asyncHandler(async (req, res) => {
        console.log('Login request received:', req.body)
        const { emailOrUsername, password } = req.body

        if (!emailOrUsername || !password) {
            console.log('Missing credentials')
            return res.status(400).json({
                error: 'Missing credentials',
                message: 'Username/Email and password are required',
            })
        }
        // TODO: Return which login credential is wrong, email/username or password
        // probably more selects
        try {
            await testConnection()
            con.query(
                'SELECT id, username, email, type FROM users WHERE (email = ? OR username = ?) AND password = ?',
                [emailOrUsername, emailOrUsername, password],
                (err, result) => {
                    if (err) {
                        console.error('Login query error:', err)
                        return res.status(500).json({
                            error: 'Database error',
                            message: 'Internal server error',
                        })
                    }

                    if (!result || result.length === 0) { //if empty or null
                        return res.status(401).json({
                            error: 'Authentication failed',
                            message: 'Invalid email or username',
                        })
                    }

                    const user = result[0];
                    con.query(
                        `SELECT id FROM users WHERE (email = ? OR username = ?) AND password = ? LIMIT 1`,
                        [emailOrUsername, emailOrUsername, password],
                        (err, result) => {

                            if (err) { //check for errors
                                console.error('Login query error password check:', err)
                                return res.status(500).json({
                                    error: 'Database error',
                                    message: 'Internal server error',
                                })
                            }

                            if (!result || result.length === 0) { //if empty or null
                                return res.status(401).json({
                                    error: 'Authentication failed',
                                    message: 'Invalid password',
                                })
                            }

                            console.log("Login successful", user);

                            const response = {
                                success: true,
                                user: {
                                    id: user.id,
                                    username: user.username,
                                    email: user.email,
                                    avatar: user.avatar
                                },
                            }

                            res.setHeader('Content-Type', 'application/json')
                            console.log('Sending response:', response)
                            res.json(response)
                        }
                    );
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
)
//Profile change endpoint
app.put('/api/user/update', async (req, res) => {
    // TODO: Do the same as register, make sure the user knows whats wrong
    // and you cant override stuff, or change username
    // also avatar
    console.log('Update request received:', req.body)
    const { id, username, email, currentPassword, newPassword } = req.body

    if (!id || !username || !email || !currentPassword) {
        return res.status(400).json({
            error: 'Missing required fields',
            message: 'All fields are required except new password',
        })
    }

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
})


// Get api health
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
    })
})

// Get trending asset in last 7 days for most trending endpoint
app.get(
    '/api/trending-asset',
    asyncHandler(async (req, res) => {
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
                return res.status(404).json({
                    error: 'No assets found',
                    message: 'The assets table is empty',
                })
            }

            res.json(result[0])
        })
    })
)

// Add admin users endpoint
app.get(
    '/api/admin/users',
    asyncHandler(async (req, res) => {
        await testConnection()
        con.query('SELECT id, username, email, type as role FROM users', (err, result) => {
            if (err) {
                console.error('Database query error:', err)
                return res.status(500).json({
                    error: 'Database query error',
                    message: err.message,
                })
            }

            res.json(result)
        })
    })
)

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

// Handle uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err)
})

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`)
})
