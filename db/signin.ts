import { supabase } from '@/lib/db';

export const checkPass = async (user: string, pass: string): Promise<boolean> => {
    const { data: creds } = await supabase
        .from('users')
        .select('*')
        .eq('name', user)
        .maybeSingle();

    // User not found
    if (!creds) {
        return false;
    }

    // Check if the password matches
    if (creds.password === pass) {
        return true;
    }

    return false;
};