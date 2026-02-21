'use client';

import Link from 'next/link';
import { Search, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-10 md:p-12">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Search size={32} />
                </div>

                <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">404</h1>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Route Not Found</h2>
                <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                    The requested asset path or dashboard module does not exist in the current fleet configuration.
                </p>

                <div className="space-y-4">
                    <Link
                        href="/dashboard"
                        className="w-full h-14 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.98]"
                    >
                        <Home size={20} />
                        Back to Command Center
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="w-full h-14 border-2 border-slate-100 text-slate-500 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-[0.98]"
                    >
                        <ArrowLeft size={20} />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}
