'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { Plus, Wrench, History, Calendar } from 'lucide-react';
import api from '../../utils/api';
import StatusPill from '../../components/StatusPill';
import Layout from '../../components/Layout';
import { Vehicle, Log } from '../../types';

const Maintenance: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [newLog, setNewLog] = useState({
        vehicleId: '',
        type: 'Maintenance',
        amount: '',
        description: ''
    });

    useEffect(() => {
        fetchData();
    }, [selectedVehicle]);

    const fetchData = async () => {
        try {
            const vRes = await api.get('/vehicles');
            setVehicles(vRes.data);

            if (selectedVehicle) {
                const lRes = await api.get(`/logs/${selectedVehicle}`);
                setLogs(lRes.data.filter((l: Log) => l.type === 'Maintenance'));
            }
        } catch (err) {
            console.error('Failed to fetch maintenance logs');
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
            setNewLog({ vehicleId: '', type: 'Maintenance', amount: '', description: '' });
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to add log');
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Maintenance & Service Logs</h1>
                        <p className="text-slate-500 text-sm font-medium">Asset health and lifecycle management</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-danger text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-danger/90 transition-all shadow-lg shadow-danger/10 w-fit"
                    >
                        <Plus size={20} />
                        Create Service Entry
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 italic text-slate-400 text-sm">
                            Select a vehicle to view its service history
                        </div>
                        <div className="flex flex-col gap-2">
                            {vehicles.map(v => (
                                <button
                                    key={v._id}
                                    onClick={() => setSelectedVehicle(v._id)}
                                    className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${selectedVehicle === v._id
                                        ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                                        : 'border-slate-100 bg-white hover:border-slate-300'
                                        }`}
                                >
                                    <div>
                                        <div className="font-bold text-slate-900">{v.name}</div>
                                        <div className="text-xs text-slate-500">{v.licensePlate}</div>
                                    </div>
                                    <StatusPill status={v.status} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                                <h2 className="font-bold text-slate-900">Service History</h2>
                                <History size={18} className="text-slate-300" />
                            </div>

                            {selectedVehicle ? (
                                <div className="p-0">
                                    {logs.length === 0 ? (
                                        <div className="p-10 text-center text-slate-400 italic">No maintenance logs found for this asset</div>
                                    ) : (
                                        <div className="divide-y divide-slate-100">
                                            {logs.map(log => (
                                                <div key={log._id} className="p-6 flex items-start gap-4">
                                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                                        <Wrench size={20} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h4 className="font-bold text-slate-800">{log.description}</h4>
                                                            <span className="font-mono text-sm font-bold text-slate-900">₹{log.amount}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                                            <Calendar size={12} /> {new Date(log.date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-20 text-center flex flex-col items-center gap-4 text-slate-300">
                                    <Wrench size={48} />
                                    <p className="font-medium">Please select an asset from the list to view detailed logs</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in slide-in-from-bottom-4 duration-300">
                            <h2 className="text-xl font-bold text-slate-900 mb-2">New Service Log</h2>
                            <p className="text-slate-500 text-sm mb-6">Asset will be automatically set to "In Shop" status</p>

                            <form onSubmit={handleAddLog} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Target Vehicle</label>
                                    <select
                                        required
                                        value={newLog.vehicleId}
                                        onChange={e => setNewLog({ ...newLog, vehicleId: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                    >
                                        <option value="">-- Select Asset --</option>
                                        {vehicles.map(v => (
                                            <option key={v._id} value={v._id}>{v.name} ({v.licensePlate})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Service Cost (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        value={newLog.amount}
                                        onChange={e => setNewLog({ ...newLog, amount: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Work Description</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={newLog.description}
                                        onChange={e => setNewLog({ ...newLog, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                        placeholder="Describe parts replaced or service done..."
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-danger text-white font-bold rounded-xl hover:bg-danger/90 shadow-lg shadow-danger/10 transition-all"
                                    >
                                        Log & Retire
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

export default Maintenance;
