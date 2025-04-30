const express = require('express')
const router = express.Router()
const priceUpdateService = require('../services/priceUpdateService'); // Import the service

/**
 * Assets routes module
 * Handles asset data retrieval and manipulation
 */
module.exports = (pool, asyncHandler) => {
  /**
   * Get All Assets
   * Returns the complete list of assets
   */
  router.get('/data', asyncHandler(async (req, res) => {
    pool.query('SELECT * FROM assets', function (err, result) {
      if (err) {
        console.error('Database query error:', err)
        return res.status(503).json({
          error: 'Database connection error',
          message: 'Database connection lost. Please try reconnecting.'
        })
      }

      if (!result || result.length === 0) {
        return res.status(404).json({
          error: 'No data found',
          message: 'The assets table is empty',
        })
      }

      res.json(result)
    })
  }))
  
  /**
   * Get Asset Types
   * Returns the distinct types of assets
   */
  router.get('/types', asyncHandler(async (req, res) => {
    pool.query('SELECT DISTINCT type FROM assets', function (err, result) {
      if (err) {
        console.error('Database query error:', err)
        return res.status(500).json({
          error: 'Database query error',
          message: err.message,
        })
      }

      if (!result || result.length === 0) {
        return res.status(404).json({
          error: 'No types found',
          message: 'The assets table has no types',
        })
      }

      const types = result.map((row) => row.type)
      res.json(types)
    })
  }))

  /**
   * Get Trending Assets
   * Returns a list of assets with recent trading activity
   */
  router.get('/trending', asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 5; // Default to top 5
    const days = parseInt(req.query.days) || 7; // Default to last 7 days

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

    pool.query(query, [days, limit], (err, results) => {
        if (err) {
            console.error("Error fetching trending assets:", err);
            return res.status(500).json({ message: "Error fetching trending assets", error: err.message });
        }
        res.json(results);
    });
  }));
  
  /**
   * Temporary email verification redirect handler
   * This catches incorrectly formatted verification URLs and redirects to the correct endpoint
   */
  router.get('/verify', asyncHandler(async (req, res) => {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({
        error: 'Missing token',
        message: 'Verification token is required'
      });
    }
    
    // Redirect to the correct verification endpoint
    res.redirect(`/api/verification/verify/${token}`);
  }));

  /**
   * Get Asset Statistics
   * Returns trade count, volume, and active assets
   */
  router.get('/stats', asyncHandler(async (req, res) => {
    const query = `
      SELECT 
        COUNT(DISTINCT t.id) as totalTrades,
        COALESCE(SUM(t.price * t.quantity), 0) as totalVolume,
        COUNT(DISTINCT a.id) as activeAssets
      FROM assets a
      LEFT JOIN trades t ON a.id = t.asset_id 
      WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        OR t.created_at IS NULL
    `

    pool.query(query, function (err, result) {
      if (err) {
        console.error('Database query error:', err)
        return res.status(500).json({
          error: 'Database query error',
          message: err.message,
        })
      }

      // If no results or empty data, return default values
      if (!result || result.length === 0) {
        return res.json({
          totalTrades: 0,
          totalVolume: 0,
          activeAssets: 0
        })
      }

      res.json({
        totalTrades: result[0].totalTrades || 0,
        totalVolume: result[0].totalVolume || 0,
        activeAssets: result[0].activeAssets || 0
      })
    })
  }))

  // New endpoint to get latest cached prices
  router.get('/prices', asyncHandler(async (req, res) => {
    // Optional: Allow requesting specific symbols via query param ?symbols=AAPL,MSFT
    const symbolsQuery = req.query.symbols;
    let symbols = [];
    if (symbolsQuery && typeof symbolsQuery === 'string') {
      symbols = symbolsQuery.split(',').map(s => s.trim()).filter(s => s);
    }

    const prices = priceUpdateService.getLatestPrices(symbols);
    res.json(prices);
  }));

  /**
   * Search Assets
   * Returns assets matching the search query
   */
  router.get('/search', asyncHandler(async (req, res) => {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
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
    
    pool.query(query, [searchPattern, searchPattern], (err, results) => {
      if (err) {
        console.error('Search query error:', err);
        return res.status(500).json({
          error: 'Database error',
          message: err.message
        });
      }
      res.json(results);
    });
  }));

/**
   * Get Single Asset
   * Returns details for a specific asset by ID
   */
  router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Asset ID must be a number'
      });
    }

    pool.query('SELECT * FROM assets WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('Asset fetch error:', err);
        return res.status(500).json({
          error: 'Database error',
          message: err.message
        });
      }

      if (!results || results.length === 0) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Asset not found'
        });
      }

      res.json(results[0]);
    });
  }));

  return router
}
