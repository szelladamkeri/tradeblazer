import { Router, Request, Response } from 'express';
import pool from '../db';
import * as priceUpdateService from '../services/priceUpdateService';

export const assetsRouter = Router();

/**
 * Get All Assets
 * Returns the complete list of assets
 */
assetsRouter.get('/data', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM assets') as [any[], any];
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        error: 'No data found',
        message: 'The assets table is empty',
      });
    }
    res.json(rows);
  } catch (err: unknown) {
    console.error('Database query error:', err);
    return res.status(503).json({
      error: 'Database connection error',
      message: 'Database connection lost. Please try reconnecting.'
    });
  }
});

/**
 * Get Asset Types
 * Returns the distinct types of assets
 */
assetsRouter.get('/types', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT type FROM assets') as [any[], any];
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        error: 'No types found',
        message: 'The assets table has no types',
      });
    }
    const types = rows.map((row: any) => row.type);
    res.json(types);
  } catch (err: unknown) {
    console.error('Database query error:', err);
    return res.status(500).json({
      error: 'Database query error',
      message: (err as Error).message,
    });
  }
});

/**
 * Get Trending Assets
 * Returns a list of assets with recent trading activity
 */
assetsRouter.get('/trending', async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 5; // Default to top 5
  const days = parseInt(req.query.days as string) || 7; // Default to last 7 days

  const query = `
    SELECT
      a.symbol,
      a.name,
      a.type,
      COUNT(t.id) AS trade_count
    FROM trades t
    JOIN assets a ON t.asset_id = a.id
    WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    GROUP BY a.id, a.symbol, a.name, a.type
    ORDER BY trade_count DESC
    LIMIT ?;
  `;

  try {
    const [rows] = await pool.query(query, [days, limit]) as [any[], any];
    res.json(rows);
  } catch (err: unknown) {
    console.error('Error fetching trending assets:', err);
    return res.status(500).json({ message: 'Error fetching trending assets', error: (err as Error).message });
  }
});

/**
 * Temporary email verification redirect handler
 * This catches incorrectly formatted verification URLs and redirects to the correct endpoint
 */
assetsRouter.get('/verify', async (req: Request, res: Response) => {
  const { token } = req.query;
  
  if (!token) {
    return res.status(400).json({
      error: 'Missing token',
      message: 'Verification token is required'
    });
  }
  
  // Redirect to the correct verification endpoint
  res.redirect(`/api/verification/verify/${token}`);
});

/**
 * Get Asset Statistics
 * Returns trade count, volume, and active assets
 */
assetsRouter.get('/stats', async (req: Request, res: Response) => {
  const query = `
    SELECT 
      COUNT(DISTINCT t.id) as totalTrades,
      COALESCE(SUM(t.price * t.quantity), 0) as totalVolume,
      COUNT(DISTINCT a.id) as activeAssets
    FROM assets a
    LEFT JOIN trades t ON a.id = t.asset_id 
    WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      OR t.created_at IS NULL
  `;

  try {
    const [rows] = await pool.query(query) as [any[], any];
    if (!rows || rows.length === 0) {
      return res.json({
        totalTrades: 0,
        totalVolume: 0,
        activeAssets: 0
      });
    }
    res.json({
      totalTrades: rows[0].totalTrades || 0,
      totalVolume: rows[0].totalVolume || 0,
      activeAssets: rows[0].activeAssets || 0
    });
  } catch (err: unknown) {
    console.error('Database query error:', err);
    return res.status(500).json({
      error: 'Database query error',
      message: (err as Error).message,
    });
  }
});

// New endpoint to get latest cached prices
assetsRouter.get('/prices', async (req: Request, res: Response) => {
  // Optional: Allow requesting specific symbols via query param ?symbols=AAPL,MSFT
  const symbolsQuery = req.query.symbols;
  let symbols: string[] = [];
  if (symbolsQuery && typeof symbolsQuery === 'string') {
    symbols = symbolsQuery.split(',').map(s => s.trim()).filter(s => s);
  }

  // Placeholder until priceUpdateService is fully implemented
  // const prices = priceUpdateService.getLatestPrices(symbols);
  const prices = {}; // Temporary placeholder
  res.json(prices);
});

/**
 * Search Assets
 * Returns assets matching the search query
 */
assetsRouter.get('/search', async (req: Request, res: Response) => {
  const { q } = req.query;
  
  if (!q || (typeof q === 'string' && q.length < 2)) {
    return res.status(400).json({
      error: 'Invalid search',
      message: 'Search query must be at least 2 characters long'
    });
  }

  const query = `
    SELECT * FROM assets 
    WHERE LOWER(name) LIKE LOWER(?) 
    OR LOWER(symbol) LIKE LOWER(?)
    LIMIT 10
  `;

  const searchPattern = `%${q}%`;
  
  try {
    const [rows] = await pool.query(query, [searchPattern, searchPattern]) as [any[], any];
    res.json(rows);
  } catch (err: unknown) {
    console.error('Search query error:', err);
    return res.status(500).json({
      error: 'Database error',
      message: (err as Error).message
    });
  }
});

/**
 * Single Asset API Endpoint
 * Returns details for a specific asset by ID
 */
assetsRouter.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({
      error: 'Invalid ID',
      message: 'Asset ID must be a valid number'
    });
  }

  const query = 'SELECT * FROM assets WHERE id = ?';
  
  try {
    const [rows] = await pool.query(query, [id]) as [any[], any];
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        error: 'Asset not found',
        message: `No asset found with ID ${id}`
      });
    }
    res.json(rows[0]);
  } catch (err: unknown) {
    console.error('Asset fetch error:', err);
    return res.status(500).json({
      error: 'Database error',
      message: (err as Error).message
    });
  }
}); 