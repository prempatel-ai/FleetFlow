const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    type: { type: String, enum: ['Fuel', 'Maintenance'], required: true },
    amount: { type: Number, required: true }, // Cost
    liters: { type: Number }, // For fuel logs
    description: { type: String }, // For maintenance logs
    date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Log', logSchema);
