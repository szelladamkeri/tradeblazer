const express = require('express');
const router = express.Router();

module.exports = (pool, asyncHandler) => {
  /**
   * Verify a user's email using the token from verification email
   */
  router.get('/verify/:token', asyncHandler(async (req, res) => {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({ 
        error: 'Missing token',
        message: 'Verification token is required'
      });
    }
    
    const query = `
      SELECT id FROM users 
      WHERE verification_token = ? 
        AND token_expiry > NOW() 
        AND verification_status = 'verification_needed'
    `;
    
    pool.query(query, [token], (err, results) => {
      if (err) {
        console.error('Verification error:', err);
        return res.status(500).json({ 
          error: 'Database error',
          message: 'Failed to verify account'
        });
      }
      
      if (!results || results.length === 0) {
        return res.status(400).json({ 
          error: 'Invalid or expired token',
          message: 'The verification link is invalid or has expired'
        });
      }
      
      // Valid token found, update user status to verified
      const userId = results[0].id;
      
      pool.query(
        'UPDATE users SET verification_status = "verified", verification_token = NULL, token_expiry = NULL WHERE id = ?',
        [userId],
        (updateErr, updateResult) => {
          if (updateErr) {
            console.error('User verification update error:', updateErr);
            return res.status(500).json({ 
              error: 'Database error',
              message: 'Failed to complete verification'
            });
          }
          
          res.json({ 
            success: true, 
            message: 'Your account has been successfully verified. You can now log in.' 
          });
        }
      );
    });
  }));
  
  return router;
};
