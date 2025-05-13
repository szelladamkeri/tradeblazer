import { Router, Request, Response } from 'express';
import { Pool, RowDataPacket } from 'mysql2/promise';
import asyncHandler from 'express-async-handler';
import pool from '../db';

export const transactionsRouter = Router();

// Initialize transactions routes with the database pool
setupTransactionsRoutes(pool);

function setupTransactionsRoutes(pool: Pool) {
  /**
   * Get recent transactions for a user
   */
  transactionsRouter.get('/user/:userId/recent', asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    // Query to get recent transactions with asset details
    const query = `
      SELECT 
        t.id,
        t.user_id,
        t.type,
        t.amount,
        t.created_at
      FROM transactions t
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC
      LIMIT ?
    `;

    try {
      const [results] = await pool.query<RowDataPacket[]>(query, [userId, limit]);
      res.json(results);
    } catch (err: any) {
      res.status(500).json({
        message: 'Failed to fetch recent transactions',
        error: err.message
      });
    }
  }));

// Placeholder for transactions routes
transactionsRouter.get('/', (req, res) => {
    res.send('Transactions route placeholder');
});

    return transactionsRouter;
} 