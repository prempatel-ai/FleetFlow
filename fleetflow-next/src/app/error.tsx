'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global Error Boundary caught:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-10 md:p-12">
                <div className="w-16 h-16 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle size={32} />
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-2">System Interruption</h1>
                <p className="text-slate-500 font-medium mb-8">
                    The hub encountered an unexpected operational error. Our telemetry has been updated.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={() => reset()}
                        className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-[0.98]"
                    >
                        <RefreshCcw size={20} />
                        Attempt Recovery
                    </button>

                    <Link
                        href="/dashboard"
                        className="w-full h-14 bg-slate-100 text-slate-600 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all active:scale-[0.98]"
                    >
                        <Home size={20} />
                        Return to Dashboard
                    </Link>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-50">
                    <p className="text-[10px] text-slate-300 font-mono uppercase tracking-widest">
                        Digest Code: {error.digest || 'FLT-ERR-UNKNOWN'}
                    </p>
                </div>
            </div>
        </div>
    );
}
