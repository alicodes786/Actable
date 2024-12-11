import { Tabs } from 'expo-router';
import React from 'react';
import { View, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabBarIcon } from './TabBarIcon';

export default function TabNavigation() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
        headerShown: false,
        tabBarStyle: {
          height: 60,
          backgroundColor: '#000',
          position: 'fixed',
          bottom: 16,
          width:'90%',
          left: 0,
          alignSelf: 'center',
          justifyContent: 'center',
          right: 0,
          borderRadius: 30,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.25,
          shadowRadius: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="viewDeadlines"
        options={{
          title: 'Deadlines',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'time' : 'time-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="addDeadline"
        options={{
          title: '',
          tabBarIcon: () => (
            <View className="h-12 w-12 items-center justify-center bg-white rounded-full border-2 border-black">
              <Ionicons name="add" size={32} color="black" />
            </View>
          ),
          tabBarItemStyle: { height: 50 },
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: 'Tracker',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'stats-chart' : 'stats-chart-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: 'Coach',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} size={24} />
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
  );
}

