import { Redirect, Href } from 'expo-router';
import Constants from 'expo-constants';
import { useAuth } from '@/providers/AuthProvider';
import { View, Text } from 'react-native';

export default function Index() {
    const skipAuth = Constants.expoConfig?.extra?.skipAuth;
    const { user } = useAuth();
    const isAuthenticated = skipAuth || user;
    
    console.log('Index: Auth state -', { isAuthenticated, user: user?.role });

    if (!isAuthenticated) {
        const path: Href = "/(auth)/sign-in";
        return <Redirect href={path} />;
    }

    // Redirect based on user's mod status
    const path: Href = user?.role === 'mod' ? '/(dashboard)/dashboard' : '/(user)';
    return <Redirect href={path} />;
}