import { Redirect, Href } from 'expo-router';
import Constants from 'expo-constants';
import { useAuth } from '@/providers/AuthProvider';

export default function Index() {
    const skipAuth = Constants.expoConfig?.extra?.skipAuth;
    const { user } = useAuth();
    const isAuthenticated = skipAuth || user;
    
    if (!isAuthenticated) {
        const path: Href = "/(auth)/sign-in";
        return <Redirect href={path} />;
    }

    // Redirect based on user's mod status
    const path: Href = user?.role === 'mod' ? '/(dashboard)/dashboard' : '/(user)';
    return <Redirect href={path} />;
}