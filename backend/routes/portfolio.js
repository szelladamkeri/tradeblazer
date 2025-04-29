const express = require('express')
const router = express.Router()

/**
 * Portfolio routes module
 * Handles user portfolio data and transactions
 */
module.exports = (pool, asyncHandler) => {
  /**
   * Get User Portfolio
   * Returns the user's assets, balance, and total portfolio value
   */
  router.get('/:userId', asyncHandler(async (req, res) => {
    const { userId } = req.params
    console.log('Received portfolio request for userId:', userId)
    
    // Validate userId is a number
    if (isNaN(userId)) {
      console.log('Invalid userId format:', userId)
      return res.status(400).json({ message: 'Invalid user ID' })
    }
    
    try {
      // Check if user exists and get balance
      const userQuery = 'SELECT id, balance FROM users WHERE id = ?'
      
      pool.query(userQuery, [userId], (err, userResults) => {
        if (err) {
          console.error('Database error:', err)
          return res.status(500).json({ 
            message: 'Database error', 
            error: err.message 
          })
        }

        console.log('User query result:', userResults)

        if (!userResults || userResults.length === 0) {
          console.log('User not found for ID:', userId)
          return res.status(404).json({ message: 'User not found' })
        }

        const userBalance = userResults[0].balance || 0
        
        // Get user's assets with current prices
        const assetsQuery = `
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
          WHERE u.id = ?` 
        
        pool.query(assetsQuery, [userId], (err, assetRows) => {
          if (err) {
            console.error('Asset query error:', err)
            return res.status(500).json({ 
              message: 'Error fetching assets', 
              error: err.message 
            })
          }
            
          console.log('Asset rows:', assetRows)

          // Filter valid assets and transform nulls to 0
          const validAssets = assetRows
            .filter(asset => asset.assetId != null)
            .map(asset => ({
              ...asset,
              quantity: asset.quantity || 0,
              currentPrice: asset.currentPrice || 0,
              averagePrice: 0 // Since there's no average_price in the schema
            }))

          // Calculate total value
          const assetsValue = validAssets.reduce((sum, asset) => 
            sum + (asset.currentPrice * asset.quantity), 0
          )
            
          const totalValue = assetsValue + userBalance
            
          res.json({
            assets: validAssets,
            balance: userBalance,
            totalValue: totalValue
          })
        })
      })
    } catch (error) {
      console.error('Portfolio fetch error:', error)
      res.status(500).json({ 
        message: 'Error fetching portfolio data',
        error: error.message 
      })
    }
  }))

  /**
   * Process Deposit
   * Adds funds to user balance and records the transaction
   */
  router.post('/deposit', asyncHandler(async (req, res) => {
    const { userId, amount, method } = req.body
    
    // Validate input
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid deposit details' })
    }
    
    try {
      // Update user balance
      pool.query('UPDATE users SET balance = balance + ? WHERE id = ?', 
        [amount, userId], 
        (err, result) => {
          if (err) {
            console.error('Deposit DB Update error:', err)
            return res.status(500).json({ 
              message: 'Error processing deposit', 
              error: err.message 
            })
          }

          // Add logging to check the result of the UPDATE query
          console.log(`Deposit DB Update Result for userId ${userId}:`, result);
          if (result.affectedRows === 0) {
            console.warn(`Deposit Warning: User balance was not updated for userId ${userId}. User might not exist or ID is incorrect.`);
            // Decide if this should be an error - potentially the user ID was wrong
            // return res.status(404).json({ message: 'User not found for deposit update' });
          }
        
          // Record the transaction
          pool.query('INSERT INTO transactions (user_id, type, amount) VALUES (?, ?, ?)',
            [userId, 'deposit', amount],
            (err) => {
              if (err) {
                console.error('Transaction record error:', err)
                return res.status(500).json({ 
                  message: 'Error recording transaction', 
                  error: err.message 
                })
              }
            
              res.json({ message: 'Deposit successful' })
            })
        })
    } catch (error) {
      console.error('Error processing deposit:', error)
      res.status(500).json({ message: 'Error processing deposit' })
    }
  }))

  /**
   * Process Withdrawal
   * Removes funds from user balance if sufficient and records the transaction
   */
  router.post('/withdraw', asyncHandler(async (req, res) => {
    const { userId, amount } = req.body
    
    // Validate input
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid withdrawal details' })
    }
    
    try {
      // Check user balance first
      pool.query('SELECT balance FROM users WHERE id = ?', 
        [userId], 
        (err, results) => {
          if (err) {
            console.error('Balance check error:', err)
            return res.status(500).json({ 
              message: 'Error processing withdrawal', 
              error: err.message 
            })
          }
          
          if (!results || results.length === 0) {
            return res.status(404).json({ message: 'User not found' })
          }
          
          const balance = results[0].balance
          
          if (balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' })
          }
          
          // Update user balance
          pool.query('UPDATE users SET balance = balance - ? WHERE id = ?', 
            [amount, userId], 
            (err, result) => {
              if (err) {
                console.error('Withdrawal error:', err)
                return res.status(500).json({ 
                  message: 'Error processing withdrawal', 
                  error: err.message 
                })
              }
            
              // Record the transaction
              pool.query('INSERT INTO transactions (user_id, type, amount) VALUES (?, ?, ?)',
                [userId, 'withdrawal', amount],
                (err) => {
                  if (err) {
                    console.error('Transaction record error:', err)
                    return res.status(500).json({ 
                      message: 'Error recording transaction', 
                      error: err.message 
                    })
                  }
                
                  res.json({ message: 'Withdrawal successful' })
                })
            })
        })
    } catch (error) {
      console.error('Error processing withdrawal:', error)
      res.status(500).json({ message: 'Error processing withdrawal' })
    }
  }))

  return router
}
