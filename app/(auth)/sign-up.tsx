import React, { useState } from 'react';
import { Separator, Text, Button, Input, YStack, View } from 'tamagui';
import Toast from 'react-native-toast-message';
import { router } from "expo-router";

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const handleSignUp = () => {
    // Basic validation example: ensure passwords match
    if (password !== repeatPassword) {
      Toast.show({
        type: 'error',
        text1: 'Password Mismatch',
        text2: 'Passwords do not match. Please try again.',
        position: 'bottom',
      });
      return;
    }

    // Assuming `registerUser` is a function that registers the user
    const isRegistered = true; // Replace this with actual registration logic

    if (isRegistered) {
      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: 'Redirecting to sign-in...',
        position: 'bottom',
      });
      router.replace("/(auth)/sign-in"); // Redirect to sign-in page
    } else {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: 'An error occurred. Please try again.',
        position: 'bottom',
      });
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

        {/* Username Input */}
        <Input
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          marginBottom={12}
          fontSize={16}
          width="100%"
        />

        {/* Email Input */}
        <Input
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          marginBottom={12}
          fontSize={16}
          width="100%"
        />

        {/* Password Input */}
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          marginBottom={12}
          fontSize={16}
          width="100%"
        />

        {/* Repeat Password Input */}
        <Input
          placeholder="Repeat Password"
          value={repeatPassword}
          onChangeText={setRepeatPassword}
          secureTextEntry
          marginBottom={32}
          fontSize={16}
          width="100%"
        />

        {/* Sign Up Button */}
        <Button
          onPress={handleSignUp}
          width="100%"
          marginBottom={12}
          backgroundColor="#443399"
          color="#fff"
        >
          Sign Up
        </Button>

        <Separator alignSelf="stretch" marginTop={12} marginBottom={12} />

        <Text textAlign="center" width="100%">
          Already have an account?
        </Text>

        {/* Navigate to Sign In */}
        <Button
          onPress={() => router.push("/(auth)/sign-in")}
          width="100%"
          marginTop={8}
        >
          Sign In
        </Button>
      </YStack>

      <Toast />
    </View>
  );
}
