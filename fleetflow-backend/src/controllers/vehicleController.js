const Vehicle = require('../models/Vehicle');

// @desc    Get all vehicles
// @route   GET /api/vehicles
const getVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({});
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add new vehicle
// @route   POST /api/vehicles
const addVehicle = async (req, res) => {
    const { name, model, licensePlate, type, maxCapacity, acquisitionCost, odometer } = req.body;
    try {
        const vehicle = await Vehicle.create({ name, model, licensePlate, type, maxCapacity, acquisitionCost, odometer });
        res.status(201).json(vehicle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update vehicle status
// @route   PATCH /api/vehicles/:id/status
const updateVehicleStatus = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (vehicle) {
            vehicle.status = req.body.status || vehicle.status;
            const updatedVehicle = await vehicle.save();
            res.json(updatedVehicle);
        } else {
            res.status(404).json({ message: 'Vehicle not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
        if (vehicle) {
            res.json({ message: 'Vehicle deleted successfully' });
        } else {
            res.status(404).json({ message: 'Vehicle not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getVehicles, addVehicle, updateVehicleStatus, deleteVehicle };
