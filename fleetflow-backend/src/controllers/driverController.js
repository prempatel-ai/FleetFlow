const Driver = require('../models/Driver');

// @desc    Get all drivers
// @route   GET /api/drivers
const getDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find({});
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add new driver
// @route   POST /api/drivers
const addDriver = async (req, res) => {
    const { name, licenseNumber, licenseExpiry, vehicleCategory, complaints } = req.body;
    try {
        const driver = await Driver.create({ name, licenseNumber, licenseExpiry, vehicleCategory, complaints });
        res.status(201).json(driver);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update driver status
// @route   PATCH /api/drivers/:id/status
const updateDriverStatus = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (driver) {
            driver.status = req.body.status || driver.status;
            const updatedDriver = await driver.save();
            res.json(updatedDriver);
        } else {
            res.status(404).json({ message: 'Driver not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update driver details
// @route   PATCH /api/drivers/:id
const updateDriver = async (req, res) => {
    const { name, licenseNumber, licenseExpiry, vehicleCategory, complaints } = req.body;
    try {
        const driver = await Driver.findById(req.params.id);
        if (driver) {
            driver.name = name || driver.name;
            driver.licenseNumber = licenseNumber || driver.licenseNumber;
            driver.licenseExpiry = licenseExpiry || driver.licenseExpiry;
            driver.vehicleCategory = vehicleCategory || driver.vehicleCategory;
            driver.complaints = complaints !== undefined ? complaints : driver.complaints;

            const updatedDriver = await driver.save();
            res.json(updatedDriver);
        } else {
            res.status(404).json({ message: 'Driver not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getDrivers, addDriver, updateDriverStatus, updateDriver };
