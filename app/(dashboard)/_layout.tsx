import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchNotifications } from '@/db/notifications';
import NotificationDropdown from '@/components/DropDown';
import { useAuth } from '@/providers/AuthProvider';
import { ModUser } from '@/db/mod';

export default function DashboardLayout() {
  const { user, loadAssignedUser } = useAuth();
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

  // Load managed user when the component mounts
  useEffect(() => {
    const loadUser = async () => {
      if (user?.isMod) {
        const assignedUser = await loadAssignedUser(user.id);
        setManagedUser(assignedUser);
      }
    };

    loadUser();
  }, [user]);


  if (!user?.isMod) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-white mt-8 overflow-visible">
      {/* Header */}
      <View className="flex-row justify-between items-center p-2 bg-white w-full z-10">
        <Text className="font-bold text-lg">
          {managedUser ? `Managing ${managedUser.name}` : 'No User Assigned'}
        </Text>
        <View className="flex-row mr-2 space-x-4">
          <TouchableOpacity onPress={() => setDropdownOpen((prev) => !prev)}>
            <Ionicons name="notifications-outline" size={24} color="black" className="ml-4" />
          </TouchableOpacity>
          <Ionicons
            name="person-circle-outline"
            size={24}
            color="black"
            className="ml-4"
            onPress={() => router.push('/settings')}
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
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#000',
          headerShown: false,
          tabBarStyle: {
            height: 70,
            paddingBottom: 10,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'time' : 'time-outline'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="tracker"
          options={{
            title: 'Tracker',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'stats-chart' : 'stats-chart-outline'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="upcoming"
          options={{
            title: 'Upcoming',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'calendar' : 'calendar-outline'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="submission/[id]"
          options={{
            href: null,  // This prevents the tab from showing
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
} 