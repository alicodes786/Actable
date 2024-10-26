import React, { useState } from 'react';
import { Separator, Text, Button, Input, YStack, View } from 'tamagui';
import Toast from 'react-native-toast-message';
import { checkPass } from '@/db/signin';
import { router, Href } from "expo-router";

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const signUpPath = "/(auth)/sign-up" as Href<any>;

  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 300000; // 5 minutes in milliseconds

  const validateInputs = () => {
    if (!username.trim() || !password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please enter both username and password',
        position: 'bottom',
      });
      return false;
    }
    return true;
  };

  const handleSignIn = async () => {
    try {
      // Check if user is locked out
      if (attemptCount >= MAX_LOGIN_ATTEMPTS) {
        Toast.show({
          type: 'error',
          text1: 'Account Locked',
          text2: 'Too many failed attempts. Please try again in 5 minutes.',
          position: 'bottom',
        });
        setTimeout(() => {
          setAttemptCount(0);
        }, LOCKOUT_DURATION);
        return;
      }

      // Validate inputs before attempting login
      if (!validateInputs()) {
        return;
      }

      setIsLoading(true);

      const userAuth = await checkPass(username, password);

      if (userAuth) {
        // Reset attempt count on successful login
        setAttemptCount(0);
        
        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: 'Redirecting to your dashboard...',
          position: 'bottom',
          visibilityTime: 2000,
        });
        
        // Delay redirect to show success message
        setTimeout(() => {
          router.replace("/(tabs)");
        }, 2000);
      } else {
        // Increment failed attempt count
        setAttemptCount(prev => prev + 1);
        
        // Calculate remaining attempts
        const remainingAttempts = MAX_LOGIN_ATTEMPTS - (attemptCount + 1);
        
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: remainingAttempts > 0 
            ? `Invalid credentials. ${remainingAttempts} attempts remaining.`
            : 'Account locked. Please try again in 5 minutes.',
          position: 'bottom',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Connection Error',
        text2: 'Unable to connect to the server. Please try again.',
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      // Implement Google Sign-in logic here
      Toast.show({
        type: 'info',
        text1: 'Google Sign In',
        text2: 'This feature is not yet implemented',
        position: 'bottom',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Google Sign In Failed',
        text2: 'Unable to sign in with Google. Please try again.',
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
          placeholder="Username" 
          value={username}
          onChangeText={setUsername}
          marginBottom={12}
          fontSize={16}
          width="100%"
          disabled={isLoading || attemptCount >= MAX_LOGIN_ATTEMPTS}
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <Input 
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          marginBottom={32}
          fontSize={16}
          width="100%"
          disabled={isLoading || attemptCount >= MAX_LOGIN_ATTEMPTS}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Button 
          onPress={handleSignIn}
          width="100%"
          marginBottom={12}
          backgroundColor="#443399"
          color="#fff"
          disabled={isLoading || attemptCount >= MAX_LOGIN_ATTEMPTS}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>

        <Button 
          onPress={handleGoogleSignIn}
          width="100%"
          disabled={isLoading || attemptCount >= MAX_LOGIN_ATTEMPTS}
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