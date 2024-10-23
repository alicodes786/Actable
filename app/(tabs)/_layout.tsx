import { Tabs } from 'expo-router';
import React from 'react';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.container}>
      {/* Custom Top Bar */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Welcome, Hassan</Text>
        <View style={styles.icons}>
          <Ionicons name="notifications-outline" size={24} color="black" style={styles.icon} />
          <Ionicons name="person-circle-outline" size={24} color="black" style={styles.icon} />
        </View>
      </View>

      {/* Tab Navigation */}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors["light"].tint,
          headerShown: false,
          tabBarStyle: {
            height: 70,
            paddingBottom: 10,
          },
        }}
      >
        {/* Home Screen */}
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
          name="ViewDeadlines"
          options={{
            title: 'Deadlines',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'time' : 'time-outline'} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="AddDeadline"
          options={{
            title: '',
            tabBarIcon: ({ color }) => (
              <View style={styles.addButtonContainer}>
                <Ionicons
                  name={'add-circle'}
                  size={56}
                  color={color}
                  style={styles.addButton}
                />
              </View>
            ),
            tabBarItemStyle: {
              height: 60,
              marginTop: -20, // Adjust this value to control how much the button sticks out
            },
          }}
        />

        {/* Tracker Screen */}
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
          name="Coach"
          options={{
            title: 'Coach',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
            ),
          }}
        />
        
      </Tabs>
    </View>

    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
    width: '100%',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'light',
  },
  icons: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 15,
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 0,
    height: 56,
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});