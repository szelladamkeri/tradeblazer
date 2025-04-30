const express = require('express')
const router = express.Router()

module.exports = (pool, asyncHandler) => {
  /**
   * Add asset to watchlist
   */
  router.post('/:assetId', asyncHandler(async (req, res) => {
    const { assetId } = req.params
    const { userId } = req.body

    if (!userId || !assetId) {
      return res.status(400).json({ 
        message: 'Missing required fields' 
      })
    }

    const query = 'INSERT INTO watchlist (user_id, asset_id) VALUES (?, ?)'
    
    pool.query(query, [userId, assetId], (err, result) => {
      if (err) {
        // Handle duplicate entry
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ 
            message: 'Asset already in watchlist' 
          })
        }
        return res.status(500).json({ 
          message: 'Database error',
          error: err.message 
        })
      }

      res.status(201).json({
        id: result.insertId,
        message: 'Asset added to watchlist'
      })
    })
  }))

  /**
   * Remove asset from watchlist
   */
  router.delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params

    pool.query('DELETE FROM watchlist WHERE id = ?', [id], (err) => {
      if (err) {
        return res.status(500).json({
          message: 'Failed to remove from watchlist',
          error: err.message
        })
      }
      res.json({ message: 'Removed from watchlist' })
    })
  }))

  /**
   * Get user's watchlist
   */
  router.get('/user/:userId', asyncHandler(async (req, res) => {
    const { userId } = req.params

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
        w.alert_triggered
      FROM watchlist w
      JOIN assets a ON w.asset_id = a.id
      WHERE w.user_id = ?
    `

    pool.query(query, [userId], (err, results) => {
      if (err) {
        return res.status(500).json({
          message: 'Failed to fetch watchlist',
          error: err.message
        })
      }
      res.json(results)
    })
  }))

  /**
   * Set price alert for watchlist item
   */
  router.post('/:id/alert', asyncHandler(async (req, res) => {
    const { id } = req.params
    const { alertPrice, alertType } = req.body

    if (!alertPrice || !alertType) {
      return res.status(400).json({ 
        message: 'Alert price and type are required' 
      })
    }

    const query = `
      UPDATE watchlist 
      SET alert_price = ?, 
          alert_type = ?,
          alert_triggered = 0
      WHERE id = ?
    `

    pool.query(query, [alertPrice, alertType, id], (err, result) => {
      if (err) {
        return res.status(500).json({
          message: 'Failed to set alert',
          error: err.message
        })
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: 'Watchlist item not found'
        })
      }

      res.json({
        message: 'Alert set successfully'
      })
    })
  }))

  /**
   * Remove price alert from watchlist item
   */
  router.delete('/:id/alert', asyncHandler(async (req, res) => {
    const { id } = req.params

    const query = `
      UPDATE watchlist 
      SET alert_price = NULL, 
          alert_type = NULL,
          alert_triggered = 0
      WHERE id = ?
    `

    pool.query(query, [id], (err, result) => {
      if (err) {
        return res.status(500).json({
          message: 'Failed to remove alert',
          error: err.message
        })
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: 'Watchlist item not found'
        })
      }

      res.json({
        message: 'Alert removed successfully'
      })
    })
  }))

  /**
   * Check if asset is in user's watchlist
   */
  router.get('/check/:userId/:assetId', asyncHandler(async (req, res) => {
    const { userId, assetId } = req.params

    const query = `
      SELECT id 
      FROM watchlist 
      WHERE user_id = ? AND asset_id = ?
    `

    pool.query(query, [userId, assetId], (err, results) => {
      if (err) {
        return res.status(500).json({
          message: 'Failed to check watchlist status',
          error: err.message
        })
      }

      res.json({
        isInWatchlist: results.length > 0,
        watchlistId: results[0]?.id || null
      })
    })
  }))

  return router
}
