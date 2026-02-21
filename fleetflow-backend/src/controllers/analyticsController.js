const Log = require('../models/Log');
const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');

// @desc    Get system analytics (Dashboard KPIs)
// @route   GET /api/analytics/dashboard
const getDashboardStats = async (req, res) => {
    try {
        const totalVehicles = await Vehicle.countDocuments();
        const activeVehicles = await Vehicle.countDocuments({ status: 'On Trip' });
        const inShopVehicles = await Vehicle.countDocuments({ status: 'In Shop' });
        const idleVehicles = await Vehicle.countDocuments({ status: 'Available' });
        const outOfService = await Vehicle.countDocuments({ status: 'Out of Service' });

        // Calculate trends (comparing last 7 days vs previous 7 days)
        const now = new Date();
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const currentTrips = await Trip.countDocuments({ createdAt: { $gte: lastWeek } });
        const previousTrips = await Trip.countDocuments({ createdAt: { $gte: twoWeeksAgo, $lt: lastWeek } });
        const tripTrend = previousTrips > 0 ? ((currentTrips - previousTrips) / previousTrips * 100).toFixed(0) : (currentTrips > 0 ? 100 : 0);

        const currentLogs = await Log.countDocuments({ createdAt: { $gte: lastWeek } });
        const previousLogs = await Log.countDocuments({ createdAt: { $gte: twoWeeksAgo, $lt: lastWeek } });
        const logTrend = previousLogs > 0 ? ((currentLogs - previousLogs) / previousLogs * 100).toFixed(0) : (currentLogs > 0 ? 100 : 0);

        res.json({
            activeFleet: activeVehicles,
            maintenanceAlerts: inShopVehicles,
            utilizationRate: totalVehicles > 0 ? ((activeVehicles / totalVehicles) * 100).toFixed(2) : 0,
            idleVehicles,
            totalVehicles,
            outOfService,
            trends: {
                activeFleet: parseInt(tripTrend),
                maintenanceAlerts: parseInt(logTrend),
                utilizationRate: 0, // Set to 0 or calculate if needed
                idleVehicles: 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Overall Fleet Analytics (Charts/Trends)
// @route   GET /api/analytics/overall
const getOverallAnalytics = async (req, res) => {
    try {
        const vehicles = await Vehicle.find();

        // Date range filter
        const range = req.query.range ? parseInt(req.query.range) : null;
        const dateFilter = range ? { $gte: new Date(Date.now() - range * 24 * 60 * 60 * 1000) } : undefined;
        const logQuery = dateFilter ? { date: dateFilter } : {};
        const tripQuery = { status: 'Completed', ...(dateFilter ? { completionDate: dateFilter } : {}) };

        const logs = await Log.find(logQuery).sort({ date: 1 });
        const trips = await Trip.find(tripQuery);

        // 1. Utilization Breakdown
        const utilization = {
            active: vehicles.filter(v => v.status === 'On Trip').length,
            inShop: vehicles.filter(v => v.status === 'In Shop').length,
            available: vehicles.filter(v => v.status === 'Available').length,
            retired: vehicles.filter(v => v.status === 'Out of Service').length
        };

        // 2. Fuel Efficiency Trend (Monthly)
        const monthlyStats = {};
        logs.filter(l => l.type === 'Fuel' && l.liters > 0).forEach(log => {
            const month = log.date.toLocaleString('default', { month: 'short' });
            if (!monthlyStats[month]) monthlyStats[month] = { fuel: 0, distance: 0 };
            monthlyStats[month].fuel += log.liters;
        });

        // Map trips to months
        trips.forEach(trip => {
            if (trip.completionDate) {
                const month = trip.completionDate.toLocaleString('default', { month: 'short' });
                if (monthlyStats[month]) {
                    monthlyStats[month].distance += (trip.endOdometer - trip.startOdometer) || 0;
                }
            }
        });

        const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            .filter(m => monthlyStats[m]);

        const fuelTrend = labels.map(m => (monthlyStats[m].distance / monthlyStats[m].fuel).toFixed(2));

        // 3. ROI Table Data (Per Vehicle)
        const roiReport = await Promise.all(vehicles.map(async (v) => {
            const vLogs = logs.filter(l => l.vehicle.toString() === v._id.toString());
            const vTrips = trips.filter(t => t.vehicle.toString() === v._id.toString());

            const costs = vLogs.reduce((acc, curr) => acc + curr.amount, 0);
            const revenue = vTrips.reduce((acc, curr) => acc + (curr.revenue || 0), 0);

            return {
                id: v.name,
                acquisitionCost: v.acquisitionCost || 0,
                opCosts: costs,
                revenue: revenue.toFixed(2),
                roi: costs > 0 ? (revenue / costs).toFixed(2) : (revenue > 0 ? 'Inf' : 0)
            };
        }));

        // 4. Fleet-wide KPI Summary
        const totalFuelCost = logs.filter(l => l.type === 'Fuel').reduce((acc, l) => acc + l.amount, 0);
        const totalMaintenance = logs.filter(l => l.type === 'Maintenance').reduce((acc, l) => acc + l.amount, 0);
        const totalRevenue = trips.reduce((acc, t) => acc + (t.revenue || 0), 0);
        const totalOpCost = totalFuelCost + totalMaintenance;
        const overallROI = totalOpCost > 0 ? (((totalRevenue - totalOpCost) / totalOpCost) * 100).toFixed(1) : 0;
        const utilizationRate = vehicles.length > 0
            ? ((vehicles.filter(v => v.status === 'On Trip').length / vehicles.length) * 100).toFixed(1)
            : 0;

        // 5. Top 5 Costliest Vehicles (by total operational cost)
        const costliestVehicles = vehicles.map(v => {
            const vLogs = logs.filter(l => l.vehicle.toString() === v._id.toString());
            return { name: v.name, totalCost: vLogs.reduce((acc, l) => acc + l.amount, 0) };
        }).sort((a, b) => b.totalCost - a.totalCost).slice(0, 5);

        // 6. Monthly Financial Summary
        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyFinancialMap = {};
        trips.forEach(trip => {
            if (trip.completionDate) {
                const month = trip.completionDate.toLocaleString('default', { month: 'short' });
                if (!monthlyFinancialMap[month]) monthlyFinancialMap[month] = { revenue: 0, fuelCost: 0, maintenance: 0 };
                monthlyFinancialMap[month].revenue += trip.revenue || 0;
                monthlyFinancialMap[month].fuelCost += trip.fuelCost || 0;
            }
        });
        logs.filter(l => l.type === 'Maintenance').forEach(log => {
            const month = log.date.toLocaleString('default', { month: 'short' });
            if (!monthlyFinancialMap[month]) monthlyFinancialMap[month] = { revenue: 0, fuelCost: 0, maintenance: 0 };
            monthlyFinancialMap[month].maintenance += log.amount;
        });
        const monthlyFinancials = monthOrder
            .filter(m => monthlyFinancialMap[m])
            .map(m => ({
                month: m,
                revenue: monthlyFinancialMap[m].revenue,
                fuelCost: monthlyFinancialMap[m].fuelCost,
                maintenance: monthlyFinancialMap[m].maintenance,
                netProfit: monthlyFinancialMap[m].revenue - monthlyFinancialMap[m].fuelCost - monthlyFinancialMap[m].maintenance
            }));

        res.json({
            utilization,
            fuelTrend: { labels, data: fuelTrend },
            roiReport,
            kpis: { totalFuelCost, totalRevenue, totalMaintenance, overallROI, utilizationRate },
            costliestVehicles,
            monthlyFinancials
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get vehicle ROI & Efficiency
// @route   GET /api/analytics/vehicle/:id
const getVehicleAnalytics = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        const logs = await Log.find({ vehicle: req.params.id });
        const trips = await Trip.find({ vehicle: req.params.id, status: 'Completed' });

        const totalFuelCost = logs.filter(l => l.type === 'Fuel').reduce((acc, curr) => acc + curr.amount, 0);
        const totalMaintenanceCost = logs.filter(l => l.type === 'Maintenance').reduce((acc, curr) => acc + curr.amount, 0);
        const totalLiters = logs.filter(l => l.type === 'Fuel').reduce((acc, curr) => acc + (curr.liters || 0), 0);

        // Simple logic for efficiency: Total KM / Total Liters
        const totalDistance = trips.reduce((acc, curr) => acc + (curr.endOdometer - curr.startOdometer), 0);
        const fuelEfficiency = totalLiters > 0 ? (totalDistance / totalLiters).toFixed(2) : 0;

        res.json({
            vehicleName: vehicle.name,
            totalFuelCost,
            totalMaintenanceCost,
            fuelEfficiency, // km/L
            totalDistance
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats, getVehicleAnalytics, getOverallAnalytics };
