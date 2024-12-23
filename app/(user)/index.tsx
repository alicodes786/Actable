import Home from '@/components/screens/Home';
import React, { useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuth();
  
  useEffect(() => {
    console.log('HomeScreen: User state changed -', { userRole: user?.role });
    
    if (!user) {
      router.replace('/(auth)/sign-in');
    } else if (user.role === 'mod') {
      // Redirect moderators to dashboard if they somehow end up here
      router.replace('/(dashboard)/dashboard');
    }
  }, [user]);

  // Only render Home component for non-moderator users
  console.log('HomeScreen: Rendering with user role -', user?.role);
  return user && user.role !== 'mod' ? <Home /> : null;
}
