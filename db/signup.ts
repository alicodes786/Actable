import { supabase } from '@/lib/db';

export const createUser = async (username: string, password: string, email: string): Promise<boolean> => {
    const { error } = await supabase
        .from('users')
        .insert([{ name: username, password, email }]);

    // Check for any errors in insertion
    if (error) {
        console.error('Error creating user:', error.message);
        return false;
    }

    return true; // User was created successfully
};
