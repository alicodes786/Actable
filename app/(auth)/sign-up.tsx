import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { router } from "expo-router";
import { handleSignUp } from '@/lib/auth';

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
              onPress={() => handleSignUp(username, email, password, repeatPassword, setIsLoading)}
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