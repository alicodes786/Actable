import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Modal, Clipboard, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/AuthProvider';
import { getAssignedMod, removeModFromUser } from '@/db/mod';
import { supabase } from '@/lib/db';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resendVerificationEmail } from '@/lib/auth';

interface PendingMod {
  email: string;
  userId: string;
  createdAt: string;
}

export default function ModeratorScreen() {
  const { user } = useAuth();
  const [modEmail, setModEmail] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [existingMod, setExistingMod] = useState<any>(null);
  const [pendingMod, setPendingMod] = useState<PendingMod | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'user') {
      Alert.alert('Access Denied', 'Only regular users can manage moderators');
      router.back();
    }
  }, [user]);

  useEffect(() => {
    loadExistingMod();
    loadPendingMod();
  }, []);

  const loadPendingMod = async () => {
    try {
      const storedPendingMod = await AsyncStorage.getItem('pendingMod');
      if (storedPendingMod) {
        const parsed = JSON.parse(storedPendingMod) as PendingMod;
        // Only load if it's less than 24 hours old
        const createdAt = new Date(parsed.createdAt);
        const now = new Date();
        const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          setPendingMod(parsed);
        } else {
          // Clear expired pending mod
          await AsyncStorage.removeItem('pendingMod');
        }
      }
    } catch (error) {
      console.error('Error loading pending mod:', error);
    }
  };

  const loadExistingMod = async () => {
    try {
      if (user) {
        const mod = await getAssignedMod(user.id);
        setExistingMod(mod);
      }
    } catch (error) {
      console.error('Error loading moderator:', error);
    } finally {
      setIsContentLoading(false);
    }
  };

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const handleGenerateModerator = async () => {
    if (!modEmail) return;
    
    // Email format validation
    const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
    if (!emailRegex.test(modEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      // Check if email exists and get user_id
      const { data: existingUserId, error: lookupError } = await supabase
        .rpc('get_user_id_by_email', { check_email: modEmail });

      if (lookupError) {
        console.error('Lookup Error:', lookupError);
        throw lookupError;
      }

      // If existingUserId is null, it means no user was found
      if (existingUserId !== null) {
        // Check if they're already a moderator
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', existingUserId)
          .single();

        if (profileError) {
          console.error('Profile Error:', profileError);
          throw profileError;
        }

        if (userProfile.role !== 'mod') {
          Alert.alert('Error', 'This email cannot be used. Please try another email address.');
          return;
        }

        // Check if moderator is already assigned
        const { data: existingRelationship, error: relError } = await supabase
          .from('mod_user_relationships')
          .select('*')
          .eq('mod_uuid', existingUserId)
          .single();

        if (!relError && existingRelationship) {
          Alert.alert('Error', 'This moderator is already assigned to another user.');
          return;
        }

        // Create new relationship for existing mod
        const { error: assignError } = await supabase
          .from('mod_user_relationships')
          .insert({
            user_uuid: user?.id,
            mod_uuid: existingUserId
          });

        if (assignError) {
          Alert.alert('Error', 'Unable to assign moderator. Please try again.');
          return;
        }

        Alert.alert('Success', 'Moderator has been assigned successfully.');
        loadExistingMod();
        return;
      }

      // If we get here, email doesn't exist, proceed with new moderator creation
      const generatedPassword = generatePassword();
      
      // Create new user with mod role
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: modEmail,
        password: generatedPassword,
        options: {
          data: {
            name: modEmail.split('@')[0],
            role: 'mod'
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          Alert.alert('Error', 'This email cannot be used. Please try another email address.');
        } else {
          Alert.alert('Error', 'Unable to generate moderator credentials. Please try again.');
        }
        return;
      }

      if (!authData.user) {
        throw new Error('No user data returned');
      }

      // Create moderator profile using the secure function
      const { error: profileError } = await supabase
        .rpc('create_mod_profile', {
          mod_id: authData.user.id,
          mod_email: modEmail,
          creator_id: user!.id
        });

      if (profileError) {
        console.error('Profile Error:', profileError);
        Alert.alert('Error', 'Unable to generate moderator credentials. Please try again.');
        return;
      }

      // Store pending mod information
      const pendingModInfo: PendingMod = {
        email: modEmail,
        userId: user!.id,
        createdAt: new Date().toISOString()
      };
      await AsyncStorage.setItem('pendingMod', JSON.stringify(pendingModInfo));
      setPendingMod(pendingModInfo);

      setGeneratedPassword(generatedPassword);
      setShowCredentials(true);
      Alert.alert(
        'Verification Email Sent',
        'A verification email has been sent to the moderator. They need to verify their email before they can access the account.'
      );

    } catch (error: any) {
      console.error('Error in handleGenerateModerator:', error);
      if (error.message.includes('already registered')) {
        Alert.alert('Error', 'This email is already registered. Please use another email address.');
      } else {
        Alert.alert(
          'Notice',
          'Moderator account created and verification email sent. Please wait for email verification.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!pendingMod) return;

    try {
      await resendVerificationEmail(pendingMod.email);
      Alert.alert(
        'Verification Email Sent',
        'A new verification email has been sent to the moderator.'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to resend verification email. Please try again.');
    }
  };

  const handleCancelPendingMod = async () => {
    Alert.alert(
      'Cancel Pending Moderator',
      'Are you sure you want to cancel this pending moderator invitation?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('pendingMod');
              setPendingMod(null);
            } catch (error) {
              console.error('Error removing pending mod:', error);
            }
          }
        }
      ]
    );
  };

  const handleRemoveModerator = async () => {
    if (!user) return;

    Alert.alert(
      'Remove Moderator',
      'Are you sure you want to remove this moderator?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeModFromUser(user.id);
              setExistingMod(null);
              setGeneratedPassword('');
            } catch (error: any) {
              console.error('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const renderSettingItem = (icon: string, label: string, onPress?: () => void) => (
    <TouchableOpacity 
      className="border-b border-gray-100 py-4 px-5 flex-row items-center"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <Ionicons name={icon as any} size={22} color="#333" className="mr-3" />
        <Text className="text-base text-gray-800">{label}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mr-4"
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-2xl font-semibold">Moderator Settings</Text>
      </View>

      <View className="flex-1 p-4">
        {isContentLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#443399" />
          </View>
        ) : existingMod ? (
          <View>
            <Text className="text-base text-gray-600 mb-2 ml-1">Current Moderator</Text>
            <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {renderSettingItem('mail-outline', existingMod.email)}
              <TouchableOpacity 
                className="py-4 px-5"
                onPress={handleRemoveModerator}
              >
                <Text className="text-red-500 text-base">Remove Moderator</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : pendingMod ? (
          <View>
            <Text className="text-base text-gray-600 mb-2 ml-1">Pending Moderator</Text>
            <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {renderSettingItem('mail-outline', pendingMod.email)}
              <View className="p-4 bg-yellow-50">
                <Text className="text-sm text-yellow-800 mb-3">
                  Waiting for email verification. The moderator needs to verify their email
                  before they can access the account.
                </Text>
                <View className="flex-row justify-end space-x-3">
                  <TouchableOpacity 
                    onPress={handleResendVerification}
                    className="bg-yellow-100 px-4 py-2 rounded-lg"
                  >
                    <Text className="text-yellow-900">Resend Verification</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={handleCancelPendingMod}
                    className="bg-red-100 px-4 py-2 rounded-lg"
                  >
                    <Text className="text-red-900">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View>
            <Text className="text-base text-gray-600 mb-2 ml-1">Add New Moderator</Text>
            <View className="bg-white rounded-xl border border-gray-200 p-4">
              <TextInput
                className="w-full mb-4 p-3 border border-gray-300 rounded-lg bg-gray-50"
                placeholder="Enter moderator's email"
                value={modEmail}
                onChangeText={setModEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              
              <TouchableOpacity
                className={`bg-[#443399] p-4 rounded-lg items-center ${isLoading ? 'opacity-50' : ''}`}
                onPress={handleGenerateModerator}
                disabled={isLoading}
              >
                <Text className="text-white font-medium">
                  {isLoading ? 'Generating...' : 'Generate Credentials'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <Modal
        visible={showCredentials}
        transparent
        animationType="fade"
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white w-full max-w-md rounded-2xl p-6">
            <Text className="text-xl font-semibold mb-4">Moderator Credentials</Text>
            
            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-2">Email:</Text>
              <View className="flex-row">
                <TextInput
                  className="flex-1 bg-gray-50 p-3 rounded-l border-l border-y border-gray-300 font-mono"
                  value={modEmail}
                  editable={false}
                  selectTextOnFocus
                />
                <TouchableOpacity 
                  className="bg-gray-100 px-4 justify-center rounded-r border-r border-y border-gray-300"
                  onPress={() => Clipboard.setString(modEmail)}
                >
                  <Text className="text-gray-600">Copy</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-sm text-gray-600 mb-2">Password:</Text>
              <View className="flex-row">
                <TextInput
                  className="flex-1 bg-gray-50 p-3 rounded-l border-l border-y border-gray-300 font-mono"
                  value={generatedPassword}
                  editable={false}
                  selectTextOnFocus
                />
                <TouchableOpacity 
                  className="bg-gray-100 px-4 justify-center rounded-r border-r border-y border-gray-300"
                  onPress={() => Clipboard.setString(generatedPassword)}
                >
                  <Text className="text-gray-600">Copy</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text className="text-sm text-gray-600 mb-6">
              Make sure to save these credentials. If the password is lost, 
              the moderator can reset it using the "Reset Password" option 
              at the sign-in page with their email address.
            </Text>

            <TouchableOpacity 
              onPress={() => setShowCredentials(false)}
              className="bg-[#443399] p-4 rounded-lg items-center"
            >
              <Text className="text-white font-medium">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
} 