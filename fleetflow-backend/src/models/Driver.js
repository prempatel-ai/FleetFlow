const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    licenseExpiry: { type: Date, required: true },
    vehicleCategory: [{ type: String, enum: ['Truck', 'Van', 'Bike'] }],
    safetyScore: { type: Number, default: 100 },
    tripCompletionRate: { type: Number, default: 100 },
    status: { type: String, enum: ['On Duty', 'Off Duty', 'Suspended', 'On Trip'], default: 'Off Duty' },
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);
