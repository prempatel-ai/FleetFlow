import React, { ReactNode } from 'react';
import { AuthProvider } from '../context/AuthContext';
import './globals.css';

export const metadata = {
    title: 'FleetFlow — Global Logistics Control',
    description: 'Fleet and Logistics Management System — track vehicles, trips, drivers and analytics in real time.',
    icons: {
        icon: '/logo.svg',
        shortcut: '/logo.svg',
    },
};

interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
