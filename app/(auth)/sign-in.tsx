import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
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
      Alert.alert(
        'Missing Information',
        'Please enter both email and password'
      );
      return false;
    }
    return true;
  };

  const handleSignIn = async () => {
    try {
      if (!validateInputs()) {
        return;
      }

      Keyboard.dismiss();
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
        email: authData.user.email || '',
        role: profile.role,
        name: profile.name
      });

    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.message || 'Unable to sign in. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      Keyboard.dismiss();
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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center p-5">
          <View className="w-full max-w-sm">
            <Text className="text-2xl font-bold text-center mb-16">
              Sign In
            </Text>
            
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              className="w-full mb-3 p-4 border border-gray-300 rounded-lg text-base"
              editable={!isLoading}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
            
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="w-full mb-8 p-4 border border-gray-300 rounded-lg text-base"
              editable={!isLoading}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity 
              onPress={handleSignIn}
              disabled={isLoading}
              className="w-full mb-3 p-4 bg-[#443399] rounded-lg"
            >
              <Text className="text-white text-center text-base font-medium">
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full mb-3 p-4 bg-white border border-gray-300 rounded-lg"
            >
              <Text className="text-center text-base font-medium">
                Sign in with Google
              </Text>
            </TouchableOpacity>

            <View className="w-full my-3 h-[1px] bg-gray-200" />

            <Text className="text-center mb-2">
              Don't have an account?
            </Text>

            <TouchableOpacity 
              onPress={() => router.push(signUpPath)}
              disabled={isLoading}
              className="w-full p-4"
            >
              <Text className="text-[#443399] text-center text-base font-medium">
                Create an Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}