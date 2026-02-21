'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ChevronRight, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { AxiosError } from 'axios';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] selection:bg-primary/10">
            <div className="w-full max-w-[440px] px-6">
                <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-10 md:p-12 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                    {/* Header */}
                    <div className="mb-10">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20 rotate-12 transition-transform hover:rotate-0">
                            <div className="w-5 h-5 border-2 border-white rounded-md rotate-45" />
                        </div>
                        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight leading-tight mb-2">
                            Welcome back
                        </h1>
                        <p className="text-slate-500 font-medium">
                            Enterprise Fleet Management System
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-8 p-4 bg-danger/5 border border-danger/10 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <AlertCircle size={18} className="text-danger mt-0.5" />
                            <p className="text-danger text-sm font-semibold leading-relaxed">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                                Identity
                            </label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-14 pl-5 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 focus:bg-white transition-all duration-300 text-slate-900 font-medium placeholder:text-slate-300"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between pl-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    Security
                                </label>
                                <button type="button" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest">
                                    Reset
                                </button>
                            </div>
                            <div className="relative group">
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-14 pl-5 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 focus:bg-white transition-all duration-300 text-slate-900 font-medium placeholder:text-slate-300"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl shadow-slate-200 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <span>Enterprise Login</span>
                                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="mt-10 pt-10 border-t border-slate-50">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-1 text-center">
                                Demo Credentials
                            </p>
                            <p className="text-[13px] text-slate-600 font-mono text-center">
                                manager@fleet.com / password123
                            </p>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-slate-400 text-xs font-medium">
                    &copy; 2024 FleetFlow Logistics. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Login;
