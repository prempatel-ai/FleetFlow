'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { UserPlus } from 'lucide-react';
import api from '../../utils/api';
import StatusPill from '../../components/StatusPill';
import Layout from '../../components/Layout';
import { Driver } from '../../types';

const Drivers: React.FC = () => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newDriver, setNewDriver] = useState({
        name: '',
        licenseNumber: '',
        licenseExpiry: '',
        vehicleCategory: ['Van']
    });

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const { data } = await api.get('/drivers');
            setDrivers(data);
        } catch (err) {
            console.error('Failed to fetch drivers');
        } finally {
            setLoading(false);
        }
    };

    const handleAddDriver = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/drivers', newDriver);
            fetchDrivers();
            setShowModal(false);
            setNewDriver({ name: '', licenseNumber: '', licenseExpiry: '', vehicleCategory: ['Van'] });
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to add driver');
        }
    };

    const isExpired = (date: string | undefined) => date ? new Date(date) < new Date() : false;

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Driver Profiles</h1>
                        <p className="text-slate-500 text-sm font-medium">Compliance and performance management</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-primary text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 w-fit"
                    >
                        <UserPlus size={20} />
                        Hire Driver
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-10 text-center text-slate-400 italic">Accessing talent pool...</div>
                    ) : drivers.length === 0 ? (
                        <div className="col-span-full py-10 text-center text-slate-400 italic">No drivers on record</div>
                    ) : drivers.map((driver: any) => (
                        <div key={driver._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full border-b-4 border-b-primary shadow-primary/5">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                                    {driver.name[0]}
                                </div>
                                <StatusPill status={driver.status} />
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-1">{driver.name}</h3>
                            <p className="text-xs font-mono text-slate-400 mb-4">{driver.licenseNumber}</p>

                            <div className="space-y-3 flex-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">License Expiry</span>
                                    <span className={`font-semibold ${isExpired(driver.licenseExpiry) ? 'text-danger' : 'text-slate-700'}`}>
                                        {driver.licenseExpiry ? new Date(driver.licenseExpiry).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Categories</span>
                                    <div className="flex gap-1">
                                        {driver.vehicleCategory?.map((cat: string) => (
                                            <span key={cat} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600 uppercase">
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-50 grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Safety Score</p>
                                        <p className="text-lg font-bold text-primary">{driver.safetyScore}</p>
                                    </div>
                                    <div className="text-center border-l border-slate-50">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Completion</p>
                                        <p className="text-lg font-bold text-success">{driver.tripCompletionRate}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                Add New Driver
                            </h2>
                            <form onSubmit={handleAddDriver} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                                    <input
                                        required
                                        value={newDriver.name}
                                        onChange={e => setNewDriver({ ...newDriver, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="e.g. Alex Johnson"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">License No.</label>
                                        <input
                                            required
                                            value={newDriver.licenseNumber}
                                            onChange={e => setNewDriver({ ...newDriver, licenseNumber: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none font-mono"
                                            placeholder="DL-987654"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Expiry Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={newDriver.licenseExpiry}
                                            onChange={e => setNewDriver({ ...newDriver, licenseExpiry: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Category Qualifications</label>
                                    <div className="flex gap-4">
                                        {['Truck', 'Van', 'Bike'].map(cat => (
                                            <label key={cat} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={newDriver.vehicleCategory.includes(cat)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setNewDriver({ ...newDriver, vehicleCategory: [...newDriver.vehicleCategory, cat] });
                                                        } else {
                                                            setNewDriver({ ...newDriver, vehicleCategory: newDriver.vehicleCategory.filter(c => c !== cat) });
                                                        }
                                                    }}
                                                    className="rounded text-primary focus:ring-primary"
                                                />
                                                <span className="text-sm font-medium text-slate-600">{cat}</span>
                                            </label>
                                        ))}
                                    </div>
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
                                        Hire Driver
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

export default Drivers;
