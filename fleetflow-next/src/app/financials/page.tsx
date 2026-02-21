'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { Plus, Fuel, TrendingUp } from 'lucide-react';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import { Vehicle, Driver, Trip } from '../../types';

const Financials: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>({ totalSpend: 0, fuelVolume: 0, avgCostPerKm: 0 });
    const [loading, setLoading] = useState(true);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newLog, setNewLog] = useState({
        vehicleId: '',
        type: 'Fuel',
        amount: '',
        liters: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [vRes, logsRes] = await Promise.all([
                api.get('/vehicles'),
                api.get('/logs')
            ]);
            setVehicles(vRes.data);
            setLogs(logsRes.data.logs);
            setSummary(logsRes.data.summary);
        } catch (err) {
            console.error('Failed to fetch financial data');
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
                type: 'Fuel',
                amount: '',
                liters: '',
                date: new Date().toISOString().split('T')[0]
            });
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to log expense');
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Financial Tracking</h1>
                        <p className="text-slate-500 text-sm font-medium">Audit fuel spend and operational costs</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-accent text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 w-fit"
                    >
                        <Plus size={20} />
                        Log Fuel/Expense
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="p-3 bg-accent/10 text-accent rounded-xl"><span className="text-xl font-bold">₹</span></div>
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">Total Monthly Spend</p>
                            <p className="text-xl font-bold text-slate-900">₹{summary.totalSpend.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="p-3 bg-primary/10 text-primary rounded-xl"><Fuel size={24} /></div>
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">Fuel Volume</p>
                            <p className="text-xl font-bold text-slate-900">{summary.fuelVolume.toLocaleString()} L</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="p-3 bg-success/10 text-success rounded-xl"><TrendingUp size={24} /></div>
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">Avg. Cost per KM</p>
                            <p className="text-xl font-bold text-slate-900">₹{summary.avgCostPerKm}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50">
                        <h2 className="font-bold text-slate-900">Recent Transactions</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-medium text-sm">
                            <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Asset</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Volume (L)</th>
                                    <th className="px-6 py-4">Total Cost</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 italic text-sm text-slate-300">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-10 text-center">Selecting asset logs from registry...</td></tr>
                                ) : logs.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-10 text-center">No transaction records found</td></tr>
                                ) : logs.map((log: any) => (
                                    <tr key={log._id} className="not-italic text-slate-700 hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-xs font-mono">{new Date(log.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-bold">{log.vehicle?.name || 'Unknown Asset'}</td>
                                        <td className="px-6 py-4"><span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold uppercase">{log.type}</span></td>
                                        <td className="px-6 py-4">{log.liters || '-'}</td>
                                        <td className="px-6 py-4 font-bold text-slate-900">₹{log.amount.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                Financial Record
                            </h2>
                            <form onSubmit={handleAddLog} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Target Asset</label>
                                    <select
                                        required
                                        value={newLog.vehicleId}
                                        onChange={e => setNewLog({ ...newLog, vehicleId: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                    >
                                        <option value="">-- Choose Asset --</option>
                                        {vehicles.map(v => (
                                            <option key={v._id} value={v._id}>{v.name} ({v.licensePlate})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Cost (₹)</label>
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
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Liters</label>
                                        <input
                                            type="number"
                                            required
                                            value={newLog.liters}
                                            onChange={e => setNewLog({ ...newLog, liters: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                            placeholder="0.0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1 text-xs text-slate-400 font-bold uppercase">Date of Purchase</label>
                                    <input
                                        type="date"
                                        required
                                        value={newLog.date}
                                        onChange={e => setNewLog({ ...newLog, date: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm font-mono"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors uppercase text-xs tracking-wider"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 shadow-lg shadow-accent/20 transition-all uppercase text-xs tracking-wider"
                                    >
                                        Commit Log
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

export default Financials;
