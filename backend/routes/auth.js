const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { createVerificationToken, sendVerificationEmail } = require('../services/verificationService');

/**
 * Authentication routes module
 * Handles user registration and login functionality
 */
module.exports = (pool, asyncHandler) => {
  /**
   * User registration with email verification
   */
  router.post('/register', asyncHandler(async (req, res) => {
    const { name, email, password, full_name, address } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !full_name || !address) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Username, email, password, full name, and address are all required'
      });
    }
    
    // Check if user already exists by email or username
    pool.query('SELECT id, email, username FROM users WHERE email = ? OR username = ?', [email, name], (err, results) => {
      if (err) {
        console.error('Registration error:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      
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
      
      // Hash password
      bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
          console.error('Password hashing error:', hashErr);
          return res.status(500).json({ message: 'Error creating account' });
        }
        
        // Create user with verification_needed status
        const insertQuery = `
          INSERT INTO users (username, email, password, verification_status, verification_token, token_expiry, full_name, address)
          VALUES (?, ?, ?, 'verification_needed', ?, ?, ?, ?)
        `;
        
        pool.query(
          insertQuery, 
          [name, email, hashedPassword, token, expiry, full_name, address], 
          async (insertErr, result) => {
            if (insertErr) {
              console.error('User insert error:', insertErr.message);
              
              // Provide specific error message for duplicate entries
              if (insertErr.code === 'ER_DUP_ENTRY') {
                // Check which field is duplicate
                if (insertErr.message.includes('username')) {
                  return res.status(409).json({ message: 'Username is already taken' });
                } else if (insertErr.message.includes('email')) {
                  return res.status(409).json({ message: 'Email address is already registered' });
                }
              }
              
              return res.status(500).json({ message: 'Failed to create account' });
            }
            
            const userId = result.insertId;
            
            try {
              // Send verification email
              await sendVerificationEmail({ id: userId, name, email }, token);
              
              res.status(201).json({
                message: 'Registration successful. Please check your email to verify your account.',
                verification_needed: true
              });
            } catch (emailErr) {
              console.error('Verification email error:', emailErr);
              
              // Delete user if email fails
              pool.query('DELETE FROM users WHERE id = ?', [userId]);
              
              res.status(500).json({
                error: 'Email error',
                message: 'Failed to send verification email. Please try again.'
              });
            }
          }
        );
      });
    });
  }));
  
  // Login endpoint with verification check
  router.post('/login', asyncHandler(async (req, res) => {
    const { emailOrUsername, password } = req.body;
    
    // Validate required fields
    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'Email/username and password are required' });
    }
    
    const query = `
      SELECT id, username as name, email, password, verification_status, type
      FROM users
      WHERE email = ? OR username = ?
    `;
    
    pool.query(query, [emailOrUsername, emailOrUsername], (err, results) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      
      if (!results || results.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const user = results[0];
      
      bcrypt.compare(password, user.password, (bcryptErr, match) => {
        if (bcryptErr) {
          console.error('Password comparison error:', bcryptErr);
          return res.status(500).json({ message: 'Authentication error' });
        }
        
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
        const { password, ...userWithoutPassword } = user;
        res.json({
          message: 'Login successful',
          user: userWithoutPassword
        });
      });
    });
  }));

  return router;
};
