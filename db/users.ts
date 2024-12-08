// users.ts
import { supabase } from '@/lib/db';
import { IUser } from '@/lib/interfaces';

// Function to get all users
export const getUsers = async (): Promise<IUser[] | null> => {
  try {
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('id, name, role');

    if (error) {
      console.error('Error fetching users:', error);
      return null;
    }

    return users || null;
  } catch (error) {
    console.error('Unexpected error fetching users:', error);
    return null;
  }
};

// Function to get a user by their ID
export const getUserById = async (userId: string): Promise<IUser | null> => {
  try {
    const { data: user, error } = await supabase
      .from('user_profiles')
      .select('id, name, role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }

    return user || null;
  } catch (error) {
    console.error('Unexpected error fetching user by ID:', error);
    return null;
  }
};

// Function to get user's name by their ID
export const getUserName = async (userId: string): Promise<string | null> => {
  try {
    const { data: user, error } = await supabase
      .from('user_profiles')
      .select('name')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user name:', error);
      return null;
    }

    return user?.name || null;
  } catch (error) {
    console.error('Unexpected error fetching user name:', error);
    return null;
  }
};
