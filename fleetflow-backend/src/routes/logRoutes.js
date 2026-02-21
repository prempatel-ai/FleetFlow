const express = require('express');
const { addLog, getVehicleLogs, getAllLogs } = require('../controllers/logController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.route('/')
    .get(protect, getAllLogs)
    .post(protect, addLog);

router.get('/:vehicleId', protect, getVehicleLogs);

module.exports = router;
