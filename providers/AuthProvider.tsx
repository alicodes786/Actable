import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getAssignedUser, ModUser } from '@/db/mod';
import { useRouter } from 'expo-router';

interface User {
    id: number;
    isMod?: boolean;
    assignedUsers?: number[];
}

interface AuthContextType {
    user: User | null;
    assignedUser: ModUser | null;
    login: (userData: User) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
    loadAssignedUser: (modId: number) => Promise<ModUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [assignedUser, setAssignedUser] = useState<ModUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadUser();
    }, []);

    useEffect(() => {
        const loadModAssignedUser = async () => {
            if (user?.isMod && user.id) {
                const assigned = await loadAssignedUser(user.id);
                setAssignedUser(assigned);
            }
        };

        loadModAssignedUser();
    }, [user]);

    const loadUser = async () => {
        try {
            setIsLoading(true);
            const storedUser = await SecureStore.getItemAsync('user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                setUser(userData);
            }
        } catch (error) {
            console.error('Error loading user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (userData: User) => {
        try {
            await SecureStore.setItemAsync('user', JSON.stringify(userData));
            setUser(userData);
        } catch (error) {
            console.error('Error storing user:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await SecureStore.deleteItemAsync('user');
            setUser(null);
            setAssignedUser(null);
            setTimeout(() => {
                router.replace({
                    pathname: '/(auth)/sign-in',
                    params: {
                        from: 'logout'
                    }
                });
            }, 0);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    const loadAssignedUser = async (modId: number) => {
        try {
            return await getAssignedUser(modId);
        } catch (error) {
            console.error('Error loading user:', error);
            return null;
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            assignedUser, 
            login, 
            logout, 
            isLoading, 
            loadAssignedUser 
        }}>
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