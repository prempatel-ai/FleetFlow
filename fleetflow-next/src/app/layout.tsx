import React, { ReactNode } from 'react';
import { AuthProvider } from '../context/AuthContext';
import './globals.css';

export const metadata = {
    title: 'FleetFlow - Logistics Management',
    description: 'Fleet and Logistics Management System',
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
