const Log = require('../models/Log');
const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');

// @desc    Add Log (Fuel or Maintenance)
// @route   POST /api/logs
const addLog = async (req, res) => {
    const { vehicleId, type, amount, liters, description } = req.body;

    try {
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

        const log = await Log.create({
            vehicle: vehicleId,
            type,
            amount,
            liters,
            description
        });

        // Rule: If Maintenance log added, set vehicle to "In Shop"
        if (type === 'Maintenance') {
            vehicle.status = 'In Shop';
            await vehicle.save();
        }

        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logs for a vehicle
// @route   GET /api/logs/:vehicleId
const getVehicleLogs = async (req, res) => {
    try {
        const logs = await Log.find({ vehicle: req.params.vehicleId });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all logs for financials
// @route   GET /api/logs
const getAllLogs = async (req, res) => {
    try {
        const logs = await Log.find()
            .populate('vehicle', 'name licensePlate')
            .sort({ date: -1 });

        const totalSpend = logs.reduce((acc, curr) => acc + curr.amount, 0);
        const fuelVolume = logs.filter(l => l.type === 'Fuel').reduce((acc, curr) => acc + (curr.liters || 0), 0);

        // Calculate real distance from completed trips
        const completedTrips = await Trip.find({ status: 'Completed' });
        const totalDistance = completedTrips.reduce((acc, curr) => acc + (curr.endOdometer - curr.startOdometer || 0), 0);

        const avgCostPerKm = totalDistance > 0 ? (totalSpend / totalDistance).toFixed(2) : '0.00';

        res.json({
            logs,
            summary: {
                totalSpend,
                fuelVolume,
                avgCostPerKm
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addLog, getVehicleLogs, getAllLogs };
