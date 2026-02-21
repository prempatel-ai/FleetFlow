const express = require('express');
const { createTrip, completeTrip, getTrips } = require('../controllers/tripController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const router = express.Router();

router.route('/')
    .get(protect, getTrips)
    .post(protect, authorize('Dispatcher', 'Manager'), createTrip);

router.route('/:id/complete')
    .patch(protect, completeTrip);

module.exports = router;
