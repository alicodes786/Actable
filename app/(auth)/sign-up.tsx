import React, { useState } from 'react';
import { Separator, Text, Button, Input, YStack, View } from 'tamagui';
import Toast from 'react-native-toast-message';
import { router } from "expo-router";
import { supabase } from "@/lib/db";

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSignUp = async () => {
    setIsLoading(true);

    try {
      // Check for empty fields
      if (!username || !email || !password || !repeatPassword) {
        Toast.show({
          type: 'error',
          text1: 'Missing Information',
          text2: 'Please fill in all fields',
          position: 'bottom',
        });
        return;
      }

      // Username validation
      if (username.length < 3) {
        Toast.show({
          type: 'error',
          text1: 'Invalid Username',
          text2: 'Username must be at least 3 characters long',
          position: 'bottom',
        });
        return;
      }

      // Email validation
      if (!validateEmail(email)) {
        Toast.show({
          type: 'error',
          text1: 'Invalid Email',
          text2: 'Please enter a valid email address',
          position: 'bottom',
        });
        return;
      }

      // Password validation
      if (!validatePassword(password)) {
        Toast.show({
          type: 'error',
          text1: 'Weak Password',
          text2: 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers',
          position: 'bottom',
        });
        return;
      }

      // Password match validation
      if (password !== repeatPassword) {
        Toast.show({
          type: 'error',
          text1: 'Password Mismatch',
          text2: 'Passwords do not match. Please try again.',
          position: 'bottom',
        });
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

      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: 'Redirecting to sign in...',
        position: 'bottom',
        visibilityTime: 2000,
      });
      
      // Delay redirect to allow toast to be visible
      setTimeout(() => {
        router.replace("/(auth)/sign-in");
      }, 2000);

    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error.message || 'An error occurred. Please try again.',
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
          Sign Up
        </Text>

        <Input
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          marginBottom={12}
          fontSize={16}
          width="100%"
          disabled={isLoading}
        />

        <Input
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          marginBottom={12}
          fontSize={16}
          width="100%"
          disabled={isLoading}
          autoCapitalize="none"
        />

        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          marginBottom={12}
          fontSize={16}
          width="100%"
          disabled={isLoading}
        />

        <Input
          placeholder="Repeat Password"
          value={repeatPassword}
          onChangeText={setRepeatPassword}
          secureTextEntry
          marginBottom={32}
          fontSize={16}
          width="100%"
          disabled={isLoading}
        />

        <Button
          onPress={handleSignUp}
          width="100%"
          marginBottom={12}
          backgroundColor="#443399"
          color="#fff"
          disabled={isLoading}
        >
          {isLoading ? 'Signing up...' : 'Sign Up'}
        </Button>

        <Separator alignSelf="stretch" marginTop={12} marginBottom={12} />

        <Text textAlign="center" width="100%">
          Already have an account?
        </Text>

        <Button
          onPress={() => router.push("/(auth)/sign-in")}
          width="100%"
          marginTop={8}
          disabled={isLoading}
        >
          Sign In
        </Button>
      </YStack>

      <Toast />
    </View>
  );
}