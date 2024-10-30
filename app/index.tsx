import { Redirect, Href } from 'expo-router';
import Constants from 'expo-constants';
import { useAuth } from '@/providers/AuthProvider';

export default function Index() {
    const skipAuth = Constants.expoConfig?.extra?.skipAuth;
    const { user } = useAuth();
    const isAuthenticated = skipAuth || user;
    
    if (!isAuthenticated) {
        const path = "/(auth)/sign-in" as Href<any>;
        return <Redirect href={path} />;
    }
    return <Redirect href="/(tabs)" />;
}