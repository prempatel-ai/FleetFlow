const express = require('express');
const { getDrivers, addDriver, updateDriverStatus, updateDriver } = require('../controllers/driverController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const router = express.Router();

router.route('/')
    .get(protect, getDrivers)
    .post(protect, authorize('Manager', 'Safety Officer'), addDriver);

router.route('/:id')
    .patch(protect, authorize('Manager', 'Safety Officer'), updateDriver);

router.route('/:id/status')
    .patch(protect, updateDriverStatus);

module.exports = router;
