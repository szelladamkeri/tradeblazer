const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')

/**
 * Configure file storage for user avatars
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../frontend/src/assets/avatars/')
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname)
    cb(null, req.body.username + ext)
  },
})

/**
 * Configure multer for file uploads
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
})

/**
 * User routes module
 * Handles user profile updates and avatar management
 */
module.exports = (pool, asyncHandler) => {
  /**
   * Update User Profile
   * Updates user information and optionally the avatar
   */
  router.put('/update', upload.single('avatar'), asyncHandler(async (req, res) => {
    console.log('Update request received:', req.body)
    const { id, displayName, email, currentPassword, newPassword } = req.body

    // Validate required fields
    if (!id || !displayName || !email || !currentPassword) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'All fields are required except new password',
      })
    }

    // Verify current password and get current role
    const verifyQuery = 'SELECT id, role FROM users WHERE id = ? AND password = ?'
    
    pool.query(verifyQuery, [id, currentPassword], (err, result) => {
      if (err || !result || result.length === 0) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Current password is incorrect',
        })
      }

      // Prepare update query based on whether a new password was provided
      const updateQuery = newPassword
        ? 'UPDATE users SET display_name = ?, email = ?, password = ? WHERE id = ?'
        : 'UPDATE users SET display_name = ?, email = ? WHERE id = ?'
        
      const updateParams = newPassword
        ? [displayName, email, newPassword, id]
        : [displayName, email, id]

      // Update user profile
      pool.query(updateQuery, updateParams, (updateErr, updateResult) => {
        if (updateErr || updateResult.affectedRows === 0) {
          return res.status(500).json({
            error: 'Database error',
            message: 'Could not update profile',
          })
        }

        // Check if an avatar was uploaded
        if (req.file) {
          console.log('Avatar uploaded for user:', req.body.username)
        }

        res.json({
          success: true,
          message: 'Profile updated successfully',
          avatar: req.file ? true : false,
          role: result[0].role // Include role in response
        })
      })
    })
  }))

  /**
   * Get User Data
   * Returns user information by ID
   */
  router.get('/:id', asyncHandler(async (req, res) => {
    const userId = req.params.id
    
    // Select only necessary fields for security, using 'type' instead of 'role'
    const query = `
      SELECT id, username, display_name, email, type, created_at, balance 
      FROM users 
      WHERE id = ?
    `
    
    pool.query(query, [userId], (err, result) => {
      if (err) {
        // Log the specific database error
        console.error(`Error fetching user data for ID ${userId}:`, err);
        return res.status(500).json({
          error: 'Database error',
          message: 'Could not retrieve user information',
          // Optionally include more error details in development
          // details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }
      
      if (!result || result.length === 0) {
        return res.status(404).json({
          error: 'Not found',
          message: 'User not found',
        })
      }
      
      res.json(result[0])
    })
  }))

  return router
}
