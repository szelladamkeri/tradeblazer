const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Reuse the multer configuration
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
	router.get('/users', asyncHandler(async (req, res) => {
		con.query('SELECT id, username, email, type as role, created_at FROM users', (err, result) => {
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

	router.delete('/users/:id', asyncHandler(async (req, res) => {
		const userId = req.params.id
		con.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
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
	})
	)

	router.put('/users/:id', asyncHandler(async (req, res) => {
		const userId = req.params.id
		const { username, email, role } = req.body

		con.query(
			'UPDATE users SET username = ?, email = ?, type = ? WHERE id = ?',
			[username, email, role, userId],
			(err, result) => {
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
			}
		)
	})
	)

	router.put('/users/:id/avatar', upload.single('avatar'), async (req, res) => {
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
	})

	router.delete('/users/:id/avatar', async (req, res) => {
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
	})

	router.post('/checkfile', asyncHandler(async (req, res) => {
		const { purpose, username } = req.body;

		if (purpose === 'avatarCheck') {
			const avatarPath = path.join(__dirname, '../../frontend/src/assets/avatars/', username + '.jpg');

			try {
				if (fs.existsSync(avatarPath)) {
					res.json({ hasAvatar: true });
				} else {
					res.json({ hasAvatar: false });
				}
			} catch (error) {
				console.error('Error checking avatar:', error);
				res.status(500).json({
					error: 'Server error',
					message: error.message
				});
			}
		}
	}));

	return router
}
