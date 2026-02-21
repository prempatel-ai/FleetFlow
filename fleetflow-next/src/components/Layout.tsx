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
        <div className="flex bg-background min-h-screen relative overflow-hidden font-outfit selection:bg-primary/20">
            {/* Mesh Background Effects - Optimized for Lightness */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[80px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-success/15 rounded-full blur-[60px]" />
                <div className="absolute top-[20%] right-[10%] w-[25%] h-[25%] bg-accent/15 rounded-full blur-[50px]" />
            </div>

            <Sidebar />

            <main className="flex-1 p-6 md:p-8 lg:p-10 relative z-10 h-screen overflow-y-auto overflow-x-hidden scrollbar-hide">
                <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
