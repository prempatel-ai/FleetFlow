const express = require('express');
const { getDashboardStats, getVehicleAnalytics, getOverallAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);
router.get('/overall', protect, authorize('Manager', 'Financial Analyst'), getOverallAnalytics);
router.get('/vehicle/:id', protect, authorize('Manager', 'Financial Analyst'), getVehicleAnalytics);

module.exports = router;
