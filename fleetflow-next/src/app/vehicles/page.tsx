'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { Plus, Search, Filter, MoreVertical, X, ChevronDown, Trash2, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
        acquisitionCost: '',
        odometer: ''
    });

    // Search and Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [sortBy, setSortBy] = useState('name');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);

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
            setNewVehicle({ name: '', model: '', licensePlate: '', type: 'Truck', maxCapacity: '', acquisitionCost: '', odometer: '' });
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to add vehicle');
        }
    };

    const handleDeleteVehicle = async (id: string) => {
        if (!confirm('Are you sure you want to remove this asset?')) return;
        try {
            await api.delete(`/vehicles/${id}`);
            setVehicles(prev => prev.filter(v => (v as any)._id !== id));
        } catch (err) {
            alert('Failed to delete vehicle');
        }
    };

    const filteredVehicles = React.useMemo(() => {
        return vehicles
            .filter(vehicle => {
                const matchesSearch = vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesFilter = filterType === 'All' || vehicle.type === filterType;
                return matchesSearch && matchesFilter;
            })
            .sort((a, b) => {
                if (sortBy === 'name') return a.name.localeCompare(b.name);
                if (sortBy === 'capacity') return Number(b.maxCapacity) - Number(a.maxCapacity);
                return 0;
            });
    }, [vehicles, searchQuery, filterType, sortBy]);

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
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or license plate..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all"
                            />
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-bold transition-all ${isFilterOpen ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <Filter size={18} />
                                <span>Filter: {filterType}</span>
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
                                            className="absolute right-0 mt-2 w-48 bg-white glass rounded-2xl shadow-xl border border-white/60 p-2 z-30"
                                        >
                                            {['All', 'Truck', 'Van', 'Bike'].map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => {
                                                        setFilterType(type);
                                                        setIsFilterOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${filterType === type ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    {type} Assets
                                                </button>
                                            ))}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setIsSortOpen(!isSortOpen)}
                                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-bold transition-all ${isSortOpen ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <ArrowUpDown size={18} />
                                <span>Sort By</span>
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
                                            className="absolute right-0 mt-2 w-48 bg-white glass rounded-2xl shadow-xl border border-white/60 p-2 z-30"
                                        >
                                            {[
                                                { label: 'Asset Name', value: 'name' },
                                                { label: 'Max Capacity', value: 'capacity' },
                                            ].map(opt => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => {
                                                        setSortBy(opt.value);
                                                        setIsSortOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${sortBy === opt.value ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600 hover:bg-slate-50'
                                                        }`}
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

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Vehicle Name</th>
                                    <th className="px-6 py-4">License Plate</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Capacity</th>
                                    <th className="px-6 py-4">Acquisition Cost</th>
                                    <th className="px-6 py-4">Odometer</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 italic text-sm text-slate-400">
                                {loading ? (
                                    <tr><td colSpan={8} className="px-6 py-10 text-center">Loading registry...</td></tr>
                                ) : filteredVehicles.length === 0 ? (
                                    <tr><td colSpan={8} className="px-6 py-10 text-center">No vehicles found matching your criteria</td></tr>
                                ) : (
                                    <AnimatePresence mode="popLayout">
                                        {filteredVehicles.map((vehicle: any) => (
                                            <motion.tr
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                key={vehicle._id}
                                                className="hover:bg-slate-50 transition-colors not-italic text-slate-700"
                                            >
                                                <td className="px-6 py-4 font-semibold">{vehicle.name} <span className="text-slate-400 font-normal text-xs">{vehicle.model}</span></td>
                                                <td className="px-6 py-4 font-mono text-xs">{vehicle.licensePlate}</td>
                                                <td className="px-6 py-4"><span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded-lg">{vehicle.type}</span></td>
                                                <td className="px-6 py-4 font-medium">{vehicle.maxCapacity} kg</td>
                                                <td className="px-6 py-4 font-bold text-slate-900">₹{(vehicle.acquisitionCost || 0).toLocaleString()}</td>
                                                <td className="px-6 py-4 font-bold text-slate-700">{(vehicle.odometer || 0).toLocaleString()} <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1">km</span></td>
                                                <td className="px-6 py-4"><StatusPill status={vehicle.status} /></td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleDeleteVehicle(vehicle._id)}
                                                            className="p-2 text-danger/40 hover:text-danger hover:bg-danger/5 rounded-xl transition-all"
                                                            title="Delete Asset"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
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
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Initial Odometer (km)</label>
                                    <input
                                        type="number"
                                        required
                                        value={newVehicle.odometer}
                                        onChange={e => setNewVehicle({ ...newVehicle, odometer: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="79000"
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
