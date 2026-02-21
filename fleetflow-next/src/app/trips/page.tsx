'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { Plus, MapPin, Scale, AlertCircle, Map as MapIcon } from 'lucide-react';
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
        revenue: ''
    });
    const [error, setError] = useState('');

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
            setDrivers(driversRes.data.filter((d: Driver) => d.status === 'Available' || d.status === 'On Duty'));
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
            setNewTrip({ vehicleId: '', driverId: '', cargoWeight: '', startPoint: '', endPoint: '', revenue: '' });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to dispatch trip');
        }
    };

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

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Trip ID</th>
                                    <th className="px-6 py-4">Asset & Driver</th>
                                    <th className="px-6 py-4">Route</th>
                                    <th className="px-6 py-4">Load</th>
                                    <th className="px-6 py-4">Revenue</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Dispatch Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-6 py-10 text-center italic text-slate-400">Loading assignments...</td></tr>
                                ) : trips.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-10 text-center italic text-slate-400">No trips recorded</td></tr>
                                ) : trips.map((trip: any) => (
                                    <tr key={trip._id} className="hover:bg-slate-50 transition-colors">
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
                                        <td className="px-6 py-4 font-bold text-success">₹{(trip.revenue || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4"><StatusPill status={trip.status} /></td>
                                        <td className="px-6 py-4 text-xs font-mono text-slate-500">
                                            {trip.dispatchDate ? new Date(trip.dispatchDate).toLocaleString() : '-'}
                                        </td>
                                    </tr>
                                ))}
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
                                        >
                                            <option value="">-- Choose Operator --</option>
                                            {drivers.map(d => (
                                                <option key={d._id} value={d._id}>{d.name}</option>
                                            ))}
                                        </select>
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
                                    <p className="text-[10px] text-slate-400 mt-1 italic italic-not">Auto-calculated suggestion based on load weight: ₹{(parseFloat(newTrip.cargoWeight) * 2.5 || 0).toLocaleString()}</p>
                                </div>

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
