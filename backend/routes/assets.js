const express = require('express')
const router = express.Router()

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
    const query = `
      SELECT 
        a.*,
        COALESCE(
          (a.price - LAG(a.price) OVER (PARTITION BY a.id ORDER BY t.created_at)) / 
          LAG(a.price) OVER (PARTITION BY a.id ORDER BY t.created_at) * 100,
          0
        ) as change_24h
      FROM assets a
      LEFT JOIN trades t ON a.id = t.asset_id 
      WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY a.id
      ORDER BY RAND()
      LIMIT 3
    `
    
    pool.query(query, function (err, result) {
      if (err) {
        console.error('Database query error:', err)
        return res.status(500).json({
          error: 'Database query error',
          message: err.message,
        })
      }

      // If no results, return sample data
      if (!result || result.length === 0) {
        return res.json([
          { id: 1, symbol: 'BTC/USD', name: 'Bitcoin', price: 43123.45, change_24h: 2.45, type: 'crypto' },
          { id: 2, symbol: 'ETH/USD', name: 'Ethereum', price: 2234.56, change_24h: -1.23, type: 'crypto' },
          { id: 3, symbol: 'AAPL', name: 'Apple Inc.', price: 187.45, change_24h: 0.89, type: 'stock' }
        ])
      }

      res.json(result)
    })
  }))
  
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

  return router
}
