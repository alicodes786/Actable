import Home from '@/components/screens/Home';
import React from 'react';
import { useAuth } from '@/providers/AuthProvider';

export default function HomeScreen() {
  const { user } = useAuth();
  console.log(`user currently logged in : ${user}`)
  return (
    <Home />
);
}
