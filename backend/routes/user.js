const express = require('express')
const router = express.Router()
const multer = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../frontend/src/assets/avatars/')
  },
  filename: function (req, file, cb) {
    cb(null, req.body.username + '.jpg')
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'image/jpeg') {
      return cb(new Error('Only JPG files are allowed'))
    }
    cb(null, true)
  },
})

module.exports = (con, asyncHandler) => {
  router.put('/update', upload.single('avatar'), async (req, res) => {
    console.log('Update request received:', req.body)
    const { id, displayName, email, currentPassword, newPassword } = req.body

    if (!id || !displayName || !email || !currentPassword) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'All fields are required except new password',
      })
    }

    con.query(
      'SELECT id FROM users WHERE id = ? AND password = ?',
      [id, currentPassword],
      (err, result) => {
        if (err || !result || result.length === 0) {
          return res.status(401).json({
            error: 'Authentication failed',
            message: 'Current password is incorrect',
          })
        }

        const updateQuery = newPassword
          ? 'UPDATE users SET display_name = ?, email = ?, password = ? WHERE id = ?'
          : 'UPDATE users SET display_name = ?, email = ? WHERE id = ?'
        const updateParams = newPassword
          ? [displayName, email, newPassword, id]
          : [displayName, email, id]

        con.query(updateQuery, updateParams, (updateErr, updateResult) => {
          if (updateErr || updateResult.affectedRows === 0) {
            return res.status(500).json({
              error: 'Database error',
              message: 'Failed to update profile',
            })
          }

          res.json({
            success: true,
            user: {
              id,
              username: req.body.username,
              displayName,
              email,
            },
          })
        })
      }
    )
  })

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      const userId = req.params.id
      con.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
        if (err) {
          console.error('Delete user error:', err)
          return res.status(500).json({
            error: 'Database error',
            message: 'Failed to delete account',
          })
        }
        res.json({ success: true })
      })
    })
  )

  return router
}
