import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { router, Href } from "expo-router";
import { useAuth } from '@/providers/AuthProvider';
import { handleSignIn, handleGoogleSignIn } from '@/lib/auth';
import { fonts } from '@/styles/theme';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const signUpPath: Href = "/(auth)/sign-up";
  const { login, user, session } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    
    if (user && session) {
      const route = user.role === 'mod' ? '/(dashboard)/dashboard' : '/(user)';
      router.replace(route);
    }
  }, [user, session, isReady]);

  // Separate effect to handle back navigation prevention
  useEffect(() => {
    if (!user && router.canGoBack()) {
      router.back();
    }
  }, []);


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center items-center p-4">
          <View className="w-full max-w-sm">
            <Text 
              className="text-2xl font-bold text-center mb-16" 
              style={{ fontFamily: fonts.primary }}
            >
              Sign In
            </Text>
            
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              className="w-full mb-3 p-4 border border-gray-300 rounded-lg text-base"
              style={{ fontFamily: fonts.secondary }}
              editable={!isLoading}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholderTextColor="#999"
            />
            
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="w-full mb-8 p-4 border border-gray-300 rounded-lg text-base"
              style={{ fontFamily: fonts.secondary }}
              editable={!isLoading}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#999"
            />

            <TouchableOpacity 
              onPress={() => handleSignIn(email, password, login, setIsLoading)}
              disabled={isLoading}
              className="w-full mb-3 p-4 bg-[#443399] rounded-lg"
            >
              <Text 
                className="text-white text-center text-base font-medium"
                style={{ fontFamily: fonts.primary }}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => handleGoogleSignIn(setIsLoading)}
              disabled={isLoading}
              className="w-full mb-3 p-4 bg-white border border-gray-300 rounded-lg"
            >
              <Text 
                className="text-center text-base font-medium"
                style={{ fontFamily: fonts.primary }}
              >
                Sign in with Google
              </Text>
            </TouchableOpacity>

            <View className="w-full my-3 h-[1px] bg-gray-200" />

            <Text 
              className="text-center mb-2"
              style={{ fontFamily: fonts.secondary }}
            >
              Don't have an account?
            </Text>

            <TouchableOpacity 
              onPress={() => router.push(signUpPath)}
              disabled={isLoading}
              className="w-full p-4"
            >
              <Text 
                className="text-[#443399] text-center text-base font-medium"
                style={{ fontFamily: fonts.primary }}
              >
                Create an Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}