import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/AuthProvider';
import { ModUser } from '@/db/mod';
import DashboardTabNavigation from '@/components/navigation/DashboardTabNavigation';
import DashboardHeader from '@/components/navigation/DashboardHeader';

export default function DashboardLayout() {
  const { user, loadAssignedUser } = useAuth();
  const [managedUser, setManagedUser] = useState<ModUser | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      if (user?.role === 'mod') {
        const assignedUser = await loadAssignedUser(user.id);
        setManagedUser(assignedUser);
      }
    };

    loadUser();
  }, [user]);

  if (user?.role !== 'mod') {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-white mt-8 overflow-visible">
      <DashboardHeader managedUser={managedUser} />
      <DashboardTabNavigation />
    </SafeAreaView>
  );
} 