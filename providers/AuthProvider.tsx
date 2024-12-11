import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '@/lib/db';
import { useRouter } from 'expo-router';
import { getAssignedUser } from '@/db/mod';
import { Session } from '@supabase/supabase-js';

export interface User {
    id: string;
    email?: string;
    name: string;
    role: 'user' | 'mod' | 'admin';
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    assignedUser: User | null;
    login: (userData: User) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
    loadAssignedUser: (modId: string) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [assignedUser, setAssignedUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Initialise auth state and listen for Supabase auth changes
    useEffect(() => {
        loadUser();

        // Subscribe to auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, currentSession) => {
                if (currentSession) {
                    setSession(currentSession);
                    // Get user profile after successful auth
                    const { data: profile } = await supabase
                        .from('user_profiles')
                        .select('*')
                        .eq('id', currentSession.user.id)
                        .single();
                    
                    if (profile) {
                        // Cache user data for offline access
                        await SecureStore.setItemAsync('user', JSON.stringify(profile));
                        setUser(profile);
                    }
                } else {
                    // Clear auth state on session end
                    setSession(null);
                    setUser(null);
                    await SecureStore.deleteItemAsync('user');
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Load assigned user data for moderators
    useEffect(() => {
        const loadModAssignedUser = async () => {
            if (user?.role === 'mod' && user.id) {
                const assigned = await loadAssignedUser(user.id);
                setAssignedUser(assigned);
            }
        };

        loadModAssignedUser();
    }, [user]);

    // Initial load: Check SecureStore for cached user and verify Supabase session
    const loadUser = async () => {
        try {
            setIsLoading(true);
            const storedUser = await SecureStore.getItemAsync('user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                setUser(userData);
            }
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            setSession(currentSession);
        } catch (error) {
            console.error('Error loading user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadAssignedUser = async (modId: string): Promise<User | null> => {
        try {
            return await getAssignedUser(modId);
        } catch (error) {
            console.error('Error loading assigned user:', error);
            return null;
        }
    };

    const login = async (userData: User) => {
        try {
            await SecureStore.setItemAsync('user', JSON.stringify(userData));
            setUser(userData);
            
            if (userData.role === 'mod') {
                router.replace('/(dashboard)/dashboard');
            } else {
                router.replace('/(user)');
            }
        } catch (error) {
            console.error('Error storing user:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
            await SecureStore.deleteItemAsync('user');
            setUser(null);
            setSession(null);
            setAssignedUser(null);
            router.replace('/(auth)/sign-in');
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            session,
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