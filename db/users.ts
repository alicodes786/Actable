// users.ts
import { supabase } from '@/lib/db';
import { IUser } from '@/lib/interfaces';

// Function to get all users
export const getUsers = async (): Promise<IUser[] | null> => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name'); // You can add more fields as needed

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
      .from('users')
      .select('id, name') // Adjust fields as necessary
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

// Function to get user by credentials (username and password)
export const getUserByCredentials = async (
  username: string,
  password: string
): Promise<IUser | null> => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name') // You can select more fields as necessary
      .eq('name', username)
      .eq('password', password) // Make sure passwords are hashed
      .maybeSingle();

    if (error) {
      console.error('Error fetching user by credentials:', error);
      return null;
    }

    return user || null;
  } catch (error) {
    console.error('Unexpected error fetching user by credentials:', error);
    return null;
  }
};

// Function to get user's name by their ID
export const getUserName = async (userId: number): Promise<string | null> => {
  try {
    const { data: user, error } = await supabase
      .from('users')
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
