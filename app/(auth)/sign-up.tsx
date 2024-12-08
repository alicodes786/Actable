import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
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
    try {
      Keyboard.dismiss();  // Dismiss keyboard before processing
      setIsLoading(true);

      // Check for empty fields
      if (!username || !email || !password || !repeatPassword) {
        Alert.alert(
          'Missing Information',
          'Please fill in all fields'
        );
        return;
      }

      // Username validation
      if (username.length < 3) {
        Alert.alert(
          'Invalid Username',
          'Username must be at least 3 characters long'
        );
        return;
      }

      // Email validation
      if (!validateEmail(email)) {
        Alert.alert(
          'Invalid Email',
          'Please enter a valid email address'
        );
        return;
      }

      // Password validation
      if (!validatePassword(password)) {
        Alert.alert(
          'Weak Password',
          'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers'
        );
        return;
      }

      // Password match validation
      if (password !== repeatPassword) {
        Alert.alert(
          'Password Mismatch',
          'Passwords do not match. Please try again.'
        );
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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center p-5">
          <View className="w-full max-w-sm">
            <Text className="text-2xl font-bold text-center mb-16">
              Sign Up
            </Text>

            <TextInput
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              className="w-full mb-3 p-4 border border-gray-300 rounded-lg text-base"
              editable={!isLoading}
            />

            <TextInput
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              className="w-full mb-3 p-4 border border-gray-300 rounded-lg text-base"
              editable={!isLoading}
              autoCapitalize="none"
            />

            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="w-full mb-3 p-4 border border-gray-300 rounded-lg text-base"
              editable={!isLoading}
            />

            <TextInput
              placeholder="Repeat Password"
              value={repeatPassword}
              onChangeText={setRepeatPassword}
              secureTextEntry
              className="w-full mb-8 p-4 border border-gray-300 rounded-lg text-base"
              editable={!isLoading}
            />

            <TouchableOpacity
              onPress={handleSignUp}
              disabled={isLoading}
              className="w-full mb-3 p-4 bg-[#443399] rounded-lg"
            >
              <Text className="text-white text-center text-base font-medium">
                {isLoading ? 'Signing up...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>

            <View className="w-full my-3 h-[1px] bg-gray-200" />

            <Text className="text-center mb-2">
              Already have an account?
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/(auth)/sign-in")}
              disabled={isLoading}
              className="w-full p-4"
            >
              <Text className="text-center text-base font-medium">
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}