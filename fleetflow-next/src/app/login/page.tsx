'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, Eye, EyeOff, ArrowRight, Truck, Shield, BarChart3, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { AxiosError } from 'axios';

const features = [
    { icon: Truck, label: 'Fleet Tracking', desc: 'Real-time status for every vehicle' },
    { icon: MapPin, label: 'Live Routes', desc: 'Actual road routes via OSRM' },
    { icon: Shield, label: 'Compliance', desc: 'License & maintenance alerts' },
    { icon: BarChart3, label: 'Analytics', desc: 'ROI, fuel efficiency & financials' },
];

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState<'email' | 'password' | null>(null);

    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            login(data);
            router.push('/dashboard');
        } catch (err) {
            const axiosError = err as AxiosError<{ message?: string }>;
            setError(axiosError.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-outfit selection:bg-primary/10">

            {/* ── Left Panel ── */}
            <div className="hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden bg-slate-900 p-14">
                {/* Background gradient blobs */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px]" />
                    <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-primary/10 blur-[80px]" />
                    {/* Grid overlay */}
                    <div className="absolute inset-0 opacity-[0.03]"
                        style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '50px 50px' }}
                    />
                </div>

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <img src="/logo.svg" alt="FleetFlow" className="w-10 h-10 drop-shadow-lg" />
                    <div>
                        <span className="text-white font-extrabold text-xl tracking-tight">FleetFlow</span>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none">Global Logistics</p>
                    </div>
                </div>

                {/* Hero text */}
                <div className="relative z-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.7 }}
                        className="text-[44px] font-extrabold text-white leading-[1.15] tracking-tight mb-6"
                    >
                        Your fleet,<br />
                        <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                            one dashboard.
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.6 }}
                        className="text-slate-400 text-base font-medium leading-relaxed mb-10 max-w-sm"
                    >
                        Replace manual logbooks with a centralized hub for dispatch, compliance, and financial reporting.
                    </motion.p>

                    {/* Feature pills */}
                    <div className="grid grid-cols-2 gap-3">
                        {features.map(({ icon: Icon, label, desc }, i) => (
                            <motion.div
                                key={label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                                className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/8 hover:bg-white/8 transition-colors"
                            >
                                <div className="p-2 rounded-xl bg-primary/20 mt-0.5">
                                    <Icon size={15} className="text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm leading-tight">{label}</p>
                                    <p className="text-slate-500 text-[11px] font-medium mt-0.5">{desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Bottom stats row */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="relative z-10 flex gap-8 pt-8 border-t border-white/8"
                >
                    {[['500+', 'Vehicles managed'], ['98%', 'Uptime guaranteed'], ['40%', 'Cost reduction']].map(([val, lbl]) => (
                        <div key={lbl}>
                            <p className="text-white font-extrabold text-2xl tracking-tight">{val}</p>
                            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mt-0.5">{lbl}</p>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* ── Right Panel ── */}
            <div className="flex-1 flex items-center justify-center bg-[#f8fafc] px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="w-full max-w-[400px]"
                >
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2.5 mb-10">
                        <img src="/logo.svg" alt="FleetFlow" className="w-9 h-9" />
                        <span className="text-slate-900 font-extrabold text-xl tracking-tight">FleetFlow</span>
                    </div>

                    {/* Heading */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
                            Welcome back
                        </h1>
                        <p className="text-slate-500 font-medium">Sign in to your fleet command center</p>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: -8, height: 0 }}
                                className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3"
                            >
                                <AlertCircle size={17} className="text-red-500 mt-0.5 flex-shrink-0" />
                                <p className="text-red-600 text-sm font-semibold">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
                                Email Address
                            </label>
                            <div className={`relative rounded-2xl transition-all duration-200 ${focused === 'email' ? 'ring-4 ring-primary/10' : ''}`}>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocused('email')}
                                    onBlur={() => setFocused(null)}
                                    className="w-full h-14 px-5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-primary/40 transition-all text-slate-900 font-semibold placeholder:text-slate-300 placeholder:font-normal"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5 pl-1">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                    Password
                                </label>
                                <button type="button" className="text-[11px] font-bold text-primary hover:text-primary/70 uppercase tracking-widest transition-colors">
                                    Forgot?
                                </button>
                            </div>
                            <div className={`relative rounded-2xl transition-all duration-200 ${focused === 'password' ? 'ring-4 ring-primary/10' : ''}`}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocused('password')}
                                    onBlur={() => setFocused(null)}
                                    className="w-full h-14 pl-5 pr-12 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-primary/40 transition-all text-slate-900 font-semibold placeholder:text-slate-300 placeholder:font-normal"
                                    placeholder="••••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-xl shadow-primary/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <span>Access Command Center</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Demo credentials */}
                    <div className="mt-8 p-4 bg-white border border-dashed border-slate-200 rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center mb-2">Demo Access</p>
                        <button
                            type="button"
                            onClick={() => { setEmail('manager@fleet.com'); setPassword('password123'); }}
                            className="w-full text-center font-mono text-[13px] text-slate-500 hover:text-primary transition-colors font-medium"
                        >
                            manager@fleet.com · password123
                        </button>
                        <p className="text-[10px] text-slate-300 font-medium text-center mt-1.5">Click to autofill ↑</p>
                    </div>

                    <p className="mt-8 text-center text-slate-300 text-xs font-medium">
                        © 2025 FleetFlow Logistics. All rights reserved.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
