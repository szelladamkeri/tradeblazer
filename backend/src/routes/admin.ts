import { Router, Request, Response } from 'express';
import pool from '../db';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const adminRouter = Router();

/**
 * Configure file storage for user avatars
 */
const storage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    cb(null, '../frontend/src/assets/avatars/');
  },
  filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
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
 * Get All Users
 * Returns a list of all users for admin management
 */
adminRouter.get('/users', async (req: Request, res: Response) => {
  const query = 'SELECT id, username, email, type, created_at FROM users';
  
  try {
    const [result] = await pool.query(query) as [any[], any];
    
    // Map the results to include both type and role for compatibility
    const users = result.map((user: any) => ({
      ...user,
      role: user.type // Add role field for backward compatibility
    }));
    
    res.json(users);
  } catch (err: unknown) {
    console.error('Database query error:', err);
    return res.status(500).json({
      error: 'Database query error',
      message: (err as Error).message,
    });
  }
});

/**
 * Delete User
 * Removes a user from the system
 */
adminRouter.delete('/users/:id', async (req: Request, res: Response) => {
  const userId = req.params.id;
  
  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [userId]) as [any, any];
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found',
      });
    }
    
    res.json({ success: true });
  } catch (err: unknown) {
    console.error('Delete user error:', err);
    return res.status(500).json({
      error: 'Database error',
      message: 'Failed to delete user',
    });
  }
});

/**
 * Update User
 * Updates user information (admin function)
 */
adminRouter.put('/users/:id', async (req: Request, res: Response) => {
  const userId = req.params.id;
  const { username, email, role } = req.body;
  
  const query = 'UPDATE users SET username = ?, email = ?, type = ? WHERE id = ?';
  
  try {
    const [result] = await pool.query(query, [username, email, role, userId]) as [any, any];
    
    res.json({
      success: true,
      user: { 
        id: userId, 
        username, 
        email, 
        type: role,
        role: role // Include both for consistency
      },
    });
  } catch (err: unknown) {
    return res.status(500).json({
      error: 'Database error',
      message: 'Failed to update user',
    });
  }
});

/**
 * Update User Avatar
 * Uploads and sets a user's avatar image
 */
adminRouter.put('/users/:id/avatar', upload.single('avatar'), async (req: Request & { file?: Express.Multer.File }, res: Response) => {
  const username = req.body.username;
  
  if (!username) {
    return res.status(400).json({
      error: 'Missing username',
      message: 'Username is required for avatar upload',
    });
  }
  
  try {
    if (req.file) {
      res.json({
        success: true,
        message: 'Avatar updated successfully',
      });
    } else {
      res.status(400).json({
        error: 'Upload failed',
        message: 'No file was uploaded',
      });
    }
  } catch (error: unknown) {
    res.status(500).json({
      error: 'Server error',
      message: (error as Error).message,
    });
  }
});

/**
 * Delete User Avatar
 * Removes a user's avatar image
 */
adminRouter.delete('/users/:id/avatar', async (req: Request, res: Response) => {
  const username = req.query.username as string;
  
  if (!username) {
    return res.status(400).json({
      error: 'Missing username',
      message: 'Username is required for avatar deletion',
    });
  }

  const avatarPath = path.join(__dirname, '../../frontend/src/assets/avatars/', username + '.jpg');

  try {
    if (fs.existsSync(avatarPath)) {
      fs.unlinkSync(avatarPath);
      res.json({
        success: true,
        message: 'Avatar deleted successfully',
      });
    } else {
      res.status(404).json({
        error: 'Not found',
        message: 'Avatar does not exist',
      });
    }
  } catch (error: unknown) {
    console.error('Error deleting avatar:', error);
    res.status(500).json({
      error: 'Server error',
      message: (error as Error).message,
    });
  }
});

// Endpoint to check if a file exists (e.g., avatar)
adminRouter.post('/checkfile', async (req: Request, res: Response) => {
  try {
    const { purpose, username } = req.body;

    if (!purpose || !username) {
      return res.status(400).json({ message: 'Purpose and username are required' });
    }

    if (purpose === 'avatarCheck') {
      const avatarPath = path.join(__dirname, '../../frontend/src/assets/avatars/', `${username}.jpg`);
      const hasAvatar = fs.existsSync(avatarPath);
      return res.json({ hasAvatar });
    }

    return res.status(400).json({ message: 'Invalid purpose' });
  } catch (error) {
    console.error('Error checking file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}); 