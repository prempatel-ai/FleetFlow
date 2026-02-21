'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode, useMemo } from 'react';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (userData: User & { token: string }) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                setUser(JSON.parse(userInfo));
            } catch (e) {
                console.error('Failed to parse user info', e);
            }
        }
        setLoading(false);
    }, []);

    const login = (userData: User & { token: string }) => {
        localStorage.setItem('userInfo', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    const contextValue = useMemo(() => ({
        user,
        login,
        logout,
        loading
    }), [user, loading]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
