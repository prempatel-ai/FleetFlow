'use client';

import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Plus, MapPin, Scale, AlertCircle, Map as MapIcon, Search, Filter, ArrowUpDown, ChevronDown, Truck, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import StatusPill from '../../components/StatusPill';
import Layout from '../../components/Layout';
import { Trip, Vehicle, Driver } from '../../types';

const TripMap = dynamic(() => import('../../components/TripMap'), { ssr: false });

const Trips: React.FC = () => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newTrip, setNewTrip] = useState({
        vehicleId: '',
        driverId: '',
        cargoWeight: '',
        startPoint: '',
        endPoint: '',
        revenue: '',
        fuelCost: ''
    });
    const [error, setError] = useState('');

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isTypeOpen, setIsTypeOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
                api.get('/trips'),
                api.get('/vehicles'),
                api.get('/drivers')
            ]);
            setTrips(tripsRes.data);
            setVehicles(vehiclesRes.data.filter((v: Vehicle) => v.status === 'Available'));
            setDrivers(driversRes.data); // Keep all drivers for filtering
        } catch (err) {
            console.error('Failed to fetch trip data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTrip = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/trips', newTrip);
            fetchData();
            setShowModal(false);
            setNewTrip({ vehicleId: '', driverId: '', cargoWeight: '', startPoint: '', endPoint: '', revenue: '', fuelCost: '' });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to dispatch trip');
        }
    };

    const qualifiedDrivers = useMemo(() => {
        const selectedVehicle = vehicles.find(v => v._id === newTrip.vehicleId);

        return drivers.filter(d => {
            // 1. Availability Check
            const isAvailable = d.status === 'Available' || d.status === 'On Duty';

            // 2. License Expiry Check
            const isLicenseValid = d.licenseExpiry ? new Date(d.licenseExpiry) > new Date() : false;

            // 3. Category Match (if vehicle selected)
            const categoryMatch = !selectedVehicle || d.vehicleCategory?.includes(selectedVehicle.type);

            return isAvailable && isLicenseValid && categoryMatch;
        });
    }, [drivers, newTrip.vehicleId, vehicles]);

    const filteredTrips = useMemo(() => {
        return trips
            .filter(trip => {
                const searchLower = searchQuery.toLowerCase();
                const matchesSearch =
                    trip.vehicle?.name?.toLowerCase().includes(searchLower) ||
                    trip.driver?.name?.toLowerCase().includes(searchLower) ||
                    trip.startPoint?.toLowerCase().includes(searchLower) ||
                    trip.endPoint?.toLowerCase().includes(searchLower);

                const matchesStatus = filterStatus === 'All' || trip.status === filterStatus;
                const matchesType = filterType === 'All' || trip.vehicle?.type === filterType;

                return matchesSearch && matchesStatus && matchesType;
            })
            .sort((a: any, b: any) => {
                if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                if (sortBy === 'revenue') return (b.revenue || 0) - (a.revenue || 0);
                if (sortBy === 'load') return (b.cargoWeight || 0) - (a.cargoWeight || 0);
                return 0;
            });
    }, [trips, searchQuery, filterStatus, filterType, sortBy]);

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Trip Dispatcher</h1>
                        <p className="text-slate-500 text-sm font-medium">Create and monitor fleet assignments</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-primary text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 w-fit"
                    >
                        <Plus size={20} />
                        Create New Trip
                    </button>
                </div>

                {/* Map View */}
                <TripMap
                    markers={trips.filter(t => t.vehicle).map(t => {
                        // Use trip ID to generate a stable pseudo-random position if real coordinates aren't in DB
                        const seed = t._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                        const lat = 20.5937 + ((seed % 100) / 10 - 5);
                        const lng = 78.9629 + (((seed * 7) % 100) / 10 - 5);

                        return {
                            id: t._id,
                            position: [lat, lng] as [number, number],
                            label: `${t.vehicle?.name} (${t.driver?.name})`,
                            status: t.status
                        };
                    })}
                />

                {/* Dashboard Controls */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-4 bg-slate-50/50">
                        <div className="relative flex-1 min-w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by vehicle, driver or route..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Filter by Type */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsTypeOpen(!isTypeOpen)}
                                    className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-bold transition-all ${isTypeOpen ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <Truck size={18} />
                                    <span>{filterType === 'All' ? 'All Assets' : filterType}</span>
                                    <ChevronDown size={16} className={`transition-transform duration-300 ${isTypeOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {isTypeOpen && (
                                        <>
                                            <div className="fixed inset-0 z-20" onClick={() => setIsTypeOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-2 w-48 bg-white glass rounded-2xl shadow-2xl border border-white/60 p-2 z-30"
                                            >
                                                {['All', 'Truck', 'Van', 'Tanker', 'Trailer'].map(type => (
                                                    <button
                                                        key={type}
                                                        onClick={() => {
                                                            setFilterType(type);
                                                            setIsTypeOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterType === type ? 'bg-primary text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Filter by Status */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-bold transition-all ${isFilterOpen ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <Filter size={18} />
                                    <span>{filterStatus === 'All' ? 'All Status' : filterStatus}</span>
                                    <ChevronDown size={16} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {isFilterOpen && (
                                        <>
                                            <div className="fixed inset-0 z-20" onClick={() => setIsFilterOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-2 w-48 bg-white glass rounded-2xl shadow-2xl border border-white/60 p-2 z-30"
                                            >
                                                {['All', 'Dispatched', 'Completed', 'Draft', 'Cancelled'].map(status => (
                                                    <button
                                                        key={status}
                                                        onClick={() => {
                                                            setFilterStatus(status);
                                                            setIsFilterOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === status ? 'bg-primary text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}
                                                    >
                                                        {status}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Sort By */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsSortOpen(!isSortOpen)}
                                    className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-bold transition-all ${isSortOpen ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <ArrowUpDown size={18} />
                                    <ChevronDown size={16} className={`transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {isSortOpen && (
                                        <>
                                            <div className="fixed inset-0 z-20" onClick={() => setIsSortOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-2 w-48 bg-white glass rounded-2xl shadow-2xl border border-white/60 p-2 z-30"
                                            >
                                                {[
                                                    { label: 'Newest First', value: 'newest' },
                                                    { label: 'Highest Revenue', value: 'revenue' },
                                                    { label: 'Largest Load', value: 'load' }
                                                ].map(opt => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => {
                                                            setSortBy(opt.value);
                                                            setIsSortOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2 rounded-xl text-xs font-bold transition-all ${sortBy === opt.value ? 'bg-primary text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Trip ID</th>
                                    <th className="px-6 py-4">Asset & Driver</th>
                                    <th className="px-6 py-4">Route</th>
                                    <th className="px-6 py-4">Load</th>
                                    <th className="px-6 py-4 text-center">Fuel & Revenue</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Dispatch Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                {loading ? (
                                    <tr><td colSpan={7} className="px-6 py-10 text-center italic text-slate-400">Loading assignments...</td></tr>
                                ) : filteredTrips.length === 0 ? (
                                    <tr><td colSpan={7} className="px-6 py-10 text-center italic text-slate-400">No trips match your criteria</td></tr>
                                ) : (
                                    <AnimatePresence mode='popLayout'>
                                        {filteredTrips.map((trip: any) => (
                                            <motion.tr
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                key={trip._id}
                                                className="hover:bg-slate-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 font-mono text-xs text-slate-400">#{trip._id.slice(-6)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-slate-900">{trip.vehicle?.name}</div>
                                                    <div className="text-xs text-slate-500 italic">{trip.driver?.name}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-xs font-medium">
                                                        <span className="text-slate-500">{trip.startPoint}</span>
                                                        <span className="text-primary font-bold">→</span>
                                                        <span className="text-slate-700">{trip.endPoint}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-medium">{trip.cargoWeight} kg</td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="font-bold text-success">₹{(trip.revenue || 0).toLocaleString()}</div>
                                                    <div className="text-[10px] text-slate-400 font-medium">Fuel: ₹{(trip.fuelCost || 0).toLocaleString()}</div>
                                                </td>
                                                <td className="px-6 py-4"><StatusPill status={trip.status} /></td>
                                                <td className="px-6 py-4 text-xs font-mono text-slate-500">
                                                    {trip.dispatchDate ? new Date(trip.dispatchDate).toLocaleString() : '-'}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Initialize Shipment</h2>
                            <p className="text-slate-500 text-sm mb-6 font-medium">Assign available assets to a new delivery route</p>

                            {error && (
                                <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-start gap-3 text-danger text-sm">
                                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleCreateTrip} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Select Vehicle</label>
                                        <select
                                            required
                                            value={newTrip.vehicleId}
                                            onChange={e => setNewTrip({ ...newTrip, vehicleId: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        >
                                            <option value="">-- Choose Asset --</option>
                                            {vehicles.map(v => (
                                                <option key={v._id} value={v._id}>{v.name} ({v.maxCapacity}kg)</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Select Driver</label>
                                        <select
                                            required
                                            value={newTrip.driverId}
                                            onChange={e => setNewTrip({ ...newTrip, driverId: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                            disabled={!newTrip.vehicleId}
                                        >
                                            <option value="">{!newTrip.vehicleId ? 'Select vehicle first' : '-- Choose Operator --'}</option>
                                            {qualifiedDrivers.map((d: Driver) => (
                                                <option key={d._id} value={d._id}>{d.name} {d.safetyScore ? `(Score: ${d.safetyScore})` : ''}</option>
                                            ))}
                                        </select>
                                        {newTrip.vehicleId && qualifiedDrivers.length === 0 && (
                                            <p className="text-[10px] text-danger mt-1 font-bold animate-pulse">No qualified operators available for this asset type.</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                                        <Scale size={14} className="text-slate-400" /> Cargo Weight (kg)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={newTrip.cargoWeight}
                                        onChange={e => setNewTrip({ ...newTrip, cargoWeight: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="Enter specific weight"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                                            <MapPin size={14} className="text-slate-400" /> Origin
                                        </label>
                                        <input
                                            required
                                            value={newTrip.startPoint}
                                            onChange={e => setNewTrip({ ...newTrip, startPoint: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                            placeholder="Point A"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                                            <MapPin size={14} className="text-slate-400" /> Destination
                                        </label>
                                        <input
                                            required
                                            value={newTrip.endPoint}
                                            onChange={e => setNewTrip({ ...newTrip, endPoint: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                            placeholder="Point B"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Expected Revenue (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            value={newTrip.revenue}
                                            onChange={e => setNewTrip({ ...newTrip, revenue: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none font-bold text-success"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Est. Fuel Cost (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            value={newTrip.fuelCost}
                                            onChange={e => setNewTrip({ ...newTrip, fuelCost: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none font-bold text-slate-700"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1 italic italic-not">Auto-calculated suggestion based on load weight: ₹{(parseFloat(newTrip.cargoWeight) * 2.5 || 0).toLocaleString()}</p>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                                    >
                                        Save Draft
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <MapIcon size={18} />
                                        Dispatch Trip
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Trips;
