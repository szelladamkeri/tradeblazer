import { Router, Request, Response } from 'express';
import { Pool, RowDataPacket } from 'mysql2/promise';
import asyncHandler from 'express-async-handler';
import pool from '../db';

export const watchlistRouter = Router();

// Initialize watchlist routes with the database pool
setupWatchlistRoutes(pool);

function setupWatchlistRoutes(pool: Pool) {
  /**
   * Add asset to watchlist
   */
  watchlistRouter.post('/:assetId', asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { assetId } = req.params;
    const { userId } = req.body;

    if (!userId || !assetId) {
      res.status(400).json({ 
        message: 'Missing required fields' 
      });
      return;
    }

    const query = 'INSERT INTO watchlist (user_id, asset_id) VALUES (?, ?)';
    
    try {
      const [result] = await pool.query(query, [userId, assetId]);
      res.status(201).json({
        id: (result as any).insertId,
        message: 'Asset added to watchlist'
      });
    } catch (err: any) {
      // Handle duplicate entry
      if (err.code === 'ER_DUP_ENTRY') {
        res.status(409).json({ 
          message: 'Asset already in watchlist' 
        });
        return;
      }
      res.status(500).json({ 
        message: 'Database error',
        error: err.message 
      });
    }
  }));

  /**
   * Remove asset from watchlist
   */
  watchlistRouter.delete('/:id', asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      await pool.query('DELETE FROM watchlist WHERE id = ?', [id]);
      res.json({ message: 'Removed from watchlist' });
    } catch (err: any) {
      res.status(500).json({
        message: 'Failed to remove from watchlist',
        error: err.message
      });
    }
  }));

  /**
   * Get user's watchlist
   */
  watchlistRouter.get('/user/:userId', asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;

    const query = `
      SELECT 
        w.id as watchlistId,
        a.id,
        a.name,
        a.symbol,
        a.type,
        a.price,
        w.alert_price,
        w.alert_type,
        w.alert_triggered,
        w.created_at
      FROM watchlist w
      JOIN assets a ON w.asset_id = a.id
      WHERE w.user_id = ?
    `;

    try {
      const [results] = await pool.query<RowDataPacket[]>(query, [userId]);
      res.json(results);
    } catch (err: any) {
      res.status(500).json({
        message: 'Failed to fetch watchlist',
        error: err.message
      });
    }
  }));

  /**
   * Set price alert for watchlist item
   */
  watchlistRouter.post('/:id/alert', asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { alertPrice, alertType } = req.body;

    if (!alertPrice || !alertType) {
      res.status(400).json({ 
        message: 'Alert price and type are required' 
      });
      return;
    }

    const query = `
      UPDATE watchlist 
      SET alert_price = ?, 
          alert_type = ?,
          alert_triggered = 0
      WHERE id = ?
    `;

    try {
      const [result] = await pool.query(query, [alertPrice, alertType, id]);
      if ((result as any).affectedRows === 0) {
        res.status(404).json({
          message: 'Watchlist item not found'
        });
        return;
      }
      res.json({
        message: 'Alert set successfully'
      });
    } catch (err: any) {
      res.status(500).json({
        message: 'Failed to set alert',
        error: err.message
      });
    }
  }));

  /**
   * Remove price alert from watchlist item
   */
  watchlistRouter.delete('/:id/alert', asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const query = `
      UPDATE watchlist 
      SET alert_price = NULL, 
          alert_type = NULL,
          alert_triggered = 0
      WHERE id = ?
    `;

    try {
      const [result] = await pool.query(query, [id]);
      if ((result as any).affectedRows === 0) {
        res.status(404).json({
          message: 'Watchlist item not found'
        });
        return;
      }
      res.json({
        message: 'Alert removed successfully'
      });
    } catch (err: any) {
      res.status(500).json({
        message: 'Failed to remove alert',
        error: err.message
      });
    }
  }));

  /**
   * Check if asset is in user's watchlist
   */
  watchlistRouter.get('/check/:userId/:assetId', asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId, assetId } = req.params;

    const query = `
      SELECT id 
      FROM watchlist 
      WHERE user_id = ? AND asset_id = ?
    `;

    try {
      const [results] = await pool.query<RowDataPacket[]>(query, [userId, assetId]);
      res.json({
        isInWatchlist: results.length > 0,
        watchlistId: results[0]?.id || null
      });
    } catch (err: any) {
      res.status(500).json({
        message: 'Failed to check watchlist status',
        error: err.message
      });
    }
  }));

  // Placeholder for watchlist routes
  watchlistRouter.get('/', (req, res) => {
    res.send('Watchlist route placeholder');
  });
} 