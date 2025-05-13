import { Router, Request, Response } from 'express';
import { Pool, RowDataPacket } from 'mysql2/promise';
import asyncHandler from 'express-async-handler';
import pool from '../db';

// Function to set up orders routes
function setupOrdersRoutes(db: Pool) {
  // Create router instance inside the function
  const router = Router();

  /**
   * Get User Orders
   * Returns the orders for a specific user
   */
  router.get('/:userId', asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    
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
      `;
      
      const [rows] = await db.query<RowDataPacket[]>(query, [userId]);
      
      // Map numeric status values to readable names for the client
      const ordersWithStatusNames = rows.map(row => ({
        ...row,
        statusName: row.status === 1 ? 'Completed' : row.status === 0 ? 'Pending' : 'Unknown'
      }));
      
      res.json(ordersWithStatusNames);
    } catch (error) {
      console.error('Error getting orders:', error);
      res.status(500).json({ message: 'Error retrieving orders' });
    }
  }));

  /**
   * Create a new order
   * Processes market and limit orders with balance validation
   */
  router.post('/', asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId, assetId, tradeType, orderType, quantity, price } = req.body;
    
    // Validate required fields - make price optional for market orders
    if (!userId || !assetId || !tradeType || !orderType || !quantity) {
      res.status(400).json({ message: 'Missing required order details' });
      return;
    }
    
    // Only require price for limit orders
    if (orderType === 'limit' && !price) {
      res.status(400).json({ message: 'Price is required for limit orders' });
      return;
    }
    
    // Get a connection from the pool
    const connection = await db.getConnection();
    
    try {
      // Start transaction
      await connection.beginTransaction();
      
      // Get asset price
      const [assetRows] = await connection.query<RowDataPacket[]>(
        'SELECT price FROM assets WHERE id = ?',
        [assetId]
      );
      
      if (assetRows.length === 0) {
        await connection.rollback();
        connection.release();
        res.status(404).json({ message: 'Asset not found' });
        return;
      }
      
      const assetPrice = assetRows[0].price;
      
      // Get user balance
      const [userRows] = await connection.query<RowDataPacket[]>(
        'SELECT balance FROM users WHERE id = ?',
        [userId]
      );
      
      if (userRows.length === 0) {
        await connection.rollback();
        connection.release();
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      const userBalance = userRows[0].balance;
      
      // Determine order price and status
      const orderPrice = orderType === 'market' ? assetPrice : price;
      let orderStatus = 1; // 1 = completed
      
      // For limit orders, check if the price conditions are met
      if (orderType === 'limit') {
        if ((tradeType === 'buy' && assetPrice > orderPrice) || 
            (tradeType === 'sell' && assetPrice < orderPrice)) {
          orderStatus = 0; // 0 = pending
        }
      }
      
      // For buy orders, check if user has enough balance
      if (tradeType === 'buy' && orderStatus === 1) {
        const totalCost = orderPrice * quantity;
        
        if (totalCost > userBalance) {
          await connection.rollback();
          connection.release();
          res.status(400).json({ message: 'Insufficient funds' });
          return;
        }
        
        // Deduct from user balance
        await connection.query(
          'UPDATE users SET balance = balance - ? WHERE id = ?',
          [totalCost, userId]
        );
      }
      
      // For sell orders, check if user has enough of the asset
      if (tradeType === 'sell' && orderStatus === 1) {
        const [userAssetRows] = await connection.query<RowDataPacket[]>(
          'SELECT quantity FROM user_assets WHERE user_id = ? AND asset_id = ?',
          [userId, assetId]
        );
        
        if (userAssetRows.length === 0 || userAssetRows[0].quantity < quantity) {
          await connection.rollback();
          connection.release();
          res.status(400).json({ message: 'Insufficient asset quantity' });
          return;
        }
      }
      
      // Create the order
      const [orderResult] = await connection.query<{ insertId: number } & RowDataPacket[]>(
        `INSERT INTO orders 
          (user_id, asset_id, trade_type, order_type, quantity, price, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, assetId, tradeType, orderType, quantity, orderPrice, orderStatus]
      );
      
      // If order is completed, update user assets
      if (orderStatus === 1) {
        if (tradeType === 'buy') {
          // Check if user already owns the asset
          const [userAssetRows] = await connection.query<RowDataPacket[]>(
            'SELECT * FROM user_assets WHERE user_id = ? AND asset_id = ?',
            [userId, assetId]
          );
          
          if (userAssetRows.length === 0) {
            // Create new user_asset entry
            await connection.query(
              'INSERT INTO user_assets (user_id, asset_id, quantity) VALUES (?, ?, ?)', 
              [userId, assetId, quantity]
            );
          } else {
            // Update existing entry with new quantity
            const currentQuantity = userAssetRows[0].quantity;
            const newTotalQuantity = currentQuantity + quantity;
            
            await connection.query(
              'UPDATE user_assets SET quantity = ? WHERE user_id = ? AND asset_id = ?',
              [newTotalQuantity, userId, assetId]
            );
          }
        } else if (tradeType === 'sell') {
          try {
            // Get the current asset data
            const [userAssetRows] = await connection.query<RowDataPacket[]>(
              'SELECT * FROM user_assets WHERE user_id = ? AND asset_id = ?',
              [userId, assetId]
            );
            
            if (userAssetRows.length === 0 || !userAssetRows[0]) {
              throw new Error('User asset not found');
            }
            
            const currentQuantity = userAssetRows[0].quantity;
            const newQuantity = currentQuantity - quantity;
            
            // Update user assets
            await connection.query(
              'UPDATE user_assets SET quantity = ? WHERE user_id = ? AND asset_id = ?',
              [newQuantity, userId, assetId]
            );
            
            // Add to user balance
            const sellValue = orderPrice * quantity;
            console.log(`Processing sell order: Adding ${sellValue} to user ${userId} balance from selling ${quantity} of asset ${assetId} at price ${orderPrice}`);
            
            // Get current balance for logging
            const [currentBalanceResult] = await connection.query<RowDataPacket[]>(
              'SELECT balance FROM users WHERE id = ?',
              [userId]
            );
            const currentBalance = currentBalanceResult[0]?.balance || 0;
            console.log(`Current user balance before update: ${currentBalance}`);
            
            // Update balance with detailed error handling
            try {
              const updateResult = await connection.query(
                'UPDATE users SET balance = balance + ? WHERE id = ?',
                [sellValue, userId]
              );
              
              console.log('Balance update result:', updateResult[0]);
              
              // Verify the update worked by checking balance again
              const [verifyBalanceResult] = await connection.query<RowDataPacket[]>(
                'SELECT balance FROM users WHERE id = ?',
                [userId]
              );
              const newBalance = verifyBalanceResult[0]?.balance || 0;
              console.log(`New user balance after update: ${newBalance}, expected: ${Number(currentBalance) + Number(sellValue)}`);
              
              if (newBalance !== Number(currentBalance) + Number(sellValue)) {
                console.warn(`Balance update verification failed. Expected ${Number(currentBalance) + Number(sellValue)}, got ${newBalance}`);
              }
            } catch (balanceUpdateError) {
              console.error('Error updating user balance:', balanceUpdateError);
              throw balanceUpdateError; // Re-throw to be caught by the outer catch block
            }
          } catch (error) {
            await connection.rollback();
            connection.release();
            console.error('Error processing sell order:', error);
            res.status(500).json({ message: 'Error processing sell order' });
            return;
          }
        }
        
        // Record transaction in the transactions table (suitable for both buy/sell)
        try {
          // First check if transactions table exists by querying structure
          const [tableCheck] = await connection.query(
            "SHOW TABLES LIKE 'transactions'"
          ) as any;
          
          if (tableCheck.length === 0) {
            // Transactions table doesn't exist, log error but don't fail the order
            console.warn('Transactions table does not exist, skipping transaction recording');
          } else {
            // Table exists, proceed with insert
            await connection.query(
              `INSERT INTO transactions 
                (user_id, type, amount) 
              VALUES (?, ?, ?)`,
              [userId, tradeType === 'buy' ? 'purchase' : 'sale', orderPrice * quantity]
            );
            console.log('Transaction recorded successfully');
          }
        } catch (error) {
          // Just log the error but don't fail the order if transaction recording fails
          console.error('Failed to record transaction:', error);
          console.error('Transaction data:', {
            userId,
            type: tradeType === 'buy' ? 'purchase' : 'sale',
            amount: orderPrice * quantity
          });
        }
      }
      
      // Commit transaction
      await connection.commit();
      connection.release();
      res.status(201).json({ 
        id: orderResult.insertId, 
        message: 'Order created successfully' 
      });
    } catch (error) {
      console.error('Error creating order - DETAILED ERROR:', error);
      console.error('Request body:', req.body);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
      
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Error during transaction rollback:', rollbackError);
      }
      
      connection.release();
      res.status(500).json({ message: 'Error creating order', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }));

  // Placeholder for orders routes
  router.get('/', (req, res) => {
    res.send('Orders route placeholder');
  });

  return router;
}

// Export the configured router
export const ordersRouter = setupOrdersRoutes(pool); 