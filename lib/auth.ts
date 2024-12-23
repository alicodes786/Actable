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

export const resendVerificationEmail = async (email: string) => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    
    if (error) throw error;
    
    Alert.alert(
      'Verification Email Sent',
      'Please check your email for the verification link.'
    );
  } catch (error: any) {
    Alert.alert('Error', error.message);
  }
};

export const handleSignIn = async (
  email: string,
  password: string,
  login: (userData: User) => Promise<void>,
  setIsLoading: (loading: boolean) => void
) => {
  if (!email || !password) {
    Alert.alert('Error', 'Please enter both email and password');
    return;
  }

  try {
    setIsLoading(true);
    let shouldSignOut = false;

    // First check authentication
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      if (authError.message.toLowerCase().includes('email not confirmed')) {
        Alert.alert(
          'Email Not Verified',
          'Please verify your email before signing in.',
          [
            {
              text: 'Resend Verification Email',
              onPress: () => resendVerificationEmail(email),
            },
            {
              text: 'OK',
              style: 'cancel',
            },
          ]
        );
        shouldSignOut = true;
      } else {
        throw authError;
      }
    } else if (!authData.user) {
      throw new Error('No user data returned');
    } else if (!authData.user.email_confirmed_at) {
      Alert.alert(
        'Email Not Verified',
        'Please verify your email before signing in.',
        [
          {
            text: 'Resend Verification Email',
            onPress: () => resendVerificationEmail(email),
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
      shouldSignOut = true;
    } else {
      // Try to get or create user profile
      const profile = await createUserProfile(authData.user);
      
      if (!profile) {
        shouldSignOut = true;
        Alert.alert('Error', 'Failed to create or retrieve user profile');
      } else if (profile.role === 'mod') {
        // Only check relationship if the user is a mod
        const { data: relationship, error: relError } = await supabase
          .from('mod_user_relationships')
          .select('*')
          .eq('mod_uuid', authData.user.id)
          .single();

        if (relError || !relationship) {
          shouldSignOut = true;
          Alert.alert('Access Denied', 'Your moderator access has been revoked.');
        } else {
          try {
            await login(profile);
          } catch (loginError) {
            console.error('Login error:', loginError);
            shouldSignOut = true;
            Alert.alert('Error', 'Failed to complete login process');
          }
        }
      } else {
        try {
          await login(profile);
        } catch (loginError) {
          console.error('Login error:', loginError);
          shouldSignOut = true;
          Alert.alert('Error', 'Failed to complete login process');
        }
      }
    }

    // Handle sign out if needed
    if (shouldSignOut) {
      await supabase.auth.signOut();
    }

  } catch (error: any) {
    await supabase.auth.signOut();
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

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: username,
          pending_username: username // Store username temporarily in metadata
        }
      }
    });

    if (authError) throw authError;

    Alert.alert(
      'Verification Email Sent',
      'Please check your email and click the verification link to complete your registration.',
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

// Add a new function to handle post-verification profile creation
export const createUserProfile = async (user: any) => {
  try {
    const metadata = user.user_metadata;
    const username = metadata?.pending_username || metadata?.name || user.email?.split('@')[0];
    
    if (!username) {
      console.error('Could not determine username');
      return null;
    }

    // First check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (existingProfile) {
      return existingProfile;
    }

    // Create new profile if it doesn't exist
    const { data: newProfile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        name: username,
        role: 'user'
      })
      .select()
      .single();

    if (profileError) throw profileError;
    return newProfile;

  } catch (error: any) {
    console.error('Error creating user profile:', error);
    return null;
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