import React from 'react';
import { View, Button, Text, YStack } from 'tamagui';
import { useAuth } from '@/providers/AuthProvider';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

export default function Dashboard() {
  const { logout, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
      Toast.show({
        type: 'success',
        text1: 'Signed Out Successfully',
        text2: 'Redirecting to login...',
        position: 'bottom',
        visibilityTime: 2000,
      });
      router.replace('/(auth)/sign-in');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to sign out. Please try again.',
        position: 'bottom',
      });
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <YStack space={20}>
        <Text fontSize={24} fontWeight="bold">
          Dashboard
        </Text>
        
        <Text fontSize={16}>
          Welcome, {user?.role || 'User'}!
        </Text>

        <Button 
          onPress={handleSignOut}
          backgroundColor="#443399"
          color="#fff"
        >
          Sign Out
        </Button>
      </YStack>
      
      <Toast />
    </View>
  );
} 