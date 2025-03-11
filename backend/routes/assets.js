const express = require('express')
const router = express.Router()

module.exports = (con, asyncHandler) => {
  router.get(
    '/data',
    asyncHandler(async (req, res) => {
      con.query('SELECT * FROM assets', function (err, result) {
        if (err) {
          console.error('Database query error:', err)
          return res.status(500).json({
            error: 'Database query error',
            message: err.message,
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
    })
  )

  router.get(
    '/types',
    asyncHandler(async (req, res) => {
      con.query('SELECT DISTINCT type FROM assets', function (err, result) {
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
    })
  )

  router.get(
    '/trending',
    asyncHandler(async (req, res) => {
      const query = `
        SELECT a.*, COUNT(t.id) as trade_count
        FROM assets a
        LEFT JOIN trades t ON a.id = t.asset_id 
        WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY a.id
        ORDER BY trade_count DESC
        LIMIT 7
      `;

      con.query(query, function (err, result) {
        if (err) {
          console.error('Database query error:', err);
          return res.status(500).json({
            error: 'Database query error',
            message: err.message,
          });
        }

        if (!result || result.length === 0) {
          return res.json(null); // Return null if no trending asset found
        }

        res.json(result);
      });
    })
  )

  return router
}
