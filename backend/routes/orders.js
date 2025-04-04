const express = require('express')
const router = express.Router()

/**
 * Orders routes module
 * Handles order creation and retrieval
 */
module.exports = (pool, asyncHandler) => {
  /**
   * Get User Orders
   * Returns the orders for a specific user
   */
  router.get('/:userId', asyncHandler(async (req, res) => {
    const { userId } = req.params
    
    try {
      const query = `
        SELECT 
          o.id,
          o.trade_type AS tradeType,
          o.order_type AS orderType,
          o.quantity,
          o.price,
          o.status,
          o.created_at AS createdAt,
          a.symbol AS assetSymbol,
          a.name AS assetName
        FROM orders o
        JOIN assets a ON o.asset_id = a.id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
        LIMIT 20
      `
      
      pool.query(query, [userId], (err, rows) => {
        if (err) {
          console.error('Error getting orders:', err)
          return res.status(500).json({ message: 'Error retrieving orders' })
        }
        
        res.json(rows)
      })
      
    } catch (error) {
      console.error('Error getting orders:', error)
      res.status(500).json({ message: 'Error retrieving orders' })
    }
  }))

  /**
   * Create a new order
   * Processes market and limit orders with balance validation
   */
  router.post('/', asyncHandler(async (req, res) => {
    const { userId, assetId, tradeType, orderType, quantity, price } = req.body
    
    // Validate required fields
    if (!userId || !assetId || !tradeType || !orderType || !quantity) {
      return res.status(400).json({ message: 'Missing required order details' })
    }
    
    // Get a connection from the pool
    pool.getConnection(async (err, connection) => {
      if (err) {
        console.error('Database connection error:', err)
        return res.status(500).json({ message: 'Database connection error' })
      }
      
      try {
        // Start transaction
        await connection.beginTransaction()
        
        // Get asset price
        const [assetRows] = await connection.query(
          'SELECT price FROM assets WHERE id = ?',
          [assetId]
        )
        
        if (assetRows.length === 0) {
          await connection.rollback()
          connection.release()
          return res.status(404).json({ message: 'Asset not found' })
        }
        
        const assetPrice = assetRows[0].price
        
        // Get user balance
        const [userRows] = await connection.query(
          'SELECT balance FROM users WHERE id = ?',
          [userId]
        )
        
        if (userRows.length === 0) {
          await connection.rollback()
          connection.release()
          return res.status(404).json({ message: 'User not found' })
        }
        
        const userBalance = userRows[0].balance
        
        // Determine order price and status
        const orderPrice = orderType === 'market' ? assetPrice : price
        let orderStatus = 'completed' // Default for market orders
        
        // For limit orders, check if the price conditions are met
        if (orderType === 'limit') {
          if ((tradeType === 'buy' && assetPrice > orderPrice) || 
              (tradeType === 'sell' && assetPrice < orderPrice)) {
            orderStatus = 'pending'
          }
        }
        
        // For buy orders, check if user has enough balance
        if (tradeType === 'buy' && orderStatus === 'completed') {
          const totalCost = orderPrice * quantity
          
          if (totalCost > userBalance) {
            await connection.rollback()
            connection.release()
            return res.status(400).json({ message: 'Insufficient funds' })
          }
          
          // Deduct from user balance
          await connection.query(
            'UPDATE users SET balance = balance - ? WHERE id = ?',
            [totalCost, userId]
          )
        }
        
        // For sell orders, check if user has enough of the asset
        if (tradeType === 'sell' && orderStatus === 'completed') {
          const [userAssetRows] = await connection.query(
            'SELECT quantity FROM user_assets WHERE user_id = ? AND asset_id = ?',
            [userId, assetId]
          )
          
          if (userAssetRows.length === 0 || userAssetRows[0].quantity < quantity) {
            await connection.rollback()
            connection.release()
            return res.status(400).json({ message: 'Insufficient asset quantity' })
          }
        }
        
        // Create the order
        const [orderResult] = await connection.query(
          `INSERT INTO orders 
            (user_id, asset_id, trade_type, order_type, quantity, price, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [userId, assetId, tradeType, orderType, quantity, orderPrice, orderStatus]
        )
        
        // If order is completed, update user assets
        if (orderStatus === 'completed') {
          if (tradeType === 'buy') {
            // Check if user already owns the asset
            const [userAssetRows] = await connection.query(
              'SELECT * FROM user_assets WHERE user_id = ? AND asset_id = ?',
              [userId, assetId]
            )
            
            if (userAssetRows.length === 0) {
              // Create new user_asset entry
              await connection.query(
                'INSERT INTO user_assets (user_id, asset_id, quantity) VALUES (?, ?, ?)',
                [userId, assetId, quantity]
              )
            } else {
              // Update existing entry with new quantity
              const currentQuantity = userAssetRows[0].quantity
              const currentAvgPrice = userAssetRows[0].average_price || orderPrice
              const newTotalQuantity = currentQuantity + quantity
              const newAvgPrice = ((currentQuantity * currentAvgPrice) + (quantity * orderPrice)) / newTotalQuantity
              
              await connection.query(
                'UPDATE user_assets SET quantity = ?, average_price = ? WHERE user_id = ? AND asset_id = ?',
                [newTotalQuantity, newAvgPrice, userId, assetId]
              )
            }
          } else if (tradeType === 'sell') {
            // Get the current asset data
            const [userAssetRows] = await connection.query(
              'SELECT * FROM user_assets WHERE user_id = ? AND asset_id = ?',
              [userId, assetId]
            )
            
            const currentQuantity = userAssetRows[0].quantity
            const newQuantity = currentQuantity - quantity
            
            // Update user assets
            await connection.query(
              'UPDATE user_assets SET quantity = ? WHERE user_id = ? AND asset_id = ?',
              [newQuantity, userId, assetId]
            )
            
            // Add to user balance
            const sellValue = orderPrice * quantity
            await connection.query(
              'UPDATE users SET balance = balance + ? WHERE id = ?',
              [sellValue, userId]
            )
          }
        }
        
        // Create a trade record if the order was completed
        if (orderStatus === 'completed') {
          await connection.query(
            `INSERT INTO trades 
              (user_id, asset_id, trade_type, quantity, price)
            VALUES (?, ?, ?, ?, ?)`,
            [userId, assetId, tradeType, quantity, orderPrice]
          )
        }
        
        await connection.commit()
        connection.release()
        
        res.status(201).json({
          id: orderResult.insertId,
          status: orderStatus,
          message: orderStatus === 'completed' ? 'Order completed successfully' : 'Limit order placed successfully'
        })
        
      } catch (error) {
        await connection.rollback()
        connection.release()
        console.error('Error creating order:', error)
        res.status(500).json({ message: 'Error processing order' })
      }
    })
  }))

  return router
}
