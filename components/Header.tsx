import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import NotificationDropdown from '@/components/DropDown';
import { fetchNotifications } from '@/db/notifications';
import { getUserName } from '@/db/users';

export default function Header() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<{ message: string }[]>([]);
  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const loadNotifications = async () => {
    if (!user) return;
    const notificationsData = await fetchNotifications(user?.id);
    setNotifications(notificationsData);
  };

  useEffect(() => {
    if (!user) return;
    loadNotifications();
  }, [user]);

  return (
    <View className="px-5 pt-2">
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <View className="h-10 w-10 rounded-full bg-gray-200 items-center justify-center">
            <Text className="text-gray-600 text-lg" style={{ fontFamily: 'Manrope' }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text className="ml-3 text-base font-medium" style={{ fontFamily: 'Manrope' }}>
            {user?.name || 'User'}
          </Text>
        </View>
        <View className="flex-row space-x-4">
          <TouchableOpacity onPress={() => setDropdownOpen((prev) => !prev)}>
            <Ionicons name="notifications-outline" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
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