// deadlines.ts
import { supabase } from '@/lib/db';
import { IdeadlineList, Ideadline } from '@/lib/interfaces';
import { scheduleDeadlineNotification, cancelDeadlineNotifications } from '@/lib/notifications';

interface DeadlineResult {
  success: boolean;
  error?: string;
}

export const getDeadlines = async (userId: string): Promise<IdeadlineList | null> => {
  const { data: deadlines, error } = await supabase
    .from('deadlines')
    .select('*')
    .eq('userid', userId);
  if (error) {
    console.error('Error fetching deadlines for user:', error);
    return null;
  }

  return { deadlineList: deadlines || null }; 
};

export const getSingleDeadline = async (id: number): Promise<Ideadline | null> => {
  const { data: deadline, error } = await supabase
    .from('deadlines')
    .select(`*`)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching deadline:', error);
    return null;
  }

  return deadline || null; 
};

export const addDeadline = async (
  userId: string, 
  name: string, 
  description: string, 
  date: Date
): Promise<DeadlineResult> => {
  try {
    const { data, error } = await supabase
      .from('deadlines')
      .insert({
        name,
        description,
        date: date.toISOString(),
        userid: userId,
        lastsubmissionid: null,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to retrieve newly added deadline.');
    }

    // Schedule notification
    await scheduleDeadlineNotification(userId, data.id, name, date);

    return { success: true };
  } catch (error) {
    console.error('Error adding deadline:', error);
    return {
      success: false,
      error: 'Failed to add deadline. Please try again.',
    };
  }
};

export const updateDeadline = async (
  deadlineId: number,
  userId: string,
  updates: Partial<Ideadline>
): Promise<DeadlineResult> => {
  try {
    // First, cancel existing notifications
    await cancelDeadlineNotifications(deadlineId);

    const { data, error } = await supabase
      .from('deadlines')
      .update({
        name: updates.name,
        description: updates.description,
        date: updates.date ? new Date(updates.date).toISOString() : undefined,
      })
      .eq('id', deadlineId)
      .eq('userid', userId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to update deadline.');
    }

    // If the date or name was updated, schedule new notification
    if (updates.date || updates.name) {
      await scheduleDeadlineNotification(
        userId,
        deadlineId,
        updates.name || data.name,
        updates.date ? new Date(updates.date) : new Date(data.date)
      );
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating deadline:', error);
    return {
      success: false,
      error: 'Failed to update deadline. Please try again.',
    };
  }
};

export const deleteDeadline = async (
  deadlineId: number,
  userId: string
): Promise<DeadlineResult> => {
  try {
    // First, cancel notifications
    await cancelDeadlineNotifications(deadlineId);

    // Delete the deadline
    const { error } = await supabase
      .from('deadlines')
      .delete()
      .eq('id', deadlineId)
      .eq('userid', userId);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting deadline:', error);
    return {
      success: false,
      error: 'Failed to delete deadline. Please try again.',
    };
  }
};