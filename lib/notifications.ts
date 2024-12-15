import * as Notifications from 'expo-notifications';
import { createNotification } from '@/db/notifications';


interface NotificationScheduleResult {
  success: boolean;
  notificationId?: string;
  error?: string;
}

export async function scheduleDeadlineNotification(
  userId: string,
  deadlineId: number,
  deadlineName: string,
  deadlineDate: Date,
  notificationTime: number
): Promise<NotificationScheduleResult> {
  try {
    const reminderTime = new Date(deadlineDate.getTime() - notificationTime * 60 * 1000); // Calculate reminder time

    // Check if reminder time is valid (in the future)
    if (reminderTime.getTime() <= new Date().getTime()) {
      throw new Error('Reminder time must be in the future');
    }

    const notificationMessage = `Reminder: The deadline "${deadlineName}" is coming up in ${notificationTime} minutes.`;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Upcoming Deadline Reminder',
        body: notificationMessage,
        data: { deadlineId },
      },
      trigger: reminderTime,
    });

    await createNotification(userId, deadlineId, notificationMessage, reminderTime);

    return { 
      success: true,
      notificationId 
    };
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return {
      success: false,
      error: 'Failed to schedule notification'
    };
  }
}


export async function cancelDeadlineNotifications(deadlineId: number): Promise<void> {
  try {
    // Get all scheduled notifications from the device
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    // Cancel device notifications for this deadline
    for (const notification of scheduledNotifications) {
      if (notification.content.data?.deadlineId === deadlineId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
}

export const formatTimeMessage = (minutes: number): string => {
  switch (minutes) {
    case 1440:
      return '1 day';
    case 60:
      return '1 hour';
    case 30:
      return '30 minutes';
    default:
      return `${minutes} minutes`;
  }
};
