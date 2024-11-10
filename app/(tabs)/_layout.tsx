import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchNotifications } from '@/db/notifications';
import NotificationDropdown from '@/components/DropDown';
import { useAuth } from '@/providers/AuthProvider';

const TabLayout: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<{ message: string }[]>([]);
  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const loadNotifications = async () => {
    if (!user) return;
    const notificationsData = await fetchNotifications(user);
    setNotifications(notificationsData);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white mt-8 overflow-visible">
      {/* Header */}
      <View className="flex-row justify-end  items-center p-2 bg-white w-full z-10">
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
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="viewDeadlines"
          options={{
            title: 'Deadlines',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'time' : 'time-outline'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="addDeadline"
          options={{
            title: '',
            tabBarIcon: () => (
              <View className="absolute bottom-0 h-14 w-14 items-center justify-center bg-black rounded-full shadow-md">
                <Ionicons name="add" size={36} color="white" />
              </View>
            ),
            tabBarItemStyle: { height: 60, marginTop: -20 },
            tabBarButton: (props) => (
              <TouchableOpacity {...props} style={props.style} activeOpacity={0.7} />
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
          name="coach"
          options={{
            title: 'Coach',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="submission"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
};

export default TabLayout;
