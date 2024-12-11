import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import NotificationDropdown from '@/components/DropDown';
import { fetchNotifications } from '@/db/notifications';
import { getUserName } from '@/db/users';

export default function Header() {
  const { user } = useAuth();
  const [userName, setUserName] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<{ message: string }[]>([]);
  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const loadNotifications = async () => {
    if (!user) return;
    const notificationsData = await fetchNotifications(user?.id);
    setNotifications(notificationsData);
  };

  useEffect(() => {
    if (!user) return;

    const fetchUserName = async () => {
      try {
        const name = await getUserName(user?.id);
        setUserName(name);
      } catch (error) {
        console.error('Error fetching user name:', error);
      }
    };

    fetchUserName();
    loadNotifications();
  }, [user]);

  return (
    <View className="px-5 pt-2">
      <View className="flex-row justify-between items-center">
        <Text className="text-lg font-medium" style={{ fontFamily: 'Manrope' }}>
          Welcome {userName || 'Loading...'}
        </Text>
        <View className="flex-row space-x-4">
          <TouchableOpacity onPress={() => setDropdownOpen((prev) => !prev)}>
            <Ionicons name="notifications-outline" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Ionicons name="person-circle-outline" size={24} color="black" />
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