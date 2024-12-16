import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { colors } from '@/styles/theme';
import { fonts } from '@/styles/theme';
import { formatTimeMessage } from '@/lib/notifications';
import { getDeadlines } from '@/db/deadlines';
import { useAuth } from '@/providers/AuthProvider';

const NotificationsSettings = () => {
  const { user } = useAuth();
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState<number>(30); 

  // Function to save settings in SecureStore
  const saveSettings = async () => {
    await SecureStore.setItemAsync('notificationsEnabled', JSON.stringify(isNotificationsEnabled));
    await SecureStore.setItemAsync('notificationTime', JSON.stringify(notificationTime));
  };

   // Function to load settings from SecureStore
   const loadSettings = async () => {
    try {
      const notificationsEnabled = await SecureStore.getItemAsync('notificationsEnabled');
      const notificationTime = await SecureStore.getItemAsync('notificationTime');
      
      setIsNotificationsEnabled(notificationsEnabled === null ? true : JSON.parse(notificationsEnabled));
      setNotificationTime(notificationTime === null ? 30 : JSON.parse(notificationTime));
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  // Call loadSettings when the component mounts
  useEffect(() => {
    loadSettings();
  }, []);

  const handleToggleNotifications = async () => {
    const newState = !isNotificationsEnabled;
    setIsNotificationsEnabled(newState);
    if (newState) {
      await rescheduleAllNotifications();
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };
  
  const handleNotificationTimeChange = async (time: number) => {
    setNotificationTime(time);
    await rescheduleAllNotifications();
  };
  
  // Call `saveSettings` after each state change
  useEffect(() => {
    saveSettings();
  }, [isNotificationsEnabled, notificationTime]);

  const scheduleNotification = async (deadline: Date) => {
    if (!isNotificationsEnabled) return;

    try {
      const scheduledTime = new Date(deadline.getTime() - (notificationTime * 60 * 1000));
      const now = new Date();

      if (scheduledTime > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Deadline Approaching",
            body: `Your deadline is due in ${formatTimeMessage(notificationTime)}`,
          },
          trigger: {
            type: 'date',
            date: scheduledTime,
          },
        });
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  // Update the test function to use a future date
  const handleScheduleNotification = () => {
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 2); // Set deadline 2 hours from now
    scheduleNotification(deadline);
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

  const getTimeLabel = (minutes: number) => {
    switch (minutes) {
      case 30: return '30 minutes before';
      case 60: return '1 hour before';
      case 1440: return '1 day before';
      default: return '30 minutes before';
    }
  };

  // Add this function to reschedule all notifications
  const rescheduleAllNotifications = async () => {
    try {
      // First cancel all existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Get all upcoming deadlines
      const deadlines = await getDeadlines(String(user?.id));
      if (!deadlines?.deadlineList) return;

      // Filter for future deadlines
      const futureDeadlines = deadlines.deadlineList.filter(deadline => {
        const deadlineDate = new Date(deadline.date);
        return deadlineDate > new Date();
      });

      // Schedule new notifications for each future deadline
      for (const deadline of futureDeadlines) {
        const deadlineDate = new Date(deadline.date);
        const scheduledTime = new Date(deadlineDate.getTime() - (notificationTime * 60 * 1000));
        const now = new Date();

        if (scheduledTime > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Deadline Approaching",
              body: `${deadline.name} is due in ${formatTimeMessage(notificationTime)}`,
            },
            trigger: {
              type: 'date',
              date: scheduledTime,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error rescheduling notifications:', error);
    }
  };

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

      {/* Updated Notification Time Options */}
      <View style={styles.settingsGroup}>
        <Text style={styles.groupTitle}>Reminder Time</Text>
        <View style={styles.settingsBox}>
          {[30, 60, 1440].map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.settingOption,
                notificationTime === time && styles.selectedOption
              ]}
              onPress={() => handleNotificationTimeChange(time)}
            >
              <View style={styles.settingContent}>
                <Text style={[
                  styles.settingText,
                  notificationTime === time && styles.selectedText
                ]}>
                  {getTimeLabel(time)}
                </Text>
                {notificationTime === time && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.completed} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Current Setting Display */}
      <View style={styles.currentSetting}>
        <Text style={styles.currentSettingText}>
          You will be notified {getTimeLabel(notificationTime).toLowerCase()}
        </Text>
      </View>

      {/* Button to simulate scheduling a notification */}
      <TouchableOpacity style={styles.settingOption} onPress={handleScheduleNotification}>
        <View style={styles.settingContent}>
          <Text style={styles.settingText}>Schedule Test Notification</Text>
        </View>
      </TouchableOpacity>
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
  selectedOption: {
    backgroundColor: '#F0F9FF',  // Light blue background
  },
  selectedText: {
    color: colors.completed,
    fontWeight: '500',
  },
  currentSetting: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  currentSettingText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: fonts.secondary,
  },
});

export default NotificationsSettings;
