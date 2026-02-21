'use client';

import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import { Plus, Wrench, History, Calendar, Search, Filter, ArrowUpDown, ChevronDown, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import StatusPill from '../../components/StatusPill';
import Layout from '../../components/Layout';
import { Vehicle, Log } from '../../types';

const Maintenance: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [allLogs, setAllLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [groupVehicle, setGroupVehicle] = useState('All');
    const [sortBy, setSortBy] = useState('date-desc');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [isVehicleFilterOpen, setIsVehicleFilterOpen] = useState(false);

    const [newLog, setNewLog] = useState({
        vehicleId: '',
        type: 'Maintenance',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [vRes, lRes] = await Promise.all([
                api.get('/vehicles'),
                api.get('/logs')
            ]);
            setVehicles(vRes.data);
            setAllLogs(lRes.data.logs || []);
        } catch (err) {
            console.error('Failed to fetch maintenance data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddLog = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/logs', newLog);
            fetchData();
            setShowModal(false);
            setNewLog({
                vehicleId: '',
                type: 'Maintenance',
                amount: '',
                description: '',
                date: new Date().toISOString().split('T')[0]
            });
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to add log');
        }
    };

    const filteredLogs = useMemo(() => {
        return allLogs
            .filter(log => {
                const vehicleName = typeof log.vehicle === 'string' ? log.vehicle : log.vehicle?.name || '';
                const vehiclePlate = typeof log.vehicle === 'string' ? '' : log.vehicle?.licensePlate || '';

                const matchesSearch = (log.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                    vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase());

                const matchesType = filterType === 'All' || log.type === filterType;
                const matchesVehicle = groupVehicle === 'All' || (typeof log.vehicle === 'object' && log.vehicle._id === groupVehicle);

                return matchesSearch && matchesType && matchesVehicle;
            })
            .sort((a, b) => {
                if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
                if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
                if (sortBy === 'cost-desc') return b.amount - a.amount;
                if (sortBy === 'cost-asc') return a.amount - b.amount;
                return 0;
            });
    }, [allLogs, searchQuery, filterType, groupVehicle, sortBy]);

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Maintenance & Service Logs</h1>
                        <p className="text-slate-500 text-sm font-medium">Monitor asset health and service lifecycles</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-danger text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-danger/90 transition-all shadow-xl shadow-danger/20 w-fit active:scale-95"
                    >
                        <Plus size={20} />
                        Create New Service
                    </button>
                </div>

                {/* Dashboard Controls */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-4 bg-slate-50/50">
                        <div className="relative flex-1 min-w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search logs, vehicles, or issues..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Group by Vehicle */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsVehicleFilterOpen(!isVehicleFilterOpen)}
                                    className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-bold transition-all ${isVehicleFilterOpen ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <ClipboardList size={18} />
                                    <span>{groupVehicle === 'All' ? 'Group by: All' : vehicles.find(v => v._id === groupVehicle)?.name}</span>
                                    <ChevronDown size={16} className={`transition-transform duration-300 ${isVehicleFilterOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {isVehicleFilterOpen && (
                                        <>
                                            <div className="fixed inset-0 z-20" onClick={() => setIsVehicleFilterOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-2 w-64 bg-white glass rounded-2xl shadow-2xl border border-white/60 p-2 z-30 max-h-72 overflow-y-auto"
                                            >
                                                <button onClick={() => { setGroupVehicle('All'); setIsVehicleFilterOpen(false); }} className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold mb-1 transition-all ${groupVehicle === 'All' ? 'bg-primary text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'}`}>All Vehicles</button>
                                                {vehicles.map(v => (
                                                    <button
                                                        key={v._id}
                                                        onClick={() => {
                                                            setGroupVehicle(v._id);
                                                            setIsVehicleFilterOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${groupVehicle === v._id ? 'bg-primary text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'
                                                            }`}
                                                    >
                                                        {v.name} <span className="text-[10px] opacity-70 ml-1">({v.licensePlate})</span>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Filter by Type */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-bold transition-all ${isFilterOpen ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <Filter size={18} />
                                    <span>Type: {filterType}</span>
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
                                                {['All', 'Maintenance', 'Fuel', 'Expense'].map(type => (
                                                    <button
                                                        key={type}
                                                        onClick={() => {
                                                            setFilterType(type);
                                                            setIsFilterOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${filterType === type ? 'bg-primary text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'
                                                            }`}
                                                    >
                                                        {type} Logs
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
                                                className="absolute right-0 mt-2 w-56 bg-white glass rounded-2xl shadow-2xl border border-white/60 p-2 z-30"
                                            >
                                                {[
                                                    { label: 'Latest First', value: 'date-desc' },
                                                    { label: 'Oldest First', value: 'date-asc' },
                                                    { label: 'Highest Cost', value: 'cost-desc' },
                                                    { label: 'Lowest Cost', value: 'cost-asc' },
                                                ].map(opt => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => {
                                                            setSortBy(opt.value);
                                                            setIsSortOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${sortBy === opt.value ? 'bg-primary text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'
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
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-[0.1em]">
                                <tr>
                                    <th className="px-6 py-4">Log ID</th>
                                    <th className="px-6 py-4">Vehicle</th>
                                    <th className="px-6 py-4">Issue / Service</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Cost</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">Loading fleet logs...</td></tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">No logs found matching your criteria</td></tr>
                                ) : (
                                    <AnimatePresence mode="popLayout">
                                        {filteredLogs.map((log) => (
                                            <motion.tr
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                key={log._id}
                                                className="group hover:bg-slate-50 transition-all duration-200"
                                            >
                                                <td className="px-6 py-4 font-mono text-[11px] text-slate-400">#{log._id.slice(-6).toUpperCase()}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-800">{typeof log.vehicle === 'object' ? log.vehicle.name : 'Unknown'}</span>
                                                        <span className="text-[10px] text-slate-400 font-medium uppercase">{typeof log.vehicle === 'object' ? log.vehicle.licensePlate : ''}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`p-1.5 rounded-lg ${log.type === 'Maintenance' ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'}`}>
                                                            {log.type === 'Maintenance' ? <Wrench size={14} /> : <History size={14} />}
                                                        </div>
                                                        <span className="font-medium text-slate-700">{log.description}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 font-medium">{new Date(log.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                                <td className="px-6 py-4"><span className="font-bold text-slate-900">₹{(log.amount || 0).toLocaleString()}</span></td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${log.type === 'Maintenance' ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'
                                                        }`}>
                                                        {log.type === 'Maintenance' ? 'New Service' : log.type}
                                                    </span>
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
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-10 border border-slate-100"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-danger/10 text-danger rounded-xl"><Wrench size={24} /></div>
                                <h2 className="text-2xl font-bold text-slate-900">New Service Entry</h2>
                            </div>
                            <p className="text-slate-500 text-sm mb-8 font-medium">This asset will be automatically locked as <span className="text-danger font-bold">"In Shop"</span></p>

                            <form onSubmit={handleAddLog} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Vehicle Name</label>
                                    <select
                                        required
                                        value={newLog.vehicleId}
                                        onChange={e => setNewLog({ ...newLog, vehicleId: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-bold text-slate-700"
                                    >
                                        <option value="">-- Select Asset --</option>
                                        {vehicles.map(v => (
                                            <option key={v._id} value={v._id}>{v.name} ({v.licensePlate})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Issue / Service</label>
                                    <input
                                        required
                                        value={newLog.description}
                                        onChange={e => setNewLog({ ...newLog, description: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-bold text-slate-700"
                                        placeholder="e.g., Engine Issue, Oil Change"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={newLog.date}
                                            onChange={e => setNewLog({ ...newLog, date: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-bold text-slate-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Cost (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            value={newLog.amount}
                                            onChange={e => setNewLog({ ...newLog, amount: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-bold text-danger text-lg"
                                            placeholder="10k"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-danger text-white font-bold rounded-2xl hover:bg-danger/90 shadow-xl shadow-danger/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Maintenance;
