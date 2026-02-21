'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Activity,
    Wrench,
    BarChart,
    Package,
    ArrowUpRight,
    ArrowDownRight,
    AlertTriangle,
    UserRoundX,
    Search,
    Filter,
    ArrowUpDown,
    Plus,
    Calendar,
    ChevronRight,
    MoreHorizontal,
    Navigation,
    User,
    X,
    MapPin,
    Scale,
    AlertCircle,
    Map as MapIcon,
    Truck,
    CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import { Vehicle, Driver, Trip } from '../../types';

// StatCard Component with Premium Design
interface StatCardProps {
    title: string;
    value: string | number;
    subValue?: string;
    icon: React.ElementType;
    colorClass: string;
    trend?: number;
    delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subValue, icon: Icon, colorClass, trend, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="glass rounded-[32px] p-6 relative overflow-hidden group cursor-default h-full"
    >
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
            <Icon size={120} />
        </div>

        <div className="flex items-start justify-between mb-6 relative z-10">
            <div className={`p-4 rounded-2xl ${colorClass} shadow-lg shadow-current/10 group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={24} className="text-white" />
            </div>
            {trend !== undefined && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold glass-sm ${trend >= 0 ? 'text-success bg-success/5' : 'text-danger bg-danger/5'}`}>
                    {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    <span className="mb-[1px]">{Math.abs(trend)}%</span>
                </div>
            )}
        </div>

        <div className="relative z-10">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">{title}</h3>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{value}</span>
                {subValue && <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{subValue}</span>}
            </div>
        </div>
    </motion.div>
);

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
    const getStatusStyles = () => {
        switch (status) {
            case 'In Transit':
            case 'Dispatched':
                return 'bg-primary/10 text-primary border-primary/20';
            case 'Completed':
                return 'bg-success/10 text-success border-success/20';
            case 'Cancelled':
                return 'bg-danger/10 text-danger border-danger/20';
            case 'Draft':
            case 'Scheduled':
                return 'bg-slate-100 text-slate-500 border-slate-200';
            default:
                return 'bg-slate-50 text-slate-400 border-slate-100';
        }
    };

    return (
        <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusStyles()}`}>
            {status}
        </span>
    );
};

interface DashboardStats {
    activeFleet: number;
    maintenanceAlerts: number;
    utilizationRate: number;
    idleVehicles: number;
    trends?: {
        activeFleet: number;
        maintenanceAlerts: number;
        utilizationRate: number;
        idleVehicles: number;
    };
}

interface AlertItem {
    id: string;
    title: string;
    description: string;
    type: 'maintenance' | 'license';
    severity: 'critical' | 'warning';
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        activeFleet: 0,
        maintenanceAlerts: 0,
        utilizationRate: 0,
        idleVehicles: 0
    });
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
    const [typeFilter, setTypeFilter] = useState<'All' | 'Truck' | 'Van'>('All');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Ready' | 'Busy'>('All');
    const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);
    const [activePopover, setActivePopover] = useState<'type' | 'status' | 'sort' | null>(null);

    // Form States
    const [showTripModal, setShowTripModal] = useState(false);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [formError, setFormError] = useState('');
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);

    const [newTrip, setNewTrip] = useState({
        vehicleId: '',
        driverId: '',
        cargoWeight: '',
        startPoint: '',
        endPoint: '',
        revenue: ''
    });

    const [newVehicle, setNewVehicle] = useState({
        name: '',
        model: '',
        licensePlate: '',
        type: 'Truck',
        maxCapacity: '',
        acquisitionCost: ''
    });

    const fetchDashboardData = async () => {
        try {
            const [statsRes, vehiclesRes, driversRes, tripsRes] = await Promise.all([
                api.get('/analytics/dashboard'),
                api.get('/vehicles'),
                api.get('/drivers'),
                api.get('/trips')
            ]);

            const vehiclesData: Vehicle[] = vehiclesRes.data;
            const tripsData: Trip[] = tripsRes.data;
            const driversData: Driver[] = driversRes.data;

            setVehicles(vehiclesData);
            setDrivers(driversData);

            // KPI Alignment with Mock Logic
            const activeFleetCount = vehiclesData.filter(v => v.status === 'On Trip').length;
            const maintenanceAlertsCount = vehiclesData.filter(v => v.status === 'In Shop').length;
            const pendingCargoCount = tripsData.filter(t => t.status === 'Draft' || t.status === 'Dispatched').length;
            const utilizationRateValue = vehiclesData.length > 0 ? Math.round((activeFleetCount / vehiclesData.length) * 100) : 0;

            setStats({
                activeFleet: activeFleetCount,
                maintenanceAlerts: maintenanceAlertsCount,
                utilizationRate: utilizationRateValue,
                idleVehicles: pendingCargoCount
            });

            setTrips(tripsData);

            const proactiveAlerts: AlertItem[] = [];
            vehiclesData.forEach((v: Vehicle) => {
                if (v.odometer && v.odometer > 15000 && v.status !== 'In Shop') {
                    proactiveAlerts.push({
                        id: `v-${v._id}`,
                        title: `Maintenance: ${v.name}`,
                        description: `Odometer at ${v.odometer}km. Inspection overdue.`,
                        type: 'maintenance',
                        severity: v.odometer > 20000 ? 'critical' : 'warning'
                    });
                }
            });

            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
            driversData.forEach((d: Driver) => {
                if (d.licenseExpiry) {
                    const expiry = new Date(d.licenseExpiry);
                    if (expiry < thirtyDaysFromNow) {
                        proactiveAlerts.push({
                            id: `d-${d._id}`,
                            title: `Expiring: ${d.name}'s License`,
                            description: `Renewal required by ${expiry.toLocaleDateString()}.`,
                            type: 'license',
                            severity: expiry < new Date() ? 'critical' : 'warning'
                        });
                    }
                }
            });

            setAlerts(proactiveAlerts);
        } catch (err) {
            console.error('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleCreateTrip = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        try {
            await api.post('/trips', newTrip);
            setShowTripModal(false);
            setNewTrip({ vehicleId: '', driverId: '', cargoWeight: '', startPoint: '', endPoint: '', revenue: '' });
            setShowSuccessToast('Trip dispatched successfully!');
            setTimeout(() => setShowSuccessToast(null), 3000);
            fetchDashboardData();
        } catch (err: any) {
            setFormError(err.response?.data?.message || 'Failed to dispatch trip');
        }
    };

    const handleAddVehicle = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        try {
            await api.post('/vehicles', newVehicle);
            setShowVehicleModal(false);
            setNewVehicle({ name: '', model: '', licensePlate: '', type: 'Truck', maxCapacity: '', acquisitionCost: '' });
            setShowSuccessToast('Vehicle registered successfully!');
            setTimeout(() => setShowSuccessToast(null), 3000);
            fetchDashboardData();
        } catch (err: any) {
            setFormError(err.response?.data?.message || 'Failed to add vehicle');
        }
    };

    const filteredTrips = useMemo(() => {
        let result = trips.filter(trip =>
            trip._id?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
            trip.vehicle?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            trip.driver?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            trip.startPoint?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            trip.endPoint?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (typeFilter !== 'All') {
            result = result.filter(trip => trip.vehicle?.type === typeFilter);
        }

        if (statusFilter !== 'All') {
            if (statusFilter === 'Ready') result = result.filter(trip => trip.status === 'Completed' || trip.status === 'Cancelled');
            if (statusFilter === 'Busy') result = result.filter(trip => trip.status === 'Dispatched' || trip.status === 'In Transit');
        }

        return result.sort((a, b) => {
            const dateA = new Date(a.dispatchDate).getTime();
            const dateB = new Date(b.dispatchDate).getTime();
            return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
        }).slice(0, 7);
    }, [trips, searchQuery, sortBy, typeFilter, statusFilter]);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <Layout>
            <div className="space-y-12">
                {/* Toast Notification */}
                <AnimatePresence>
                    {showSuccessToast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="fixed bottom-10 right-10 z-[100] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm border border-white/10"
                        >
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            {showSuccessToast}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header Section with Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            Fleet Terminal
                            <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse shrink-0" />
                        </h1>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">Precision Logistics Control</p>
                    </motion.div>

                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowScheduleModal(true)}
                            className="p-3.5 glass hover:bg-slate-50 transition-colors rounded-2xl text-slate-600 shadow-sm border border-slate-200/50"
                        >
                            <Calendar size={20} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                setFormError('');
                                setShowTripModal(true);
                            }}
                            className="bg-primary hover:bg-primary/90 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-primary/20 transition-all text-sm tracking-tight"
                        >
                            <Plus size={20} />
                            New Trip
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                setFormError('');
                                setShowVehicleModal(true);
                            }}
                            className="glass hover:bg-slate-50 text-slate-700 px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-sm border border-slate-200/50 transition-all text-sm tracking-tight"
                        >
                            <Plus size={20} />
                            New Vehicle
                        </motion.button>
                    </div>
                </div>

                {/* Modals */}
                <AnimatePresence>
                    {showTripModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[110]"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-white rounded-[32px] shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Initialize Shipment</h2>
                                    <button onClick={() => setShowTripModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                        <X size={20} className="text-slate-400" />
                                    </button>
                                </div>

                                {formError && (
                                    <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-2xl flex items-start gap-3 text-danger text-xs font-bold">
                                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                        {formError}
                                    </div>
                                )}

                                <form onSubmit={handleCreateTrip} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Vehicle Asset</label>
                                            <div className="relative">
                                                <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                <select
                                                    required
                                                    value={newTrip.vehicleId}
                                                    onChange={e => setNewTrip({ ...newTrip, vehicleId: e.target.value })}
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                                >
                                                    <option value="">Select Asset</option>
                                                    {vehicles.filter(v => v.status === 'Available').map(v => (
                                                        <option key={v._id} value={v._id}>{v.name} ({v.maxCapacity}kg)</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Fleet Operator</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                <select
                                                    required
                                                    value={newTrip.driverId}
                                                    onChange={e => setNewTrip({ ...newTrip, driverId: e.target.value })}
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                                >
                                                    <option value="">Select Driver</option>
                                                    {drivers.filter(d => d.status === 'Available' || d.status === 'On Duty').map(d => (
                                                        <option key={d._id} value={d._id}>{d.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Cargo Weight (KG)</label>
                                        <div className="relative">
                                            <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                            <input
                                                type="number"
                                                required
                                                value={newTrip.cargoWeight}
                                                onChange={e => setNewTrip({ ...newTrip, cargoWeight: e.target.value })}
                                                className="w-full pl-11 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                                placeholder="Enter payload mass"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Point of Origin</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                <input
                                                    required
                                                    value={newTrip.startPoint}
                                                    onChange={e => setNewTrip({ ...newTrip, startPoint: e.target.value })}
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                                    placeholder="Mumbai Hub"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Final Destination</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                <input
                                                    required
                                                    value={newTrip.endPoint}
                                                    onChange={e => setNewTrip({ ...newTrip, endPoint: e.target.value })}
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                                    placeholder="Pune Center"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Contract Revenue (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-success font-black text-sm">₹</span>
                                            <input
                                                type="number"
                                                required
                                                value={newTrip.revenue}
                                                onChange={e => setNewTrip({ ...newTrip, revenue: e.target.value })}
                                                className="w-full pl-10 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-success font-black text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowTripModal(false)}
                                            className="flex-1 py-4 border-2 border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-4 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            <MapIcon size={16} />
                                            Dispatch Now
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}

                    {showVehicleModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[110]"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-white rounded-[32px] shadow-2xl max-w-md w-full p-8"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Register Asset</h2>
                                    <button onClick={() => setShowVehicleModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                        <X size={20} className="text-slate-400" />
                                    </button>
                                </div>

                                {formError && (
                                    <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-2xl flex items-start gap-3 text-danger text-xs font-bold">
                                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                        {formError}
                                    </div>
                                )}

                                <form onSubmit={handleAddVehicle} className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Vehicle Identity</label>
                                        <div className="relative">
                                            <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                            <input
                                                required
                                                value={newVehicle.name}
                                                onChange={e => setNewVehicle({ ...newVehicle, name: e.target.value })}
                                                className="w-full pl-11 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                                placeholder="e.g. Atlas-01"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">License Plate</label>
                                            <div className="relative">
                                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                <input
                                                    required
                                                    value={newVehicle.licensePlate}
                                                    onChange={e => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none font-mono uppercase"
                                                    placeholder="MH-12-AB"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Fleet Category</label>
                                            <select
                                                value={newVehicle.type}
                                                onChange={e => setNewVehicle({ ...newVehicle, type: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                            >
                                                <option>Truck</option>
                                                <option>Van</option>
                                                <option>Bike</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Max Payload (KG)</label>
                                        <div className="relative">
                                            <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                            <input
                                                type="number"
                                                required
                                                value={newVehicle.maxCapacity}
                                                onChange={e => setNewVehicle({ ...newVehicle, maxCapacity: e.target.value })}
                                                className="w-full pl-11 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                                placeholder="1500"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowVehicleModal(false)}
                                            className="flex-1 py-4 border-2 border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-800 shadow-xl shadow-slate-900/20 transition-all"
                                        >
                                            Register
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                    {showScheduleModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[110]"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-white rounded-[32px] shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mission Schedule</h2>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Timeline of Fleet Operations</p>
                                    </div>
                                    <button onClick={() => setShowScheduleModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                        <X size={20} className="text-slate-400" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {trips.length === 0 ? (
                                        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 italic text-slate-400 font-bold text-sm">
                                            No missions scheduled for this period.
                                        </div>
                                    ) : (
                                        [...trips].sort((a, b) => new Date(b.dispatchDate).getTime() - new Date(a.dispatchDate).getTime()).map((trip, idx) => (
                                            <div key={trip._id} className="relative pl-8 pb-8 group last:pb-0">
                                                {idx !== trips.length - 1 && (
                                                    <div className="absolute left-3.5 top-8 bottom-0 w-0.5 bg-slate-100 group-hover:bg-primary/20 transition-colors" />
                                                )}
                                                <div className={`absolute left-0 top-1.5 w-7 h-7 rounded-full border-4 border-white shadow-lg flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${trip.status === 'In Transit' || trip.status === 'Dispatched' ? 'bg-primary' :
                                                    trip.status === 'Completed' ? 'bg-success' : 'bg-slate-200'
                                                    }`}>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                                </div>
                                                <div className="glass p-5 rounded-2xl border border-slate-100 hover:border-primary/20 transition-all">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">
                                                            {new Date(trip.dispatchDate).toLocaleDateString()} at {new Date(trip.dispatchDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <StatusPill status={trip.status} />
                                                    </div>
                                                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                                        {trip.startPoint} <ChevronRight size={14} className="text-primary" /> {trip.endPoint}
                                                    </h4>
                                                    <div className="mt-3 flex items-center gap-4 text-[11px] font-bold text-slate-500 italic">
                                                        <div className="flex items-center gap-1.5"><Truck size={12} /> {trip.vehicle?.name}</div>
                                                        <div className="flex items-center gap-1.5"><User size={12} /> {trip.driver?.name}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <button
                                    onClick={() => setShowScheduleModal(false)}
                                    className="w-full mt-8 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all"
                                >
                                    Dismiss Timeline
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Top Toolbar - Search & Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass p-3 rounded-[28px] flex flex-col md:flex-row gap-4 items-center shadow-lg border-white/50 relative z-[100]"
                >
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" size={20} />
                        <input
                            type="text"
                            placeholder="Find Trip ID, Vehicle, or Driver name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            spellCheck={false}
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 placeholder:text-slate-400 font-semibold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto flex-wrap md:flex-nowrap pb-4 md:pb-0 scrollbar-hide">
                        {/* Type Filter Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setActivePopover(activePopover === 'type' ? null : 'type')}
                                className={`flex items-center gap-3 px-6 py-4 glass hover:bg-slate-50 rounded-2xl font-bold text-[13px] whitespace-nowrap transition-all border ${activePopover === 'type' ? 'ring-4 ring-primary/5 border-primary/20' : ''} ${typeFilter !== 'All' ? 'text-primary border-primary/20 bg-primary/5' : 'text-slate-600 border-slate-100'}`}
                            >
                                <Filter size={18} className={typeFilter !== 'All' ? 'text-primary' : 'text-slate-400'} />
                                {typeFilter === 'All' ? 'Group by' : `Type: ${typeFilter}s`}
                                <motion.div
                                    animate={{ rotate: activePopover === 'type' ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronRight size={14} className="rotate-90 text-slate-400" />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {activePopover === 'type' && (
                                    <>
                                        <div className="fixed inset-0 z-[115]" onClick={() => setActivePopover(null)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute left-0 top-full mt-4 w-60 glass rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/50 p-2.5 z-[200] overflow-hidden"
                                        >
                                            {(['All', 'Truck', 'Van'] as const).map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => {
                                                        setTypeFilter(type);
                                                        setActivePopover(null);
                                                    }}
                                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all font-bold text-xs flex items-center justify-between ${typeFilter === type ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                                                >
                                                    {type === 'All' ? 'All Assets' : `${type}s`}
                                                    {typeFilter === type && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                                </button>
                                            ))}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Status Filter Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setActivePopover(activePopover === 'status' ? null : 'status')}
                                className={`flex items-center gap-3 px-6 py-4 glass hover:bg-slate-50 rounded-2xl font-bold text-[13px] whitespace-nowrap transition-all border ${activePopover === 'status' ? 'ring-4 ring-primary/5 border-primary/20' : ''} ${statusFilter !== 'All' ? 'text-primary border-primary/20 bg-primary/5' : 'text-slate-600 border-slate-100'}`}
                            >
                                <Activity size={18} className={statusFilter !== 'All' ? 'text-primary' : 'text-slate-400'} />
                                {statusFilter === 'All' ? 'Filter' : `Status: ${statusFilter}`}
                                <motion.div
                                    animate={{ rotate: activePopover === 'status' ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronRight size={14} className="rotate-90 text-slate-400" />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {activePopover === 'status' && (
                                    <>
                                        <div className="fixed inset-0 z-[115]" onClick={() => setActivePopover(null)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute left-0 top-full mt-4 w-60 glass rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/50 p-2.5 z-[200] overflow-hidden"
                                        >
                                            {(['All', 'Ready', 'Busy'] as const).map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => {
                                                        setStatusFilter(status);
                                                        setActivePopover(null);
                                                    }}
                                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all font-bold text-xs flex items-center justify-between ${statusFilter === status ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                                                >
                                                    {status === 'All' ? 'All Statuses' : status === 'Ready' ? 'Ready for Dispatch' : 'Busy / In Transit'}
                                                    {statusFilter === status && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                                </button>
                                            ))}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setActivePopover(activePopover === 'sort' ? null : 'sort')}
                                className={`flex items-center gap-3 px-6 py-4 glass hover:bg-slate-50 rounded-2xl font-bold text-[13px] whitespace-nowrap transition-all border ${activePopover === 'sort' ? 'ring-4 ring-primary/5 border-primary/20' : ''} ${sortBy === 'oldest' ? 'text-primary border-primary/20 bg-primary/5' : 'text-slate-600 border-slate-100'}`}
                            >
                                <ArrowUpDown size={18} className={sortBy === 'oldest' ? 'text-primary' : 'text-slate-400'} />
                                {sortBy === 'newest' ? 'Sort by...' : 'Order: Oldest'}
                                <motion.div
                                    animate={{ rotate: activePopover === 'sort' ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronRight size={14} className="rotate-90 text-slate-400" />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {activePopover === 'sort' && (
                                    <>
                                        <div className="fixed inset-0 z-[115]" onClick={() => setActivePopover(null)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute left-0 top-full mt-4 w-60 glass rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/50 p-2.5 z-[200] overflow-hidden"
                                        >
                                            {(['newest', 'oldest'] as const).map((sort) => (
                                                <button
                                                    key={sort}
                                                    onClick={() => {
                                                        setSortBy(sort);
                                                        setActivePopover(null);
                                                    }}
                                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all font-bold text-xs flex items-center justify-between ${sortBy === sort ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                                                >
                                                    {sort === 'newest' ? 'Newest First' : 'Oldest First'}
                                                    {sortBy === sort && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                                </button>
                                            ))}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="divider-v" />
                    </div>
                </motion.div>

                {/* KPI Overview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Active Operations"
                        value={stats.activeFleet}
                        subValue="Vehicles on Transit"
                        icon={Navigation}
                        colorClass="bg-[#6366f1]"
                        trend={stats.trends?.activeFleet}
                        delay={0.3}
                    />
                    <StatCard
                        title="In Maintenance"
                        value={stats.maintenanceAlerts}
                        subValue="Vehicles in Shop"
                        icon={Wrench}
                        colorClass="bg-[#f43f5e]"
                        trend={stats.trends?.maintenanceAlerts}
                        delay={0.4}
                    />
                    <StatCard
                        title="Utilization Rate"
                        value={`${stats.utilizationRate}%`}
                        subValue="Fleet Capacity"
                        icon={BarChart}
                        colorClass="bg-[#f59e0b]"
                        trend={stats.trends?.utilizationRate}
                        delay={0.5}
                    />
                    <StatCard
                        title="Pending Cargo"
                        value={stats.idleVehicles}
                        subValue="Waiting Delivery"
                        icon={Package}
                        colorClass="bg-[#10b981]"
                        trend={stats.trends?.idleVehicles}
                        delay={0.6}
                    />
                </div>

                {/* Table & Alerts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    {/* Modern Trip Table */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        className="xl:col-span-8 glass rounded-[32px] overflow-hidden shadow-xl border-white/40"
                    >
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white/30 backdrop-blur-md">
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                                <span className="p-2.5 rounded-xl bg-slate-900 text-white ring-8 ring-slate-900/5">
                                    <Activity size={20} />
                                </span>
                                Operational Log
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-widest rounded-full">
                                    Live Stream
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Assignment</th>
                                        <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Asset Info</th>
                                        <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Personnel</th>
                                        <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">System Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <AnimatePresence mode='popLayout'>
                                        {filteredTrips.length === 0 ? (
                                            <motion.tr
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <td colSpan={4} className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-4 text-slate-400">
                                                        <Search size={40} className="opacity-20 translate-y-2" />
                                                        <p className="font-bold text-xs uppercase tracking-widest">No matching telemetry found</p>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ) : filteredTrips.map((trip, idx) => (
                                            <motion.tr
                                                key={trip._id}
                                                variants={itemVariants}
                                                initial="hidden"
                                                animate="show"
                                                exit="hidden"
                                                layout
                                                className="hover:bg-primary/[0.02] group transition-colors cursor-pointer"
                                            >
                                                <td className="px-8 py-6">
                                                    <div>
                                                        <div className="font-extrabold text-slate-800 text-[13px] tracking-tight group-hover:text-primary transition-colors">
                                                            TRP-{trip._id.slice(-6).toUpperCase()}
                                                        </div>
                                                        <div className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-tight truncate max-w-[180px]">
                                                            {trip.startPoint}
                                                            <span className="mx-1 text-primary/30">→</span>
                                                            {trip.endPoint}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-primary/10 transition-colors">
                                                            <Package size={16} className="text-slate-400 group-hover:text-primary" />
                                                        </div>
                                                        <div className="font-bold text-slate-700 text-xs tracking-tight">{trip.vehicle?.name}</div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden ring-4 ring-slate-100 group-hover:ring-primary/5 transition-all">
                                                            {trip.driver?.name?.[0] || 'D'}
                                                        </div>
                                                        <div className="font-bold text-slate-700 text-xs tracking-tight">{trip.driver?.name}</div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-[10px] uppercase tracking-wider border shadow-sm ${trip.status === 'Completed'
                                                        ? 'bg-success/5 text-success border-success/10'
                                                        : trip.status === 'Dispatched'
                                                            ? 'bg-primary/5 text-primary border-primary/10'
                                                            : 'bg-muted/30 text-slate-400 border-slate-200'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${trip.status === 'Completed' ? 'bg-success' : 'bg-primary'
                                                            }`} />
                                                        {trip.status}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* High-Impact Alerts Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                        className="xl:col-span-4 space-y-6"
                    >
                        <div className="glass rounded-[32px] p-8 shadow-xl border-white/40">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                                    <span className="p-2.5 rounded-xl bg-accent text-white ring-8 ring-accent/5">
                                        <AlertTriangle size={20} />
                                    </span>
                                    System Alerts
                                </h2>
                                <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                                    {alerts.length}
                                </span>
                            </div>

                            <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-hide pr-2">
                                {alerts.length === 0 ? (
                                    <div className="py-12 flex flex-col items-center gap-3 text-slate-300">
                                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center">
                                            <Activity size={32} className="opacity-20" />
                                        </div>
                                        <p className="font-bold text-xs uppercase tracking-widest text-center">Safety Protocol Clear</p>
                                    </div>
                                ) : alerts.map((alert, i) => (
                                    <motion.div
                                        key={alert.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.9 + (i * 0.05) }}
                                        whileHover={{ x: 5 }}
                                        className={`p-5 rounded-2xl border-2 flex gap-4 cursor-default transition-all ${alert.severity === 'critical'
                                            ? 'bg-danger/5 border-danger/10 hover:border-danger/30'
                                            : 'bg-accent/5 border-accent/10 hover:border-accent/30'
                                            }`}
                                    >
                                        <div className={`p-3 rounded-xl max-h-fit shadow-sm ${alert.severity === 'critical' ? 'bg-danger text-white' : 'bg-accent text-white'
                                            }`}>
                                            {alert.type === 'maintenance' ? <Wrench size={18} /> : <UserRoundX size={18} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <h4 className="font-bold text-slate-800 text-[13px] leading-tight mb-1">{alert.title}</h4>
                                                {alert.severity === 'critical' && (
                                                    <span className="px-1.5 py-0.5 rounded bg-danger/10 text-danger text-[8px] font-black uppercase ring-1 ring-danger/20">Critical</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed">{alert.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <button
                                onClick={() => {
                                    setShowSuccessToast('Recalibrating safety protocols...');
                                    fetchDashboardData();
                                    setTimeout(() => setShowSuccessToast(null), 3000);
                                }}
                                className="w-full mt-8 py-4 px-6 glass hover:bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs text-slate-400 hover:text-primary transition-all uppercase tracking-[0.15em] flex items-center justify-center gap-2 group"
                            >
                                Optimize Compliance
                                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Secondary Interactive Card */}
                        <div className="glass rounded-[32px] p-8 bg-gradient-to-br from-primary to-blue-600 shadow-2xl shadow-primary/30 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                                <Navigation size={120} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Fleet Analytics</h3>
                                <p className="text-white text-lg font-bold leading-tight mb-6">Upgrade to Premium for real-time AI route optimization.</p>
                                <button
                                    onClick={() => {
                                        setShowSuccessToast('Premium analytics requested');
                                        setTimeout(() => setShowSuccessToast(null), 3000);
                                    }}
                                    className="bg-white text-primary px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-transform"
                                >
                                    Learn More
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
