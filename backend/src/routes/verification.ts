import { Router, Request, Response } from 'express';
import pool from '../db';
import { createVerificationToken, sendVerificationEmail } from '../services/verificationService';

export const verificationRouter = Router();

/**
 * Resend verification email
 */
verificationRouter.post('/resend', async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ 
      error: 'Missing email',
      message: 'Email is required' 
    });
  }

  try {
    // Get user by email
    const [users] = await pool.query(
      'SELECT id, username as name, email FROM users WHERE email = ? AND verification_status = "verification_needed"',
      [email]
    ) as [any[], any];

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'No pending verification found for this email' 
      });
    }

    // Create new verification token
    const { token, expiry } = createVerificationToken();

    // Update user's token
    await pool.query(
      'UPDATE users SET verification_token = ?, token_expiry = ? WHERE email = ?',
      [token, expiry, email]
    );

    // Send new verification email
    await sendVerificationEmail(users[0], token);

    res.json({ 
      success: true,
      message: 'Verification email has been resent' 
    });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ 
      error: 'Email error',
      message: 'Failed to resend verification email' 
    });
  }
});

/**
 * Verify a user's email using the token from verification email
 */
verificationRouter.get('/verify/:token', async (req: Request, res: Response) => {
  const { token } = req.params;
  
  if (!token) {
    return res.status(400).json({ 
      error: 'Missing token',
      message: 'Verification token is required'
    });
  }
  
  try {
    // Check if token is valid and not expired
    const [users] = await pool.query(
      `SELECT id FROM users 
       WHERE verification_token = ? 
         AND token_expiry > NOW() 
         AND verification_status = 'verification_needed'`,
      [token]
    ) as [any[], any];

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid or expired token',
        message: 'The verification link is invalid or has expired'
      });
    }
    
    // Valid token found, update user status to verified
    const userId = users[0].id;
    
    await pool.query(
      'UPDATE users SET verification_status = "verified", verification_token = NULL, token_expiry = NULL WHERE id = ?',
      [userId]
    );
    
    res.json({ 
      success: true, 
      message: 'Your account has been successfully verified. You can now log in.'
    });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ 
      error: 'Database error',
      message: 'Failed to verify account'
    });
  }
});