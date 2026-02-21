const express = require('express');
const { getVehicles, addVehicle, updateVehicleStatus, deleteVehicle } = require('../controllers/vehicleController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const router = express.Router();

router.route('/')
    .get(protect, getVehicles)
    .post(protect, authorize('Manager'), addVehicle);

router.route('/:id/status')
    .patch(protect, updateVehicleStatus);

router.route('/:id')
    .delete(protect, authorize('Manager'), deleteVehicle);

module.exports = router;
