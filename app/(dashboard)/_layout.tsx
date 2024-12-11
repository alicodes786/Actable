import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchNotifications } from '@/db/notifications';
import NotificationDropdown from '@/components/DropDown';
import { useAuth } from '@/providers/AuthProvider';
import { ModUser } from '@/db/mod';
import DashboardTabNavigation from '@/components/navigation/DashboardTabNavigation';

export default function DashboardLayout() {
  const { user, loadAssignedUser, logout } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<{ message: string }[]>([]);
  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [managedUser, setManagedUser] = useState<ModUser | null>(null);

  const loadNotifications = async () => {
    if (!user) return;
    const notificationsData = await fetchNotifications(user.id);
    setNotifications(notificationsData);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      if (user?.role === 'mod') {
        const assignedUser = await loadAssignedUser(user.id);
        setManagedUser(assignedUser);
      }
    };

    loadUser();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await logout();
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  if (user?.role !== 'mod') {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-white mt-8 overflow-visible">
      {/* Header */}
      <View className="flex-row justify-between items-center p-2 bg-white w-full z-10">
        <Text className="font-bold text-lg" style={{ fontFamily: 'Manrope' }}>
          {managedUser ? `Managing ${managedUser.name}` : 'No User Assigned'}
        </Text>
        <View className="flex-row mr-2 space-x-4">
          <TouchableOpacity onPress={() => setDropdownOpen((prev) => !prev)}>
            <Ionicons name="notifications-outline" size={24} color="black" className="ml-4" />
          </TouchableOpacity>
          <Ionicons
            name="log-out-outline"
            size={24}
            color="black"
            className="ml-4"
            onPress={handleSignOut}
          />
        </View>
        {isDropdownOpen && (
          <NotificationDropdown
            notifications={notifications}
            onClose={() => setDropdownOpen(false)}
          />
        )}
      </View>

      {/* Tab Navigation */}
      <DashboardTabNavigation />
    </SafeAreaView>
  );
} 