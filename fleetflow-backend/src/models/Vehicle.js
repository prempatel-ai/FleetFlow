const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    model: { type: String, required: true },
    licensePlate: { type: String, required: true, unique: true },
    type: { type: String, enum: ['Truck', 'Van', 'Bike'], required: true },
    maxCapacity: { type: Number, required: true }, // in kg
    status: { type: String, enum: ['Available', 'On Trip', 'In Shop', 'Out of Service'], default: 'Available' },
    odometer: { type: Number, default: 0 },
    acquisitionCost: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
