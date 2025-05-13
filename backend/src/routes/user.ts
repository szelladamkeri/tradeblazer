import { Router, Request, Response } from 'express';
import { Pool, RowDataPacket } from 'mysql2/promise';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import path from 'path';
import pool from '../db';

// Create the router
export const userRouter = Router();

/**
 * Configure file storage for user avatars
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../frontend/src/assets/avatars/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, req.body.username + ext);
  },
});

/**
 * Configure multer for file uploads
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
});

/**
 * Update User Profile
 * Updates user information and optionally the avatar
 */
userRouter.put('/update', upload.single('avatar'), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  console.log('Update request received:', req.body);
  const { id, displayName, email, currentPassword, newPassword } = req.body;

  // Validate required fields
  if (!id || !displayName || !email || !currentPassword) {
    res.status(400).json({
      error: 'Missing required fields',
      message: 'All fields are required except new password',
    });
    return;
  }

  // Verify current password and get current role
  const verifyQuery = 'SELECT id, role FROM users WHERE id = ? AND password = ?';
  
  const [verifyResult] = await pool.query<RowDataPacket[]>(verifyQuery, [id, currentPassword]);
  
  if (verifyResult.length === 0) {
    res.status(401).json({
      error: 'Authentication failed',
      message: 'Current password is incorrect',
    });
    return;
  }

  // Prepare update query based on whether a new password was provided
  const updateQuery = newPassword
    ? 'UPDATE users SET display_name = ?, email = ?, password = ? WHERE id = ?'
    : 'UPDATE users SET display_name = ?, email = ? WHERE id = ?';
    
  const updateParams = newPassword
    ? [displayName, email, newPassword, id]
    : [displayName, email, id];

  // Update user profile
  const [updateResult] = await pool.query(updateQuery, updateParams);
  
  if ((updateResult as any).affectedRows === 0) {
    res.status(500).json({
      error: 'Database error',
      message: 'Could not update profile',
    });
    return;
  }

  // Check if an avatar was uploaded
  if (req.file) {
    console.log('Avatar uploaded for user:', req.body.username);
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    avatar: req.file ? true : false,
    role: verifyResult[0].role // Include role in response
  });
}));

/**
 * Get User Data
 * Returns user information by ID
 */
userRouter.get('/:id', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id;
  
  // Select only necessary fields for security, using 'type' instead of 'role'
  const query = `
    SELECT id, username, display_name, email, type, created_at, balance 
    FROM users 
    WHERE id = ?
  `;
  
  const [result] = await pool.query<RowDataPacket[]>(query, [userId]);
  
  if (result.length === 0) {
    res.status(404).json({
      error: 'Not found',
      message: 'User not found',
    });
    return;
  }
  
  res.json(result[0]);
}));

// Placeholder for user routes
userRouter.get('/', (req, res) => {
  res.send('User route placeholder');
}); 