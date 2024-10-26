import { Redirect, Href } from 'expo-router';
import Constants from 'expo-constants';

export default function Index() {
    const skipAuth = Constants.expoConfig?.extra?.skipAuth;
    console.log(skipAuth)
    const isAuthenticated = skipAuth || false;

    if (!isAuthenticated) {
    const path = "/(auth)/sign-in" as Href<any>;
    return <Redirect href={path} />;
    }

    return <Redirect href="/(tabs)" />;
}