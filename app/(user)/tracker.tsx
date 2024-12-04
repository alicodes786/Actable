import React from 'react';
import { SafeAreaView } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import Tracker from '@/components/Tracker';

export default function UserTrackerScreen() {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Tracker userId={String(user.id)} />
    </SafeAreaView>
  );
}
