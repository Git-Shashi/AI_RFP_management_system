const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Get analytics dashboard data
router.get('/dashboard', analyticsController.getAnalyticsDashboard);

// Get RFP-specific analytics
router.get('/rfp/:id', analyticsController.getRFPAnalytics);

module.exports = router;
