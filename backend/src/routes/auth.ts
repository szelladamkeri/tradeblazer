import { Router, Request, Response } from 'express';
import pool from '../db';
import bcrypt from 'bcrypt';
import { createVerificationToken, sendVerificationEmail } from '../services/verificationService';

export const authRouter = Router();

/**
 * User registration with email verification
 */
authRouter.post('/register', async (req: Request, res: Response) => {
  const { name, email, password, full_name, address } = req.body;
  
  // Validate required fields
  if (!name || !email || !password || !full_name || !address) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      message: 'Username, email, password, full name, and address are all required'
    });
  }
  
  try {
    // Check if user already exists by email or username
    const [results] = await pool.query('SELECT id, email, username FROM users WHERE email = ? OR username = ?', [email, name]) as [any[], any];
    
    // Check for existing user with same email or username
    if (results && results.length > 0) {
      const existingUser = results[0];
      
      if (existingUser.email === email) {
        return res.status(409).json({ message: 'User with this email already exists' });
      }
      
      if (existingUser.username === name) {
        return res.status(409).json({ message: 'Username is already taken' });
      }
      
      return res.status(409).json({ message: 'User already exists' });
    }
    
    // Create verification token with expiry
    const { token, expiry } = createVerificationToken();
    
    // Hash password - this is fully implemented
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user with verification_needed status
    const insertQuery = `
      INSERT INTO users (username, email, password, verification_status, verification_token, token_expiry, full_name, address)
      VALUES (?, ?, ?, 'verification_needed', ?, ?, ?, ?)
    `;
    
    const [insertResult] = await pool.query(
      insertQuery, 
      [name, email, hashedPassword, token, expiry, full_name, address]
    ) as [any, any];
    
    const userId = insertResult.insertId;
    
    try {
      // Send verification email
      await sendVerificationEmail({ id: userId, name, email }, token);
      
      res.status(201).json({
        message: 'Registration successful. Please check your email to verify your account.',
        verification_needed: true
      });
    } catch (emailErr: unknown) {
      console.error('Verification email error:', emailErr);
      
      // Delete user if email fails
      await pool.query('DELETE FROM users WHERE id = ?', [userId]);
      
      res.status(500).json({
        error: 'Email error',
        message: 'Failed to send verification email. Please try again.'
      });
    }
  } catch (err: unknown) {
    console.error('Registration error:', err);
    
    if (err && typeof err === 'object' && 'code' in err && err.code === 'ER_DUP_ENTRY') {
      const message = err && typeof err === 'object' && 'message' in err ? err.message as string : '';
      // Check which field is duplicate
      if (message.includes('username')) {
        return res.status(409).json({ message: 'Username is already taken' });
      } else if (message.includes('email')) {
        return res.status(409).json({ message: 'Email address is already registered' });
      }
    }
    
    return res.status(500).json({ message: 'Failed to create account' });
  }
});

// Login endpoint with verification check
authRouter.post('/login', async (req: Request, res: Response) => {
  const { emailOrUsername, password } = req.body;
  
  // Validate required fields
  if (!emailOrUsername || !password) {
    return res.status(400).json({ message: 'Email/username and password are required' });
  }
  
  try {
    const query = `
      SELECT id, username as name, email, password, verification_status, type, balance, created_at
      FROM users
      WHERE email = ? OR username = ?
    `;
    
    const [results] = await pool.query(query, [emailOrUsername, emailOrUsername]) as [any[], any];
    
    if (!results || results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = results[0];
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if the user is verified
    if (user.verification_status === 'verification_needed') {
      return res.status(403).json({
        message: 'Please verify your email before logging in',
        verification_needed: true
      });
    }
    
    // User is authenticated and verified
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      message: 'Login successful',
      user: userWithoutPassword
    });
  } catch (err: unknown) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Authentication error' });
  }
}); 