import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { View, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/AuthProvider';

const TabLayout: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white mt-8 overflow-visible">
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
            tabBarButton: (props) => {
              const { style, onPress, children } = props;
              return (
                <TouchableOpacity 
                  style={style as StyleProp<ViewStyle>}
                  onPress={onPress}
                  activeOpacity={0.7}
                >
                  {children}
                </TouchableOpacity>
              );
            },
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
