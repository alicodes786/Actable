import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

const NotificationsSettings = () => {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState<number>(30); // Default to 30 minutes

  const handleToggleNotifications = () => {
    setIsNotificationsEnabled(prev => !prev);
  };

  const handleNotificationTimeChange = (time: number) => {
    setNotificationTime(time);
  };

  const scheduleNotification = async (deadline: Date) => {
    if (!isNotificationsEnabled) return;

    const notificationTriggerTime = new Date(deadline.getTime() - notificationTime * 60 * 1000); // Time in milliseconds

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Upcoming Deadline",
        body: `Reminder: Your deadline is approaching!`,
        data: { deadlineId: 'someId' }, // You can pass dynamic data here
      },
      trigger: notificationTriggerTime, // Set the time based on user preference
    });
  };

  const renderSettingItem = (icon: string, label: string, onPress?: () => void) => (
    <TouchableOpacity style={styles.settingOption} onPress={onPress} activeOpacity={0.7}>
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
      <Text style={styles.title}>Notifications Settings</Text>

      {/* Notifications Toggle */}
      <View style={styles.settingsGroup}>
        <Text style={styles.groupTitle}>General</Text>
        <View style={styles.settingsBox}>
          <TouchableOpacity style={styles.settingOption} onPress={handleToggleNotifications}>
            <View style={styles.settingContent}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={22} color="#333" style={styles.icon} />
                <Text style={styles.settingText}>Enable Notifications</Text>
              </View>
              <Switch value={isNotificationsEnabled} onValueChange={handleToggleNotifications} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification Time Options */}
      <View style={styles.settingsGroup}>
        <Text style={styles.groupTitle}>Reminder Time</Text>
        <View style={styles.settingsBox}>
          <TouchableOpacity
            style={styles.settingOption}
            onPress={() => handleNotificationTimeChange(30)}
          >
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>30 minutes before</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingOption}
            onPress={() => handleNotificationTimeChange(60)}
          >
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>1 hour before</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingOption}
            onPress={() => handleNotificationTimeChange(1440)} // 1 day = 1440 minutes
          >
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>1 day before</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    color: '#333333',
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

export default NotificationsSettings;
