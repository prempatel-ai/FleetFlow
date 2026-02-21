'use client';

import React, { ReactNode, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-[10px]">
                    Initializing Fleet Control
                </p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="flex bg-slate-50 min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
