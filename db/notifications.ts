import { supabase } from '@/lib/db';

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
