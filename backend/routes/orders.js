const express = require('express');
const router = express.Router();
const db = require('../db');

// Get user orders
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const [rows] = await db.query(
      `SELECT 
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
      LIMIT 20`,
      [userId]
    );
    
    res.json(rows);
    
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ message: 'Error retrieving orders' });
  }
});

// Create a new order
router.post('/', async (req, res) => {
  const { userId, assetId, tradeType, orderType, quantity, price } = req.body;
  
  if (!userId || !assetId || !tradeType || !orderType || !quantity) {
    return res.status(400).json({ message: 'Missing required order details' });
  }
  
  try {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Get asset current price
      const [assetRows] = await connection.query(
        'SELECT price FROM assets WHERE id = ?',
        [assetId]
      );
      
      if (assetRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Asset not found' });
      }
      
      const assetPrice = assetRows[0].price;
      
      // Get user balance
      const [userRows] = await connection.query(
        'SELECT balance FROM users WHERE id = ?',
        [userId]
      );
      
      if (userRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'User not found' });
      }
      
      const userBalance = userRows[0].balance;
      
      // For market orders, use current asset price
      const orderPrice = orderType === 'market' ? assetPrice : price;
      let orderStatus = 'completed'; // Default for market orders
      
      // For limit orders, check if the price conditions are met
      if (orderType === 'limit') {
        if ((tradeType === 'buy' && assetPrice > orderPrice) || 
            (tradeType === 'sell' && assetPrice < orderPrice)) {
          orderStatus = 'pending';
        }
      }
      
      // For buy orders, check if user has enough balance
      if (tradeType === 'buy' && orderStatus === 'completed') {
        const totalCost = orderPrice * quantity;
        
        if (totalCost > userBalance) {
          await connection.rollback();
          return res.status(400).json({ message: 'Insufficient funds' });
        }
        
        // Deduct from user balance
        await connection.query(
          'UPDATE users SET balance = balance - ? WHERE id = ?',
          [totalCost, userId]
        );
      }
      
      // For sell orders, check if user has enough of the asset
      if (tradeType === 'sell' && orderStatus === 'completed') {
        const [userAssetRows] = await connection.query(
          'SELECT quantity FROM user_assets WHERE user_id = ? AND asset_id = ?',
          [userId, assetId]
        );
        
        if (userAssetRows.length === 0 || userAssetRows[0].quantity < quantity) {
          await connection.rollback();
          return res.status(400).json({ message: 'Insufficient asset quantity' });
        }
      }
      
      // Create the order
      const [orderResult] = await connection.query(
        `INSERT INTO orders 
          (user_id, asset_id, trade_type, order_type, quantity, price, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, assetId, tradeType, orderType, quantity, orderPrice, orderStatus]
      );
      
      // If order is completed, update user assets
      if (orderStatus === 'completed') {
        if (tradeType === 'buy') {
          // Check if user already owns the asset
          const [userAssetRows] = await connection.query(
            'SELECT * FROM user_assets WHERE user_id = ? AND asset_id = ?',
            [userId, assetId]
          );
          
          if (userAssetRows.length === 0) {
            // Create new user_asset entry
            await connection.query(
              'INSERT INTO user_assets (user_id, asset_id, quantity, average_price) VALUES (?, ?, ?, ?)',
              [userId, assetId, quantity, orderPrice]
            );
          } else {
            // Update existing entry with new average price
            const currentQuantity = userAssetRows[0].quantity;
            const currentAvgPrice = userAssetRows[0].average_price;
            const newTotalQuantity = currentQuantity + quantity;
            const newAvgPrice = ((currentQuantity * currentAvgPrice) + (quantity * orderPrice)) / newTotalQuantity;
            
            await connection.query(
              'UPDATE user_assets SET quantity = ?, average_price = ? WHERE user_id = ? AND asset_id = ?',
              [newTotalQuantity, newAvgPrice, userId, assetId]
            );
          }
        } else if (tradeType === 'sell') {
          // Get the current asset data
          const [userAssetRows] = await connection.query(
            'SELECT * FROM user_assets WHERE user_id = ? AND asset_id = ?',
            [userId, assetId]
          );
          
          const currentQuantity = userAssetRows[0].quantity;
          const newQuantity = currentQuantity - quantity;
          
          // Update user assets
          await connection.query(
            'UPDATE user_assets SET quantity = ? WHERE user_id = ? AND asset_id = ?',
            [newQuantity, userId, assetId]
          );
          
          // Add to user balance
          const sellValue = orderPrice * quantity;
          await connection.query(
            'UPDATE users SET balance = balance + ? WHERE id = ?',
            [sellValue, userId]
          );
        }
      }
      
      await connection.commit();
      
      res.status(201).json({
        id: orderResult.insertId,
        status: orderStatus,
        message: orderStatus === 'completed' ? 'Order completed successfully' : 'Limit order placed successfully'
      });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error processing order' });
  }
});

module.exports = router;
