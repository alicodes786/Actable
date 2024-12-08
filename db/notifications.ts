import { supabase } from '@/lib/db';

interface Notification {
  message: string;
}

export const createNotification = async (
  uuid: string, 
  deadlineId: number, 
  message: string, 
  scheduledFor: Date
) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        uuid,
        type: 'reminder',
        scheduledfor: scheduledFor.toISOString(),
        message,
        isread: false,
        timecreated: new Date().toISOString(),
      });

    if (error) {
      throw error;
    }
    return { success: true };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: 'Failed to create notification.' };
  }
};

export const fetchNotifications = async (uuid: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('message')
    .eq('uuid', uuid)

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data || [];
};