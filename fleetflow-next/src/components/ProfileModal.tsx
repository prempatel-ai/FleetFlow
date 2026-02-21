'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    User,
    Shield,
    Settings,
    Camera,
    Check,
    Mail,
    Briefcase,
    Bell,
    Globe,
    Moon,
    LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
    const { user, updateUser, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'general' | 'security' | 'settings'>('general');
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const defaultAvatars = [
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Jace',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Mimi',
    ];

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        updateUser({ name, email });
        setIsSaving(false);
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateUser({ profilePhoto: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const selectAvatar = (url: string) => {
        updateUser({ profilePhoto: url });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-2xl bg-white/90 glass rounded-[40px] shadow-[0_32px_128px_rgba(0,0,0,0.2)] border border-white/60 overflow-hidden flex flex-col md:flex-row h-[700px] max-h-[90vh]"
                >
                    {/* Sidebar / Tabs */}
                    <div className="w-full md:w-64 bg-slate-50/50 border-r border-slate-100 p-8 flex flex-col gap-2">
                        <div className="mb-8">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">Account</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manage your profile</p>
                        </div>

                        {[
                            { id: 'general', label: 'General Info', icon: User },
                            { id: 'security', label: 'Security', icon: Shield },
                            { id: 'settings', label: 'Settings', icon: Settings },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-300 ${activeTab === tab.id
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'text-slate-500 hover:bg-white hover:text-slate-900'
                                    }`}
                            >
                                <tab.icon size={18} strokeWidth={2.5} />
                                <span className="text-xs uppercase tracking-wider">{tab.label}</span>
                            </button>
                        ))}

                        <div className="mt-auto pt-8 border-t border-slate-100">
                            <button
                                onClick={() => { logout(); onClose(); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-danger/60 hover:text-danger hover:bg-danger/5 rounded-2xl font-bold transition-all duration-300"
                            >
                                <LogOut size={18} strokeWidth={2.5} />
                                <span className="text-xs uppercase tracking-wider">Logout System</span>
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-10 overflow-y-auto scrollbar-hide relative">
                        <button
                            onClick={onClose}
                            className="absolute top-8 right-8 p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {activeTab === 'general' && (
                            <div className="space-y-10 animate-fade-in">
                                {/* Profile Photo Section */}
                                <div className="flex flex-col items-center gap-6">
                                    <div className="relative group">
                                        <div className="w-32 h-32 rounded-[40px] overflow-hidden border-4 border-white shadow-2xl relative">
                                            {user?.profilePhoto ? (
                                                <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-black">
                                                    {user?.name?.[0]}
                                                </div>
                                            )}
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm"
                                            >
                                                <Camera className="text-white" size={32} />
                                            </div>
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handlePhotoUpload}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-success rounded-2xl border-4 border-white shadow-xl flex items-center justify-center text-white">
                                            <Check size={20} strokeWidth={3} />
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        {defaultAvatars.map((url, i) => (
                                            <button
                                                key={i}
                                                onClick={() => selectAvatar(url)}
                                                className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all hover:scale-110 ${user?.profilePhoto === url ? 'border-primary shadow-lg shadow-primary/20 scale-110' : 'border-transparent'
                                                    }`}
                                            >
                                                <img src={url} alt="Avatar" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Form Section */}
                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Display Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">System Role</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                type="text"
                                                value={user?.role}
                                                disabled
                                                className="w-full pl-12 pr-4 py-4 bg-slate-100/50 border border-slate-100 rounded-2xl font-bold text-slate-400 cursor-not-allowed uppercase tracking-widest text-[10px]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Check size={16} strokeWidth={3} />
                                            Save Profile Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                            <Shield size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 leading-tight">Password Management</h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Update your system access</p>
                                        </div>
                                    </div>
                                    <button className="w-full py-3 bg-white border border-slate-100 rounded-xl font-bold text-slate-600 hover:text-primary hover:border-primary/20 transition-all text-sm shadow-sm">
                                        Send Password Reset Email
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 px-6 bg-white border border-slate-50 rounded-2xl shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                                <Briefcase size={18} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-slate-800">Two-Factor Authentication</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Extra layer of security</p>
                                            </div>
                                        </div>
                                        <div className="w-12 h-6 bg-slate-100 rounded-full relative p-1 cursor-pointer">
                                            <div className="w-4 h-4 bg-white rounded-full shadow-md" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-6 animate-fade-in">
                                {[
                                    { label: 'Push Notifications', icon: Bell, sub: 'Updates on dispatch & trips', enabled: true },
                                    { label: 'Dark Interface', icon: Moon, sub: 'Optimized for night viewing', enabled: false },
                                    { label: 'Language Localization', icon: Globe, sub: 'Current: English (International)', enabled: true },
                                ].map((setting, i) => (
                                    <div key={i} className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow cursor-default group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${setting.enabled ? 'bg-primary/10 text-primary' : 'bg-slate-50 text-slate-400'}`}>
                                                <setting.icon size={22} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-black text-slate-800 group-hover:text-primary transition-colors">{setting.label}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{setting.sub}</p>
                                            </div>
                                        </div>
                                        <div className={`w-14 h-7 rounded-full relative p-1 transition-colors ${setting.enabled ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-slate-200'}`}>
                                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${setting.enabled ? 'translate-x-[26px]' : 'translate-x-0'}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ProfileModal;
