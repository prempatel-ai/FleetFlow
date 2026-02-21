'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Car,
    UserSquare2,
    Map,
    Wrench,
    Fuel,
    BarChart3,
    ChevronRight,
    Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
    const auth = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        auth.logout();
        router.push('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Vehicles', path: '/vehicles', icon: Car },
        { name: 'Drivers', path: '/drivers', icon: UserSquare2 },
        { name: 'Trips', path: '/trips', icon: Map },
        { name: 'Maintenance', path: '/maintenance', icon: Wrench },
        { name: 'Financials', path: '/financials', icon: Fuel },
        { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    ];

    return (
        <div className="w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 h-screen sticky top-0 flex flex-col z-50 transition-all duration-300">
            {/* Logo Section */}
            <div className="p-8 mb-4">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 rotate-3 group-hover:rotate-0 transition-transform">
                        <div className="w-4 h-4 border-2 border-white rounded rotate-45" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none mb-1">FleetFlow</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Logistics</p>
                    </div>
                </div>
            </div>


            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto scrollbar-hide">
                {navItems.map((item) => {
                    const isActive = pathname === item.path || (pathname === '/' && item.path === '/dashboard');
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.path}
                            className="block relative group"
                        >
                            <div className={`flex items-center justify-between px-4 py-3.5 rounded-2xl font-semibold transition-all duration-300 relative z-10 ${isActive
                                ? 'text-primary'
                                : 'text-slate-500 hover:text-slate-900'
                                }`}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-primary/10' : 'bg-transparent group-hover:bg-slate-100'
                                        }`}>
                                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                    </div>
                                    <span className="text-[13px] tracking-tight">{item.name}</span>
                                </div>
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute inset-0 bg-primary/5 rounded-2xl border border-primary/10 -z-10 shadow-[0_4px_12px_rgba(37,99,235,0.08)]"
                                    />
                                )}
                                {isActive && <ChevronRight size={14} className="text-primary/50" />}
                            </div>
                        </Link>
                    );
                })}
            </nav>

        </div>
    );
};

export default Sidebar;
