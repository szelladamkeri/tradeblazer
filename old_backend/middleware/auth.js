/**
 * Authentication middleware that includes verification check
 */
module.exports = (pool) => {
  return async (req, res, next) => {
    // Get user ID from session or token (implementation depends on your auth system)
    const userId = req.user?.id || req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check if user exists and is verified
    pool.query(
      'SELECT verification_status FROM users WHERE id = ?',
      [userId],
      (err, results) => {
        if (err) {
          console.error('Auth middleware error:', err);
          return res.status(500).json({ message: 'Internal server error' });
        }
        
        if (!results || results.length === 0) {
          return res.status(401).json({ message: 'User not found' });
        }
        
        // Check verification status
        if (results[0].verification_status !== 'verified') {
          return res.status(403).json({ 
            message: 'Email verification required',
            verification_needed: true
          });
        }
        
        // User is verified, proceed to next middleware
        next();
      }
    );
  };
};
