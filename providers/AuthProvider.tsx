import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
    user: number | null;
    login: (user: number) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            setIsLoading(true);
            const storedUser = await SecureStore.getItemAsync('user');
            if (storedUser) {
                const userId = parseInt(storedUser);
                if (!isNaN(userId)) {
                    setUser(userId);
                }
            }
        } catch (error) {
            console.error('Error loading user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (userId: number) => {
        try {
            await SecureStore.setItemAsync('user', String(userId));
            setUser(userId);
        } catch (error) {
            console.error('Error storing user:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await SecureStore.deleteItemAsync('user');
            setUser(null);
        } catch (error) {
            console.error('Error removing user:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};