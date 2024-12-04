import { supabase } from '@/lib/db';

interface User {
  id: number;
  name: string;
  role: 'user' | 'mod';
}

// Separate function to get user by credentials
export const getUserByCredentials = async (
  username: string, 
  password: string
): Promise<User | null> => {
    const { data: user } = await supabase
        .from('users')
        .select('id, name, role') // Added role to selected fields
        .eq('name', username)
        .eq('password', password)
        .maybeSingle();

    return user;
};

// Authentication function that returns more meaningful result
interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export const authenticateUser = async (
  username: string, 
  password: string
): Promise<AuthResult> => {
    try {
        const user = await getUserByCredentials(username, password);
        
        if (!user) {
            return {
                success: false,
                error: 'Invalid credentials'
            };
        }

        return {
            success: true,
            user
        };
    } catch (error) {
        return {
            success: false,
            error: 'Authentication failed'
        };
    }
};