import { Alert } from 'react-native';
import { supabase } from './db';
import { router } from 'expo-router';
import { User } from '@/providers/AuthProvider';

type LoginFunction = (user: {
  id: string;
  email: string;
  role: string;
  name: string;
}) => Promise<void>;

export const handleSignIn = async (
  email: string,
  password: string,
  login: (userData: User) => Promise<void>,
  setIsLoading: (loading: boolean) => void
) => {
  try {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      // Only check relationship if the user is a mod
      if (profile.role === 'mod') {
        const { data: relationship, error: relError } = await supabase
          .from('mod_user_relationships')
          .select('*')
          .eq('mod_uuid', data.user.id)
          .single();

        if (relError || !relationship) {
          Alert.alert('Access Denied', 'Your moderator access has been revoked.');
          await supabase.auth.signOut();
          return;
        }
      }

      await login(profile);
    }
  } catch (error: any) {
    Alert.alert('Error', error.message);
  } finally {
    setIsLoading(false);
  }
};

export const handleGoogleSignIn = async (
  setIsLoading: (loading: boolean) => void
) => {
  try {
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) throw error;

  } catch (error: any) {
    Alert.alert(
      'Google Sign In Failed',
      error.message || 'Unable to sign in with Google. Please try again.'
    );
  } finally {
    setIsLoading(false);
  }
};

export const handleSignUp = async (
  username: string,
  email: string,
  password: string,
  repeatPassword: string,
  setIsLoading: (loading: boolean) => void
) => {
  try {
    setIsLoading(true);

    // Validations
    if (!validateSignUpInputs(username, email, password, repeatPassword)) {
      return;
    }

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: username
        }
      }
    });

    if (authError) throw authError;

    // 2. Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user!.id,
        name: username,
        role: 'user'
      });

    if (profileError) throw profileError;

    Alert.alert(
      'Success',
      'Registration successful',
      [
        {
          text: 'OK',
          onPress: () => router.replace("/(auth)/sign-in")
        }
      ]
    );

  } catch (error: any) {
    Alert.alert(
      'Registration Failed',
      error.message || 'An error occurred. Please try again.'
    );
  } finally {
    setIsLoading(false);
  }
};

// Helper functions
const validateInputs = (email: string, password: string) => {
  if (!email.trim() || !password.trim()) {
    Alert.alert(
      'Missing Information',
      'Please enter both email and password'
    );
    return false;
  }
  return true;
};

const validateSignUpInputs = (
  username: string,
  email: string,
  password: string,
  repeatPassword: string
) => {
  // Check for empty fields
  if (!username || !email || !password || !repeatPassword) {
    Alert.alert(
      'Missing Information',
      'Please fill in all fields'
    );
    return false;
  }

  // Username validation
  if (username.length < 3) {
    Alert.alert(
      'Invalid Username',
      'Username must be at least 3 characters long'
    );
    return false;
  }

  // Email validation
  if (!validateEmail(email)) {
    Alert.alert(
      'Invalid Email',
      'Please enter a valid email address'
    );
    return false;
  }

  // Password validation
  if (!validatePassword(password)) {
    Alert.alert(
      'Weak Password',
      'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers'
    );
    return false;
  }

  // Password match validation
  if (password !== repeatPassword) {
    Alert.alert(
      'Password Mismatch',
      'Passwords do not match. Please try again.'
    );
    return false;
  }

  return true;
};

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};