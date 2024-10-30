import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';

export default function Settings() {
  const { logout } = useAuth();
  
  const handleSignOut = async () => {
    try {
        await logout();
        router.replace('/(auth)/sign-in');
    } catch (error) {
        console.error('Error signing out:', error);
    }
};


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.settingsBox}>
        <TouchableOpacity style={styles.settingOption}>
          <Text style={styles.settingText}>Notifications</Text>
        </TouchableOpacity>
        <View style={styles.divider} />

        <TouchableOpacity style={styles.settingOption}>
          <Text style={styles.settingText}>Alarm</Text>
        </TouchableOpacity>
        <View style={styles.divider} />

        <TouchableOpacity style={styles.settingOption}>
          <Text style={styles.settingText}>Chat</Text>
        </TouchableOpacity>
        <View style={styles.divider} />

        <TouchableOpacity style={styles.settingOption}>
          <Text style={styles.settingText}>Feedback</Text>
        </TouchableOpacity>
        <View style={styles.divider} />

        <TouchableOpacity style={styles.settingOption}>
          <Text style={styles.settingText}>Coach</Text>
        </TouchableOpacity>
        <View style={styles.divider} />

        <TouchableOpacity style={styles.settingOption} onPress={handleSignOut}>
          <Text style={[styles.settingText, { color: 'red' }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5', // Light background for the page
  },
  settingsBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2, // Adds subtle shadow on Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0', // Light divider color
    marginHorizontal: 20,
  },
});
