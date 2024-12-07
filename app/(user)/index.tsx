import Home from '@/components/screens/Home';
import React, { useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/sign-in');
    } else if (user.isMod) {
      // Redirect moderators to dashboard if they somehow end up here
      router.replace('/(dashboard)/dashboard');
    }
  }, [user]);

  // Only render Home component for non-moderator users
  return user && !user.isMod ? <Home /> : null;
}
