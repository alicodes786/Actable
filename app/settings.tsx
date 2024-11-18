import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { Ionicons } from '@expo/vector-icons';

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

  const renderSettingItem = (icon: string, label: string, onPress?: () => void) => (
    <TouchableOpacity 
      style={styles.settingOption}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingContent}>
        <View style={styles.settingLeft}>
          <Ionicons name={icon as any} size={22} color="#333" style={styles.icon} />
          <Text style={styles.settingText}>{label}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Pro Banner */}
      <TouchableOpacity style={styles.proBanner} activeOpacity={0.9}>
        <View style={styles.proTextContainer}>
          <Text style={styles.proTitle}>Get Unlimited Access</Text>
          <Text style={styles.proSubtitle}>to Everything</Text>
        </View>
        <TouchableOpacity style={styles.proButton}>
          <Text style={styles.proButtonText}>Go Pro</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Settings Groups */}
      <View style={styles.settingsGroup}>
        <Text style={styles.groupTitle}>General</Text>
        <View style={styles.settingsBox}>
          {renderSettingItem('notifications-outline', 'Notifications', () => router.push('/notifications'))}
          {renderSettingItem('alarm-outline', 'Alarm')}
          {renderSettingItem('chatbubbles-outline', 'Chat')}
        </View>
      </View>

      <View style={styles.settingsGroup}>
        <Text style={styles.groupTitle}>About App</Text>
        <View style={styles.settingsBox}>
          {renderSettingItem('star-outline', 'Feedback', () => router.push('/feedbackForm'))}
          {renderSettingItem('person-outline', 'Coach')}
          {renderSettingItem('card-outline', 'Billing & Payment')}
          {renderSettingItem('log-out-outline', 'Sign Out', handleSignOut)}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  proBanner: {
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proTextContainer: {
    flex: 1,
  },
  proTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  proSubtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.8,
  },
  proButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  proButtonText: {
    color: '#000000',
    fontWeight: '600',
  },
  settingsGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
    marginLeft: 4,
  },
  settingsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  settingOption: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#333333',
  },
});