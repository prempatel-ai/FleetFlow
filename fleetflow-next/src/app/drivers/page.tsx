'use client';

import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import { Plus, Search, Filter, ArrowUpDown, ChevronDown, Shield, AlertTriangle, Moon, X, Activity, Briefcase, User, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import StatusPill from '../../components/StatusPill';
import Layout from '../../components/Layout';
import { Driver } from '../../types';

const Drivers: React.FC = () => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [groupCategory, setGroupCategory] = useState('All');
    const [sortBy, setSortBy] = useState('name');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

    const [newDriver, setNewDriver] = useState({
        name: '',
        licenseNumber: '',
        licenseExpiry: '',
        vehicleCategory: [] as string[],
        complaints: 0,
        profilePhoto: ''
    });

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/drivers');
            setDrivers(data);
        } catch (err) {
            console.error('Failed to fetch drivers');
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setPhotoPreview(base64);
            setNewDriver(prev => ({ ...prev, profilePhoto: base64 }));
        };
        reader.readAsDataURL(file);
    };

    const handleAddDriver = async (e: FormEvent) => {
        e.preventDefault();
        try {
            if (editingDriver) {
                await api.patch(`/drivers/${editingDriver._id}`, newDriver);
            } else {
                await api.post('/drivers', newDriver);
            }
            fetchDrivers();
            closeModal();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to process operator');
        }
    };

    const openEditModal = (driver: Driver) => {
        setEditingDriver(driver);
        const existingPhoto = (driver as any).profilePhoto || null;
        setPhotoPreview(existingPhoto);
        setNewDriver({
            name: driver.name,
            licenseNumber: driver.licenseNumber,
            licenseExpiry: driver.licenseExpiry?.split('T')[0] || '',
            vehicleCategory: driver.vehicleCategory || [],
            complaints: driver.complaints || 0,
            profilePhoto: existingPhoto || ''
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingDriver(null);
        setPhotoPreview(null);
        setNewDriver({ name: '', licenseNumber: '', licenseExpiry: '', vehicleCategory: [], complaints: 0, profilePhoto: '' });
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/drivers/${id}/status`, { status });
            fetchDrivers();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const isExpired = (date: string | undefined) => date ? new Date(date) < new Date() : false;

    const filteredDrivers = useMemo(() => {
        return drivers
            .filter(driver => {
                const matchesSearch = driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    driver.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase());

                const expired = isExpired(driver.licenseExpiry);
                const effectiveStatus = expired ? 'Expired' : driver.status;

                const matchesStatus = filterStatus === 'All' || effectiveStatus === filterStatus;
                const matchesCategory = groupCategory === 'All' || driver.vehicleCategory?.includes(groupCategory);

                return matchesSearch && matchesStatus && matchesCategory;
            })
            .sort((a: any, b: any) => {
                if (sortBy === 'name') return a.name.localeCompare(b.name);
                if (sortBy === 'score') return b.safetyScore - a.safetyScore;
                if (sortBy === 'expiry') return new Date(a.licenseExpiry).getTime() - new Date(b.licenseExpiry).getTime();
                if (sortBy === 'complaints') return b.complaints - a.complaints;
                return 0;
            });
    }, [drivers, searchQuery, filterStatus, groupCategory, sortBy]);

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Driver Performance & Safety</h1>
                        <p className="text-slate-500 text-sm font-medium">Manage compliance and operator excellence</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-primary text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 w-fit active:scale-95"
                    >
                        <Plus size={20} />
                        Hire New Driver
                    </button>
                </div>

                {/* Dashboard Controls */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-4 bg-slate-50/50">
                        <div className="relative flex-1 min-w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or license number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Group by category */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                    className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-bold transition-all ${isCategoryOpen ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <Briefcase size={18} />
                                    <span>Category: {groupCategory}</span>
                                    <ChevronDown size={16} className={`transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {isCategoryOpen && (
                                        <>
                                            <div className="fixed inset-0 z-20" onClick={() => setIsCategoryOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-2 w-48 bg-white glass rounded-2xl shadow-2xl border border-white/60 p-2 z-30"
                                            >
                                                {['All', 'Truck', 'Van', 'Bike'].map(cat => (
                                                    <button
                                                        key={cat}
                                                        onClick={() => {
                                                            setGroupCategory(cat);
                                                            setIsCategoryOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${groupCategory === cat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        {cat} Drivers
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
                                    className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-bold transition-all ${isFilterOpen ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <Filter size={18} />
                                    <span>Status: {filterStatus}</span>
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
                                                className="absolute right-0 mt-2 w-56 bg-white glass rounded-2xl shadow-2xl border border-white/60 p-2 z-30"
                                            >
                                                {['All', 'On Duty', 'Off Duty', 'Taking a Break', 'Suspended', 'Expired'].map(status => (
                                                    <button
                                                        key={status}
                                                        onClick={() => {
                                                            setFilterStatus(status);
                                                            setIsFilterOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${filterStatus === status ? 'bg-primary text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'
                                                            }`}
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
                                                    { label: 'Driver Name', value: 'name' },
                                                    { label: 'Highest Safety Score', value: 'score' },
                                                    { label: 'Upcoming Expiry', value: 'expiry' },
                                                    { label: 'Most Complaints', value: 'complaints' },
                                                ].map(opt => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => {
                                                            setSortBy(opt.value);
                                                            setIsSortOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${sortBy === opt.value ? 'bg-primary text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'
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
                                    <th className="px-6 py-4">Operator Name</th>
                                    <th className="px-6 py-4">License #</th>
                                    <th className="px-6 py-4">Expiry Date</th>
                                    <th className="px-6 py-4">Completion</th>
                                    <th className="px-6 py-4">Safety Score</th>
                                    <th className="px-6 py-4 text-center">Complaints</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {loading ? (
                                    <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">Accessing fleet personnel pool...</td></tr>
                                ) : filteredDrivers.length === 0 ? (
                                    <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">No operators found matching your criteria</td></tr>
                                ) : (
                                    <AnimatePresence mode="popLayout">
                                        {filteredDrivers.map((driver) => {
                                            const expired = isExpired(driver.licenseExpiry);
                                            return (
                                                <motion.tr
                                                    layout
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    key={driver._id}
                                                    className={`group hover:bg-slate-50 transition-all duration-200 ${expired ? 'bg-danger/[0.02]' : ''}`}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {(driver as any).profilePhoto ? (
                                                                <img
                                                                    src={(driver as any).profilePhoto}
                                                                    alt={driver.name}
                                                                    className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 flex-shrink-0"
                                                                />
                                                            ) : (
                                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${expired ? 'bg-danger/20 text-danger' : 'bg-primary/10 text-primary'}`}>
                                                                    {driver.name[0]}
                                                                </div>
                                                            )}
                                                            <span className="font-bold text-slate-800">{driver.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-[11px] text-slate-400 uppercase tracking-tighter">{driver.licenseNumber}</td>
                                                    <td className="px-6 py-4">
                                                        <div className={`flex items-center gap-1.5 font-bold ${expired ? 'text-danger' : 'text-slate-600'}`}>
                                                            {expired && <AlertTriangle size={14} />}
                                                            {driver.licenseExpiry ? new Date(driver.licenseExpiry).toLocaleDateString() : 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-success">{driver.tripCompletionRate}%</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-primary"
                                                                    style={{ width: `${driver.safetyScore}%` }}
                                                                />
                                                            </div>
                                                            <span className="font-bold text-slate-900">{driver.safetyScore}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${driver.complaints && driver.complaints > 0 ? 'bg-danger/10 text-danger' : 'bg-slate-100 text-slate-400'
                                                            }`}>
                                                            {driver.complaints || 0}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1 justify-center">
                                                            <button
                                                                onClick={() => openEditModal(driver)}
                                                                className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-primary transition-all shadow-sm"
                                                                title="Edit Profile"
                                                            >
                                                                <Activity size={14} />
                                                            </button>
                                                            {expired ? (
                                                                <span className="px-3 py-1.5 bg-danger text-white rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-danger/20 flex items-center gap-1">
                                                                    <X size={12} /> Expired Lock
                                                                </span>
                                                            ) : (
                                                                <div className="relative group/status">
                                                                    <StatusPill status={driver.status} />
                                                                    <div className="absolute right-0 top-full mt-1 hidden group-hover/status:block z-40 bg-white border border-slate-100 shadow-2xl rounded-2xl p-2 w-48 glass animate-in fade-in slide-in-from-top-2 duration-200">
                                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2 border-b border-slate-50 mb-1">Set Duty Status</div>
                                                                        {[
                                                                            { label: 'On Duty', icon: Shield, color: 'text-success' },
                                                                            { label: 'Off Duty', icon: Moon, color: 'text-slate-400' },
                                                                            { label: 'Taking a Break', icon: Activity, color: 'text-warning' },
                                                                            { label: 'Suspended', icon: X, color: 'text-danger' }
                                                                        ].map(opt => (
                                                                            <button
                                                                                key={opt.label}
                                                                                onClick={() => handleUpdateStatus(driver._id, opt.label)}
                                                                                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 flex items-center gap-2 transition-colors"
                                                                            >
                                                                                <opt.icon size={14} className={opt.color} />
                                                                                {opt.label}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
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
                            className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full p-10 border border-slate-100"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-primary/10 text-primary rounded-2xl"><User size={32} /></div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                                        {editingDriver ? 'Update Profile' : 'Driver Onboarding'}
                                    </h2>
                                    <p className="text-slate-500 text-sm font-medium">
                                        {editingDriver ? `Modifying credentials for ${editingDriver.name}` : 'Verify credentials for a new fleet operator'}
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleAddDriver} className="space-y-5">
                                {/* Photo Upload */}
                                <div className="flex justify-center mb-2">
                                    <div className="relative group">
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-24 h-24 rounded-full border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer overflow-hidden hover:border-primary/50 hover:bg-primary/5 transition-all"
                                        >
                                            {photoPreview ? (
                                                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-1 text-slate-300">
                                                    <Camera size={28} />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Photo</span>
                                                </div>
                                            )}
                                        </div>
                                        {photoPreview && (
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setPhotoPreview(null); setNewDriver(p => ({ ...p, profilePhoto: '' })); }}
                                                className="absolute -top-1 -right-1 w-6 h-6 bg-danger text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                                            >
                                                <X size={12} />
                                            </button>
                                        )}
                                        <div className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md pointer-events-none">
                                            <Camera size={13} className="text-white" />
                                        </div>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handlePhotoChange}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                                        <input
                                            required
                                            value={newDriver.name}
                                            onChange={e => setNewDriver({ ...newDriver, name: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-bold text-slate-700"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">License #</label>
                                        <input
                                            required
                                            value={newDriver.licenseNumber}
                                            onChange={e => setNewDriver({ ...newDriver, licenseNumber: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-bold text-slate-700 uppercase"
                                            placeholder="DL23223"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">License Expiry</label>
                                        <input
                                            type="date"
                                            required
                                            value={newDriver.licenseExpiry}
                                            onChange={e => setNewDriver({ ...newDriver, licenseExpiry: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-bold text-slate-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Complaints (Initial)</label>
                                        <input
                                            type="number"
                                            value={newDriver.complaints}
                                            onChange={e => setNewDriver({ ...newDriver, complaints: parseInt(e.target.value) })}
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-bold text-slate-700"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Category Qualification</label>
                                    <div className="flex flex-wrap gap-3">
                                        {['Truck', 'Van', 'Bike'].map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => {
                                                    if (newDriver.vehicleCategory.includes(cat)) {
                                                        setNewDriver({ ...newDriver, vehicleCategory: newDriver.vehicleCategory.filter(c => c !== cat) });
                                                    } else {
                                                        setNewDriver({ ...newDriver, vehicleCategory: [...newDriver.vehicleCategory, cat] });
                                                    }
                                                }}
                                                className={`px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border ${newDriver.vehicleCategory.includes(cat)
                                                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-8">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95"
                                    >
                                        {editingDriver ? 'Confirm Changes' : 'Hire Operator'}
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

export default Drivers;
