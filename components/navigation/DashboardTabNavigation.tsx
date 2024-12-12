import { Tabs } from 'expo-router';
import React from 'react';
import { TabBarIcon } from './TabBarIcon';

export default function DashboardTabNavigation() {
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
          width: '90%',
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
        name="dashboard"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={focused ? '#fff' : 'rgba(255,255,255,0.6)'} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'time' : 'time-outline'} color={focused ? '#fff' : 'rgba(255,255,255,0.6)'} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'stats-chart' : 'stats-chart-outline'} color={focused ? '#fff' : 'rgba(255,255,255,0.6)'} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="upcoming"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'calendar' : 'calendar-outline'} color={focused ? '#fff' : 'rgba(255,255,255,0.6)'} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="submission/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
} 