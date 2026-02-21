const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    licenseExpiry: { type: Date, required: true },
    vehicleCategory: [{ type: String, enum: ['Truck', 'Van', 'Bike'] }],
    safetyScore: { type: Number, default: 100 },
    tripCompletionRate: { type: Number, default: 100 },
    complaints: { type: Number, default: 0 },
    status: { type: String, enum: ['Available', 'On Duty', 'Off Duty', 'Suspended', 'On Trip', 'Taking a Break'], default: 'Off Duty' },
    profilePhoto: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);
