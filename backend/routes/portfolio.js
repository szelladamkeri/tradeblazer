const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Add authentication middleware to all portfolio routes
router.use(authenticateToken);

// Get user portfolio data
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log('Received portfolio request for userId:', userId);
  
  // Validate userId is a number
  if (isNaN(userId)) {
    console.log('Invalid userId format:', userId);
    return res.status(400).json({ message: 'Invalid user ID' });
  }
  
  try {
    // Check if user exists first
    const [userExists] = await db.query(
      'SELECT id, balance FROM users WHERE id = ?',
      [userId]
    );

    console.log('User query result:', userExists);

    if (!userExists || userExists.length === 0) {
      console.log('User not found for ID:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    const userBalance = userExists[0].balance;
    
    // Get user's assets with LEFT JOIN to handle users with no assets
    const [assetRows] = await db.query(
      `SELECT 
        a.id AS assetId,
        a.name,
        a.symbol,
        a.type,
        a.price AS currentPrice,
        COALESCE(ua.quantity, 0) as quantity,
        COALESCE(ua.average_price, 0) as averagePrice
      FROM users u
      LEFT JOIN user_assets ua ON u.id = ua.user_id
      LEFT JOIN assets a ON ua.asset_id = a.id
      WHERE u.id = ? AND (ua.quantity > 0 OR ua.quantity IS NULL)`,
      [userId]
    );
    
    console.log('Asset rows:', assetRows);

    // Calculate total value
    const assetsValue = assetRows.reduce((sum, asset) => 
      sum + (asset.currentPrice * asset.quantity), 0
    );
    
    const totalValue = assetsValue + userBalance;
    
    res.json({
      assets: assetRows.filter(asset => asset.assetId != null),
      balance: userBalance,
      totalValue: totalValue
    });
    
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    res.status(500).json({ 
      message: 'Error fetching portfolio data',
      error: error.message 
    });
  }
});

// Process deposit
router.post('/deposit', async (req, res) => {
  const { userId, amount, method } = req.body;
  
  if (!userId || !amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid deposit details' });
  }
  
  try {
    // Update user balance
    await db.query(
      'UPDATE users SET balance = balance + ? WHERE id = ?',
      [amount, userId]
    );
    
    // Record the transaction
    await db.query(
      'INSERT INTO transactions (user_id, type, amount, payment_method, status) VALUES (?, ?, ?, ?, ?)',
      [userId, 'deposit', amount, method, 'completed']
    );
    
    res.json({ message: 'Deposit successful' });
    
  } catch (error) {
    console.error('Error processing deposit:', error);
    res.status(500).json({ message: 'Error processing deposit' });
  }
});

module.exports = router;
