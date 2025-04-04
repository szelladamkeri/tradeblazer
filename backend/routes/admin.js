const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

/**
 * Configure file storage for user avatars
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../frontend/src/assets/avatars/')
  },
  filename: function (req, file, cb) {
    cb(null, req.body.username + '.jpg')
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
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'image/jpeg') {
      return cb(new Error('Only JPG files are allowed'))
    }
    cb(null, true)
  },
})

/**
 * Admin routes module
 * Handles administrative user management functions
 */
module.exports = (pool, asyncHandler) => {
  /**
   * Get All Users
   * Returns a list of all users for admin management
   */
  router.get('/users', asyncHandler(async (req, res) => {
    const query = 'SELECT id, username, email, role, created_at FROM users'
    
    pool.query(query, (err, result) => {
      if (err) {
        console.error('Database query error:', err)
        return res.status(500).json({
          error: 'Database query error',
          message: err.message,
        })
      }
      res.json(result)
    })
  }))

  /**
   * Delete User
   * Removes a user from the system
   */
  router.delete('/users/:id', asyncHandler(async (req, res) => {
    const userId = req.params.id
    
    pool.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
      if (err) {
        console.error('Delete user error:', err)
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to delete user',
        })
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: 'Not found',
          message: 'User not found',
        })
      }
      
      res.json({ success: true })
    })
  }))

  /**
   * Update User
   * Updates user information (admin function)
   */
  router.put('/users/:id', asyncHandler(async (req, res) => {
    const userId = req.params.id
    const { username, email, role } = req.body
    
    // Update user information
    const query = 'UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?'
    
    pool.query(query, [username, email, role, userId], (err, result) => {
      if (err) {
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to update user',
        })
      }
      
      res.json({
        success: true,
        user: { id: userId, username, email, role },
      })
    })
  }))

  /**
   * Update User Avatar
   * Uploads and sets a user's avatar image
   */
  router.put('/users/:id/avatar', upload.single('avatar'), asyncHandler(async (req, res) => {
    const username = req.body.username
    
    if (!username) {
      return res.status(400).json({
        error: 'Missing username',
        message: 'Username is required for avatar upload',
      })
    }
    
    try {
      if (req.file) {
        res.json({
          success: true,
          message: 'Avatar updated successfully',
        })
      } else {
        res.status(400).json({
          error: 'Upload failed',
          message: 'No file was uploaded',
        })
      }
    } catch (error) {
      res.status(500).json({
        error: 'Server error',
        message: error.message,
      })
    }
  }))

  /**
   * Delete User Avatar
   * Removes a user's avatar image
   */
  router.delete('/users/:id/avatar', asyncHandler(async (req, res) => {
    const username = req.query.username
    
    if (!username) {
      return res.status(400).json({
        error: 'Missing username',
        message: 'Username is required for avatar deletion',
      })
    }

    const avatarPath = path.join(__dirname, '../../frontend/src/assets/avatars/', username + '.jpg')

    try {
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath)
        res.json({
          success: true,
          message: 'Avatar deleted successfully',
        })
      } else {
        res.status(404).json({
          error: 'Not found',
          message: 'Avatar does not exist',
        })
      }
    } catch (error) {
      console.error('Error deleting avatar:', error)
      res.status(500).json({
        error: 'Server error',
        message: error.message,
      })
    }
  }))

  /**
   * Check if File Exists
   * Utility endpoint to check if a user avatar exists
   */
  router.post('/checkfile', asyncHandler(async (req, res) => {
    const { purpose, username } = req.body

    if (purpose === 'avatarCheck') {
      const avatarPath = path.join(__dirname, '../../frontend/src/assets/avatars/', username + '.jpg')

      try {
        if (fs.existsSync(avatarPath)) {
          res.json({ hasAvatar: true })
        } else {
          res.json({ hasAvatar: false })
        }
      } catch (error) {
        console.error('Error checking avatar:', error)
        res.status(500).json({
          error: 'Server error',
          message: error.message
        })
      }
    }
  }))

  return router
}
