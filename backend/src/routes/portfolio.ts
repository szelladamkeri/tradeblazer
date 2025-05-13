import { Router, Request, Response } from 'express';
import pool from '../db';

export const portfolioRouter = Router();

/**
 * Get User Portfolio
 * Returns the user's assets, balance, and total portfolio value
 */
portfolioRouter.get('/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;
  console.log('Received portfolio request for userId:', userId);
  
  // Validate userId is a number
  if (isNaN(Number(userId))) {
    console.log('Invalid userId format:', userId);
    return res.status(400).json({ message: 'Invalid user ID' });
  }
  
  try {
    // Check if user exists and get balance
    const userQuery = 'SELECT id, balance FROM users WHERE id = ?';
    const [userResults] = await pool.query(userQuery, [userId]) as [any[], any];
    
    console.log('User query result:', userResults);
    
    if (!userResults || userResults.length === 0) {
      console.log('User not found for ID:', userId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userBalance = userResults[0].balance || 0;
    
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
      WHERE u.id = ?`; 
    
    const [assetRows] = await pool.query(assetsQuery, [userId]) as [any[], any];
    
    console.log('Asset rows:', assetRows);
    
    // Filter valid assets and transform nulls to 0
    const validAssets = assetRows
      .filter(asset => asset.assetId != null && Number(asset.quantity) > 0)
      .map(asset => ({
        ...asset,
        quantity: Number(asset.quantity || 0),
        currentPrice: Number(asset.currentPrice || 0),
        averagePrice: 0 // Since there's no average_price in the schema
      }));
    
    // Calculate total value
    const assetsValue = validAssets.reduce((sum, asset) => {
      const assetValue = asset.currentPrice * asset.quantity;
      console.log(`Asset ${asset.symbol}: ${asset.quantity} x ${asset.currentPrice} = ${assetValue}`);
      return sum + assetValue;
    }, 0);
    
    const totalValue = assetsValue + Number(userBalance);
    console.log(`Portfolio calculation: Assets Value (${assetsValue}) + User Balance (${userBalance}) = Total Value (${totalValue})`);
    
    res.json({
      assets: validAssets,
      balance: Number(userBalance),
      totalValue: totalValue
    });
  } catch (error: unknown) {
    console.error('Portfolio fetch error:', error);
    res.status(500).json({ 
      message: 'Error fetching portfolio data',
      error: (error as Error).message 
    });
  }
});

/**
 * Process Deposit
 * Adds funds to user balance and records the transaction
 */
portfolioRouter.post('/deposit', async (req: Request, res: Response) => {
  const { userId, amount, method } = req.body;
  
  // Validate input
  if (!userId || !amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid deposit details' });
  }
  
  try {
    // Update user balance
    const [result] = await pool.query('UPDATE users SET balance = balance + ? WHERE id = ?', 
      [amount, userId]
    ) as [any, any];
    
    // Add logging to check the result of the UPDATE query
    console.log(`Deposit DB Update Result for userId ${userId}:`, result);
    if (result.affectedRows === 0) {
      console.warn(`Deposit Warning: User balance was not updated for userId ${userId}. User might not exist or ID is incorrect.`);
    }
    
    // Record the transaction
    await pool.query('INSERT INTO transactions (user_id, type, amount) VALUES (?, ?, ?)', 
      [userId, 'deposit', amount]
    );
    
    res.json({ message: 'Deposit successful' });
  } catch (error: unknown) {
    console.error('Error processing deposit:', error);
    res.status(500).json({ message: 'Error processing deposit' });
  }
});

/**
 * Process Withdrawal
 * Removes funds from user balance if sufficient and records the transaction
 */
portfolioRouter.post('/withdraw', async (req: Request, res: Response) => {
  const { userId, amount } = req.body;
  
  // Validate input
  if (!userId || !amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid withdrawal details' });
  }
  
  try {
    // Check user balance first
    const [results] = await pool.query('SELECT balance FROM users WHERE id = ?', 
      [userId]
    ) as [any[], any];
    
    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const balance = results[0].balance;
    
    if (balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    
    // Update user balance
    const [result] = await pool.query('UPDATE users SET balance = balance - ? WHERE id = ?', 
      [amount, userId]
    ) as [any, any];
    
    // Add logging to check the result of the UPDATE query
    console.log(`Withdrawal DB Update Result for userId ${userId}:`, result);
    if (result.affectedRows === 0) {
      console.warn(`Withdrawal Warning: User balance was not updated for userId ${userId}. User might not exist or ID is incorrect.`);
    }
    
    // Record the transaction
    await pool.query('INSERT INTO transactions (user_id, type, amount) VALUES (?, ?, ?)', 
      [userId, 'withdrawal', amount]
    );
    
    res.json({ message: 'Withdrawal successful' });
  } catch (error: unknown) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({ message: 'Error processing withdrawal' });
  }
}); 