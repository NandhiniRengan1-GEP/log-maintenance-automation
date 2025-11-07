const express = require('express');
const router = express.Router();
const AnalyticsService = require('../services/analyticsService');

const analyticsService = new AnalyticsService();

// BUG 13: Database connection leak
router.get('/dashboard', async (req, res, next) => {
  try {
    // BUG: Opens connection but never closes it
    const connection = await analyticsService.getConnection();
    
    const metrics = await connection.query('SELECT * FROM metrics');
    
    // Connection is never closed - memory leak
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

// BUG 14: Infinite loop potential
router.get('/process', async (req, res, next) => {
  try {
    const { maxIterations } = req.query;
    
    // BUG: maxIterations might be undefined or very large
    let i = 0;
    while (i < maxIterations) {
      await analyticsService.processChunk(i);
      i++;
      // Can cause server to hang if maxIterations is too large
    }
    
    res.json({ processed: i });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
