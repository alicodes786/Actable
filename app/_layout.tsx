import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import 'react-native-reanimated';
import { View, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { fonts } from '@/styles/theme';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Remove the fixed initialRouteName
  // initialRouteName: '(auth)',
};

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isLoading, user } = useAuth();
  const [loaded] = useFonts({
    'Manrope': require('../assets/fonts/Manrope-VariableFont_wght.ttf'),
    'Roboto': require('../assets/fonts/Roboto-Regular.ttf'),
  });
  const [isAppReady, setAppReady] = useState(false);

  useEffect(() => {
    if (loaded && !isLoading) {
      SplashScreen.hideAsync();
      setAppReady(true);
    }
  }, [loaded, isLoading]);

  useEffect(() => {
    if (isAppReady) {
      if (user) {
        const route = user.role === "mod" ? '/(dashboard)/dashboard' : '/(user)';
        router.replace(route);
      } else {
        router.replace('/(auth)/sign-in');
      }
    }
  }, [isAppReady, user]);

  if (!loaded || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
   
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="(auth)" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="(user)" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="(dashboard)" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="settings"
          options={{
            title: 'Settings',
            headerShown: true,
            headerShadowVisible: false,
            headerStyle: {
              backgroundColor: '#FFFFFF',
            },
            headerTitleStyle: {
              fontFamily: fonts.primary,
              fontSize: 18,
            },
            headerLeft: () => (
              <TouchableOpacity 
                onPress={() => router.back()}
                style={{ marginLeft: 8 }}
              >
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
            ),
          }} 
        />
        <Stack.Screen 
          name="notifications"
          options={{
            title: 'Notifications',
            headerShown: true,
            headerShadowVisible: false,
            headerStyle: {
              backgroundColor: '#FFFFFF',
            },
            headerTitleStyle: {
              fontFamily: fonts.primary,
              fontSize: 18,
            },
            headerLeft: () => (
              <TouchableOpacity 
                onPress={() => router.back()}
                style={{ marginLeft: 8 }}
              >
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
            ),
          }} 
        />
        <Stack.Screen 
          name="feedbackForm"
          options={{
            title: 'Feedback',
            headerShown: true,
            headerShadowVisible: false,
            headerStyle: {
              backgroundColor: '#FFFFFF',
            },
            headerTitleStyle: {
              fontFamily: fonts.primary,
              fontSize: 18,
            },
            headerLeft: () => (
              <TouchableOpacity 
                onPress={() => router.back()}
                style={{ marginLeft: 8 }}
              >
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
            ),
          }} 
        />
      </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    async function setupNotifications() {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync({
            ios: {
              allowAlert: true,
              allowBadge: true,
              allowSound: true,
              allowAnnouncements: true,
            },
          });
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          console.log('Failed to get notification permissions!');
          return;
        }

        await Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    }

    setupNotifications();
  }, []);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}