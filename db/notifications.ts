import { supabase } from '@/lib/db';

interface Notification {
  message: string;
}

export const createNotification = async (
  userId: string, 
  deadlineId: number, 
  message: string, 
  scheduledFor: Date
) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        userid: userId,
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


export const fetchNotifications = async (id: number): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('message')
    .eq('id', id)

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data || [];
};