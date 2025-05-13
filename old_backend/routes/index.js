const express = require('express')
const router = express.Router()

/**
 * Main routes module
 * Configures all API routes
 */
module.exports = (pool, asyncHandler) => {
  // Authentication routes
  router.use('/auth', require('./auth')(pool, asyncHandler))
  
  // Admin routes
  router.use('/admin', require('./admin')(pool, asyncHandler))
  
  // User routes
  router.use('/user', require('./user')(pool, asyncHandler))
  
  // Assets routes
  router.use('/assets', require('./assets')(pool, asyncHandler))
  
  // Orders routes
  router.use('/orders', require('./orders')(pool, asyncHandler))

  /**
   * API Health Check
   * Returns current API status
   */
  router.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date(),
    })
  })

  return router
}
