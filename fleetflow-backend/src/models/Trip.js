const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    cargoWeight: { type: Number, required: true },
    startPoint: { type: String, required: true },
    endPoint: { type: String, required: true },
    status: { type: String, enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'], default: 'Draft' },
    dispatchDate: { type: Date },
    completionDate: { type: Date },
    startOdometer: { type: Number },
    endOdometer: { type: Number },
    revenue: { type: Number, default: 0 },
    fuelCost: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
