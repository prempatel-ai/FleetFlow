'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, ChevronDown } from 'lucide-react';
import ProfileModal from './ProfileModal';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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
        <div className="flex bg-background min-h-screen font-outfit selection:bg-primary/20">
            {/* Mesh Background Effects */}
            <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[80px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-success/15 rounded-full blur-[60px]" />
                <div className="absolute top-[20%] right-[10%] w-[25%] h-[25%] bg-accent/15 rounded-full blur-[50px]" />
            </div>

            <Sidebar />

            {/* Main content — offset by sidebar width */}
            <div className="flex-1 flex flex-col min-h-screen relative z-10 ml-72">
                {/* Modern Top Header with Profile Dropdown */}
                <header className="h-20 flex items-center justify-end px-8 md:px-12 relative z-[200]">
                    <div className="flex items-center gap-6">
                        {/* Profile Dropdown Container */}
                        <div className="relative group">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-3 p-1.5 pr-4 glass hover:bg-white/50 rounded-2xl transition-all duration-300 group border border-white/40 shadow-sm hover:shadow-md"
                            >
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner border border-primary/5 overflow-hidden">
                                    {user?.profilePhoto ? (
                                        <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        user?.name?.[0] || 'U'
                                    )}
                                </div>
                                <div className="text-left hidden sm:block">
                                    <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{user?.role}</p>
                                </div>
                                <motion.div
                                    animate={{ rotate: isProfileOpen ? 180 : 0 }}
                                    className="text-slate-400"
                                >
                                    <ChevronDown size={14} />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <>
                                        {/* Backdrop for closing */}
                                        <div
                                            className="fixed inset-0 z-[210]"
                                            onClick={() => setIsProfileOpen(false)}
                                        />

                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2, ease: "easeOut" }}
                                            className="absolute right-0 mt-3 w-64 glass rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/60 p-2.5 z-[220] overflow-hidden"
                                        >
                                            <div className="px-4 py-3 border-b border-slate-100/50 mb-2">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Signed in as</p>
                                                <p className="text-sm font-bold text-slate-900 truncate">{user?.email}</p>
                                            </div>

                                            <div className="space-y-1">
                                                <button
                                                    onClick={() => {
                                                        setIsProfileModalOpen(true);
                                                        setIsProfileOpen(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-200 group"
                                                >
                                                    <div className="p-1.5 rounded-lg bg-slate-50 group-hover:bg-primary/10 transition-colors">
                                                        <User size={16} />
                                                    </div>
                                                    <span className="text-[13px] font-semibold">Account Profile</span>
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        const auth = { logout }; // Mocking for internal ref
                                                        logout();
                                                        router.push('/login');
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-danger hover:bg-danger/5 rounded-xl transition-all duration-200 group"
                                                >
                                                    <div className="p-1.5 rounded-lg bg-slate-50 group-hover:bg-danger/10 transition-colors">
                                                        <LogOut size={16} />
                                                    </div>
                                                    <span className="text-[13px] font-semibold">Sign Out System</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 md:p-8 lg:p-10 h-[calc(100vh-80px)] overflow-y-auto overflow-x-hidden scrollbar-hide">
                    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>

            {/* Profile Modal */}
            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
        </div>
    );
};

export default Layout;
