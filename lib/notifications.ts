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
  deadlineDate: Date
): Promise<NotificationScheduleResult> {
  try {
    const reminderTime = new Date(deadlineDate.getTime() - 30 * 60 * 1000); // 30 minutes before
    const notificationMessage = `Reminder: The deadline "${deadlineName}" is coming up in 30 minutes.`;

    // Schedule local device notification with metadata
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Upcoming Deadline Reminder',
        body: notificationMessage,
        data: { deadlineId }, // Store reference to which deadline this notification is for
      },
      trigger: reminderTime,
    });

    // Add to your existing notifications table
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
