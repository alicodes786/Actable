import React, { useEffect, useState } from 'react';
import { Separator, Text, Button, Input, YStack, View } from 'tamagui';
import Toast from 'react-native-toast-message';
import { authenticateUser } from '@/db/signin';
import { router, Href } from "expo-router";
import { useAuth } from '@/providers/AuthProvider';

export default function SignIn() {
  const [username, setUsername] = useState('');
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
      const route: Href = user.role === 'mod' ? '/dashboard' : '/(user)';
      router.replace(route);
    }
  }, [user, isReady]);

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
      if (!validateInputs()) {
        return;
      }

      setIsLoading(true);

      const userAuth = await authenticateUser(username, password);

      if (userAuth.success && userAuth.user) {
        await login({
          id: userAuth.user.id,
          role: userAuth.user.role
        });

        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: 'Redirecting to your dashboard...',
          position: 'bottom',
          visibilityTime: 2000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: userAuth.error,
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
          disabled={isLoading}
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