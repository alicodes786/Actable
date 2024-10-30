import { supabase } from '@/lib/db';

// Define the type for your notification
interface Notification {
  message: string;
}

// Fetch notifications from Supabase
export const fetchNotifications = async (): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from<Notification>('notifications') // Your notifications table name
    .select('message') // Assuming the message column contains the notification text
    

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data || [];
};
