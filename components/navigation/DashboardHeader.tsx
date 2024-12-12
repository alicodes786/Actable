import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import NotificationDropdown from '@/components/DropDown';
import { fetchNotifications } from '@/db/notifications';
import { ModUser } from '@/db/mod';
import { fonts } from '@/styles/theme';

interface DashboardHeaderProps {
  managedUser: ModUser | null;
}

export default function DashboardHeader({ managedUser }: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<{ message: string }[]>([]);
  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const loadNotifications = async () => {
    if (!user) return;
    const notificationsData = await fetchNotifications(user.id);
    setNotifications(notificationsData);
  };

  useEffect(() => {
    if (!user) return;
    loadNotifications();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await logout();
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <View className="flex-row justify-between items-center p-2 bg-white w-full z-10">
      <Text className="text-lg" style={{ fontFamily: fonts.primary }}>
        {managedUser ? ` Managing: ${managedUser.name}` : 'No User Assigned'}
      </Text>
      <View className="flex-row mr-2 space-x-4">
        <TouchableOpacity onPress={() => setDropdownOpen((prev) => !prev)}>
          <Ionicons name="notifications-outline" size={24} color="black" className="ml-4" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="black" className="ml-4" />
        </TouchableOpacity>
      </View>
      {isDropdownOpen && (
        <NotificationDropdown
          notifications={notifications}
          onClose={() => setDropdownOpen(false)}
        />
      )}
    </View>
  );
} 