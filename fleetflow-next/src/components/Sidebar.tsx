'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Car,
    UserSquare2,
    Map,
    Wrench,
    Fuel,
    BarChart3,
    LogOut
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
        <div className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col">
            <div className="p-6 border-b border-slate-100">
                <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                    FleetFlow
                </h1>
                <p className="text-xs text-slate-400 font-medium">Logistics Hub</p>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {Icon && <Icon size={20} />}
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {auth.user?.name?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{auth.user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{auth.user?.role}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:text-danger hover:bg-danger/5 rounded-lg font-medium transition-colors"
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
