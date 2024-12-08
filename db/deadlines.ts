// deadlines.ts
import { supabase } from '@/lib/db';
import { IdeadlineList, Ideadline } from '@/lib/interfaces';
import { getItemAsync } from 'expo-secure-store';
import { scheduleDeadlineNotification, cancelDeadlineNotifications } from '@/lib/notifications';

interface DeadlineResult {
  success: boolean;
  error?: string;
}

export const getDeadlines = async (uuid: string): Promise<IdeadlineList | null> => {
  const { data: deadlines, error } = await supabase
    .from('deadlines')
    .select(`
      *,
      submissions!fk_deadline (
        id,
        submitteddate,
        status
      )
    `)
    .eq('uuid', uuid)
    .order('date', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching deadlines for user:', error);
    return null;
  }

  return { deadlineList: deadlines || null }; 
};

export const getSingleDeadline = async (id: string): Promise<Ideadline | null> => {
  const { data: deadline, error } = await supabase
    .from('deadlines')
    .select(`
      *,
      submissions!fk_deadline (
        id,
        submitteddate,
        status
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching deadline:', error);
    return null;
  }

  return deadline || null; 
};

export const addDeadline = async (
  uuid: string,
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
        uuid,
        lastsubmissionid: null,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to retrieve newly added deadline.');
    }

    try {
      // Only schedule notifications after successful DB operation
      const notificationsEnabled = await getItemAsync('notificationsEnabled');
      const notificationTime = await getItemAsync('notificationTime');
      const notificationTimeValue = notificationTime ? JSON.parse(notificationTime) : 30;

      if (notificationsEnabled === 'true') {
        await scheduleDeadlineNotification(
          uuid,
          data.id,
          name,
          date,
          notificationTimeValue
        );
      }
    } catch (notificationError) {
      console.warn('Failed to schedule notification:', notificationError);
    }

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
  deadlineId: string,
  uuid: string,
  updates: Partial<Ideadline>
): Promise<DeadlineResult> => {
  try {
    const { data, error } = await supabase
      .from('deadlines')
      .update({
        name: updates.name,
        description: updates.description,
        date: updates.date ? new Date(updates.date).toISOString() : undefined,
      })
      .eq('id', deadlineId)
      .eq('uuid', uuid)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to update deadline.');
    }

    try {
      // Cancel and reschedule notifications only after successful DB update
      await cancelDeadlineNotifications(Number(deadlineId));
      
      const notificationTime = await getItemAsync('notificationTime');
      const notificationTimeValue = notificationTime ? JSON.parse(notificationTime) : 30;

      if (updates.date || updates.name) {
        await scheduleDeadlineNotification(
          uuid,
          Number(deadlineId),
          updates.name || data.name,
          updates.date ? new Date(updates.date) : new Date(data.date),
          notificationTimeValue
        );
      }
    } catch (notificationError) {
      console.warn('Failed to update notifications:', notificationError);
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
  deadlineId: string,
  uuid: string
): Promise<DeadlineResult> => {
  try {
    const { error } = await supabase
      .from('deadlines')
      .delete()
      .eq('id', deadlineId)
      .eq('uuid', uuid);

    if (error) {
      throw new Error(error.message);
    }

    try {
      await cancelDeadlineNotifications(Number(deadlineId));
    } catch (notificationError) {
      console.warn('Failed to cancel notifications:', notificationError);
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

export const getLast30DaysDeadlines = async (uuid: string): Promise<Ideadline[] | null> => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: deadlines, error } = await supabase
    .from('deadlines')
    .select('id, name, description, lastsubmissionid, uuid, date, completed')
    .eq('uuid', uuid)
    .gte('date', thirtyDaysAgo.toISOString());

  if (error) {
    console.error('Error fetching last 30 days deadlines:', error);
    return null;
  }

  return deadlines?.map(deadline => ({
    ...deadline,
    userid: deadline.uuid,
    lastsubmissionid: deadline.lastsubmissionid
  })) || null;
};
