import Home from '@/components/screens/Home';
import React, { useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/sign-in');
    }
  }, [user]);

  console.log(`user currently logged in : ${user?.id}`);
  
  return (
    <Home />
  );
}
