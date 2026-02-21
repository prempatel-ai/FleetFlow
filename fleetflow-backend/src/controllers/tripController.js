const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');

// @desc    Assign and Dispatch a trip
// @route   POST /api/trips
const createTrip = async (req, res) => {
    const { vehicleId, driverId, cargoWeight, startPoint, endPoint } = req.body;

    try {
        const vehicle = await Vehicle.findById(vehicleId);
        const driver = await Driver.findById(driverId);

        if (!vehicle || !driver) {
            return res.status(404).json({ message: 'Vehicle or Driver not found' });
        }

        // Rule 1: Capacity Check
        if (cargoWeight > vehicle.maxCapacity) {
            return res.status(400).json({ message: `Cargo weight (${cargoWeight}kg) exceeds vehicle capacity (${vehicle.maxCapacity}kg)` });
        }

        // Rule 2: License Expiry Check
        if (new Date(driver.licenseExpiry) < new Date()) {
            return res.status(400).json({ message: 'Driver license has expired. Assignment blocked.' });
        }

        // Rule 3: Availability Check
        if (vehicle.status !== 'Available' || (driver.status !== 'On Duty' && driver.status !== 'Available')) {
            return res.status(400).json({ message: 'Vehicle or Driver is not available for assignment' });
        }

        const trip = await Trip.create({
            vehicle: vehicleId,
            driver: driverId,
            cargoWeight,
            startPoint,
            endPoint,
            status: 'Dispatched',
            dispatchDate: Date.now(),
            startOdometer: vehicle.odometer
        });

        // Update Statuses
        vehicle.status = 'On Trip';
        await vehicle.save();

        driver.status = 'On Trip';
        await driver.save();

        res.status(201).json(trip);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Complete a trip
// @route   PATCH /api/trips/:id/complete
const completeTrip = async (req, res) => {
    const { endOdometer } = req.body;

    try {
        const trip = await Trip.findById(req.params.id).populate('vehicle driver');
        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        trip.status = 'Completed';
        trip.completionDate = Date.now();
        trip.endOdometer = endOdometer;
        await trip.save();

        // Update Vehicle
        const vehicle = trip.vehicle;
        vehicle.status = 'Available';
        vehicle.odometer = endOdometer;
        await vehicle.save();

        // Update Driver
        const driver = trip.driver;
        driver.status = 'Available';
        await driver.save();

        res.json(trip);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all trips
// @route   GET /api/trips
const getTrips = async (req, res) => {
    try {
        const trips = await Trip.find({}).populate('vehicle driver');
        res.json(trips);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createTrip, completeTrip, getTrips };
