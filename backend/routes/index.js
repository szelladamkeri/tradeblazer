const express = require('express')
const router = express.Router()

module.exports = (con, asyncHandler) => {
  router.use('/auth', require('./auth')(con, asyncHandler))
  router.use('/admin', require('./admin')(con, asyncHandler))
  router.use('/user', require('./user')(con, asyncHandler))
  router.use('/assets', require('./assets')(con, asyncHandler))

  router.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date(),
    })
  })

  return router
}
