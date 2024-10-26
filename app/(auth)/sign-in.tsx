import React, { useState } from 'react';
import { Separator, Text, Button, Input, YStack, View } from 'tamagui';
import Toast from 'react-native-toast-message';
import { checkPass } from '@/db/signin';
import { router, Href } from "expo-router";

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const signUpPath = "/(auth)/sign-up" as Href<any>

  const handleSignIn = async () => {
    const userAuth = await checkPass(username, password);

    if (userAuth) {
      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: 'Redirecting to your dashboard...',
        position: 'bottom',
      });
      router.replace("/(tabs)");
    } else {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: 'Invalid username or password.',
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
        <Text fontSize={24} marginBottom={64} fontWeight="bold" textAlign="center">Sign In</Text>
        
        {/* Username Input */}
        <Input
          placeholder="Username" 
          value={username}
          onChangeText={setUsername}
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
          marginBottom={32}
          fontSize={16}
          width="100%"
        />

        {/* Sign In Button */}
        <Button 
          onPress={handleSignIn}
          width="100%"
          marginBottom={12}
          backgroundColor="#443399"
          color="#fff"
        >
          Sign In
        </Button>

        {/* Sign in with Google Button */}
        <Button 
          onPress={() => console.log('Sign in with Google pressed')}
          width="100%"
        >
          Sign in with Google
        </Button>

        <Separator alignSelf="stretch" marginTop={12} marginBottom={12} />

        <Text textAlign="center" width="100%" marginBottom={8}>
          Don’t have an account?
        </Text>

        {/* Create an Account Button */}
        <Button 
          onPress={() => router.push(signUpPath)}
          width="100%"
          backgroundColor="transparent"
          color="#443399"
        >
          Create an Account
        </Button>
      </YStack>

      <Toast />
    </View>
  );
}
