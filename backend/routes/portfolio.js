const express = require('express');
const router = express.Router();

// Export as a function that accepts the database connection
module.exports = (con, asyncHandler) => {
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
      con.query('SELECT id, balance FROM users WHERE id = ?', [userId], (err, userExists) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Database error', error: err.message });
        }

        console.log('User query result:', userExists);

        if (!userExists || userExists.length === 0) {
          console.log('User not found for ID:', userId);
          return res.status(404).json({ message: 'User not found' });
        }

        const userBalance = userExists[0].balance || 0;
        
        // Get user's assets - modified to match the database schema
        con.query(`
          SELECT 
            a.id AS assetId,
            a.name,
            a.symbol,
            a.type,
            a.price AS currentPrice,
            ua.quantity,
            0 as averagePrice
          FROM users u
          LEFT JOIN user_assets ua ON u.id = ua.user_id
          LEFT JOIN assets a ON ua.asset_id = a.id
          WHERE u.id = ?`, 
          [userId], 
          (err, assetRows) => {
            if (err) {
              console.error('Asset query error:', err);
              return res.status(500).json({ message: 'Error fetching assets', error: err.message });
            }
            
            console.log('Asset rows:', assetRows);

            // Filter valid assets and transform nulls to 0
            const validAssets = assetRows
              .filter(asset => asset.assetId != null)
              .map(asset => ({
                ...asset,
                quantity: asset.quantity || 0,
                currentPrice: asset.currentPrice || 0,
                averagePrice: 0 // Since there's no average_price in the schema
              }));

            // Calculate total value
            const assetsValue = validAssets.reduce((sum, asset) => 
              sum + (asset.currentPrice * asset.quantity), 0
            );
            
            const totalValue = assetsValue + userBalance;
            
            res.json({
              assets: validAssets,
              balance: userBalance,
              totalValue: totalValue
            });
          });
      });
    } catch (error) {
      console.error('Portfolio fetch error:', error);
      res.status(500).json({ 
        message: 'Error fetching portfolio data',
        error: error.message 
      });
    }
  });

  // Process deposit - modified to match the transactions table schema
  router.post('/deposit', async (req, res) => {
    const { userId, amount, method } = req.body;
    
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid deposit details' });
    }
    
    try {
      // Update user balance
      con.query('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, userId], (err, result) => {
        if (err) {
          console.error('Deposit error:', err);
          return res.status(500).json({ message: 'Error processing deposit', error: err.message });
        }
        
        // Record the transaction (adjusted to match schema)
        con.query('INSERT INTO transactions (user_id, type, amount) VALUES (?, ?, ?)',
          [userId, 'deposit', amount],
          (err) => {
            if (err) {
              console.error('Transaction record error:', err);
              return res.status(500).json({ message: 'Error recording transaction', error: err.message });
            }
            
            res.json({ message: 'Deposit successful' });
          });
      });
    } catch (error) {
      console.error('Error processing deposit:', error);
      res.status(500).json({ message: 'Error processing deposit' });
    }
  });

  return router;
};
