import React, { useEffect, useState } from 'react';
import { Separator, Text, Button, Input, YStack, View } from 'tamagui';
import Toast from 'react-native-toast-message';
import { router, Href } from "expo-router";
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/db';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const signUpPath: Href = "/(auth)/sign-up";
  const { login, user } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    
    if (user) {
      const route = user.role === 'mod' ? '/(dashboard)/dashboard' : '/(user)';
      router.replace(route);
    }
  }, [user, isReady]);

  // Separate effect to handle back navigation prevention
  useEffect(() => {
    if (!user && router.canGoBack()) {
      router.back();
    }
  }, []);

  const validateInputs = () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please enter both email and password',
        position: 'bottom',
      });
      return false;
    }
    return true;
  };

  const handleSignIn = async () => {
    try {
      if (!validateInputs()) {
        return;
      }

      setIsLoading(true);

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      // Login with AuthProvider
      await login({
        id: authData.user.id,
        email: authData.user.email || '', // Add fallback empty string
        role: profile.role,
        name: profile.name
      });

      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: 'Redirecting to your dashboard...',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.message || 'Unable to sign in. Please try again.',
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Google Sign In',
        text2: 'Successfully signed in with Google',
        position: 'bottom',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Google Sign In Failed',
        text2: error.message || 'Unable to sign in with Google. Please try again.',
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <YStack 
        justifyContent="center" 
        alignItems="stretch"
        padding={20}
        width="100%"
      >
        <Text fontSize={24} marginBottom={64} fontWeight="bold" textAlign="center">
          Sign In
        </Text>
        
        <Input
          placeholder="Email" 
          value={email}
          onChangeText={setEmail}
          marginBottom={12}
          fontSize={16}
          width="100%"
          disabled={isLoading}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />
        
        <Input 
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          marginBottom={32}
          fontSize={16}
          width="100%"
          disabled={isLoading}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Button 
          onPress={handleSignIn}
          width="100%"
          marginBottom={12}
          backgroundColor="#443399"
          color="#fff"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>

        <Button 
          onPress={handleGoogleSignIn}
          width="100%"
          disabled={isLoading}
        >
          Sign in with Google
        </Button>

        <Separator alignSelf="stretch" marginTop={12} marginBottom={12} />

        <Text textAlign="center" width="100%" marginBottom={8}>
          Don't have an account?
        </Text>

        <Button 
          onPress={() => router.push(signUpPath)}
          width="100%"
          backgroundColor="transparent"
          color="#443399"
          disabled={isLoading}
        >
          Create an Account
        </Button>
      </YStack>

      <Toast />
    </View>
  );
}