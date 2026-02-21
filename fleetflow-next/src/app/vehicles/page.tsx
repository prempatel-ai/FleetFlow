'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { Plus, Search, Filter, MoreVertical } from 'lucide-react';
import api from '../../utils/api';
import StatusPill from '../../components/StatusPill';
import Layout from '../../components/Layout';
import { Vehicle } from '../../types';

const Vehicles: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newVehicle, setNewVehicle] = useState({
        name: '',
        model: '',
        licensePlate: '',
        type: 'Truck',
        maxCapacity: '',
        acquisitionCost: ''
    });

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const { data } = await api.get('/vehicles');
            setVehicles(data);
        } catch (err) {
            console.error('Failed to fetch vehicles');
        } finally {
            setLoading(false);
        }
    };

    const handleAddVehicle = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/vehicles', newVehicle);
            fetchVehicles();
            setShowModal(false);
            setNewVehicle({ name: '', model: '', licensePlate: '', type: 'Truck', maxCapacity: '', acquisitionCost: '' });
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to add vehicle');
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Vehicle Registry</h1>
                        <p className="text-slate-500 text-sm font-medium">Manage and track your fleet assets</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-primary text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 w-fit"
                    >
                        <Plus size={20} />
                        Register Asset
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or license plate..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-white transition-colors">
                            <Filter size={18} />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Vehicle Name</th>
                                    <th className="px-6 py-4">License Plate</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Capacity</th>
                                    <th className="px-6 py-4">Acquisition Cost</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 italic text-sm text-slate-400">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-6 py-10 text-center">Loading registry...</td></tr>
                                ) : vehicles.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-10 text-center">No vehicles registered yet</td></tr>
                                ) : vehicles.map((vehicle: any) => (
                                    <tr key={vehicle._id} className="hover:bg-slate-50 transition-colors not-italic text-slate-700">
                                        <td className="px-6 py-4 font-semibold">{vehicle.name} <span className="text-slate-400 font-normal text-xs">{vehicle.model}</span></td>
                                        <td className="px-6 py-4 font-mono text-xs">{vehicle.licensePlate}</td>
                                        <td className="px-6 py-4"><span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded-lg">{vehicle.type}</span></td>
                                        <td className="px-6 py-4 font-medium">{vehicle.maxCapacity} kg</td>
                                        <td className="px-6 py-4 font-bold text-slate-900">₹{(vehicle.acquisitionCost || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4"><StatusPill status={vehicle.status} /></td>
                                        <td className="px-6 py-4">
                                            <button className="p-1 hover:text-primary transition-colors"><MoreVertical size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Register New Asset</h2>
                            <form onSubmit={handleAddVehicle} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Vehicle Name</label>
                                    <input
                                        required
                                        value={newVehicle.name}
                                        onChange={e => setNewVehicle({ ...newVehicle, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="e.g. Van-05"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Model</label>
                                    <input
                                        required
                                        value={newVehicle.model}
                                        onChange={e => setNewVehicle({ ...newVehicle, model: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="e.g. Mercedes Sprinter"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">License Plate</label>
                                        <input
                                            required
                                            value={newVehicle.licensePlate}
                                            onChange={e => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none font-mono uppercase"
                                            placeholder="ABC-123"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Type</label>
                                        <select
                                            value={newVehicle.type}
                                            onChange={e => setNewVehicle({ ...newVehicle, type: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        >
                                            <option>Truck</option>
                                            <option>Van</option>
                                            <option>Bike</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Max Capacity (kg)</label>
                                    <input
                                        type="number"
                                        required
                                        value={newVehicle.maxCapacity}
                                        onChange={e => setNewVehicle({ ...newVehicle, maxCapacity: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Acquisition Cost (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        value={newVehicle.acquisitionCost}
                                        onChange={e => setNewVehicle({ ...newVehicle, acquisitionCost: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none font-bold text-slate-900"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20"
                                    >
                                        Save Asset
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

export default Vehicles;
