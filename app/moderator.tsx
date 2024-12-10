import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Modal, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/AuthProvider';
import { getAssignedMod, removeModFromUser } from '@/db/mod';
import { supabase } from '@/lib/db';

export default function ModeratorScreen() {
  const { user } = useAuth();
  const [modEmail, setModEmail] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [existingMod, setExistingMod] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  useEffect(() => {
    loadExistingMod();
  }, []);

  const loadExistingMod = async () => {
    if (user) {
      const mod = await getAssignedMod(user.id);
      setExistingMod(mod);
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

    setIsLoading(true);
    const generatedPassword = generatePassword();
    
    try {
      // Create new user with mod role
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: modEmail,
        password: generatedPassword,
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          Alert.alert('Error', 'This email cannot be used. Please try another email address.');
        } else {
          Alert.alert('Error', 'Unable to generate moderator credentials. Please try again.');
        }
        return;
      }

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            name: modEmail.split('@')[0],
            role: 'mod',
          });

        if (profileError) {
          Alert.alert('Error', 'Unable to generate moderator credentials. Please try again.');
          return;
        }

        // Create relationship
        const { error: relError } = await supabase
          .from('mod_user_relationships')
          .insert({
            user_uuid: user?.id,
            mod_uuid: authData.user.id,
          });

        if (relError) {
          Alert.alert('Error', 'Unable to generate moderator credentials. Please try again.');
          return;
        }

        setGeneratedPassword(generatedPassword);
        setShowCredentials(true);
        loadExistingMod();
      }
    } catch (error: any) {
      Alert.alert('Error', 'Unable to generate moderator credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-semibold mb-6">Moderator Management</Text>

      {existingMod ? (
        <View className="mb-6">
          <Text className="text-lg font-medium mb-4">Current Moderator</Text>
          <Text className="text-base mb-2">Email: {existingMod.email}</Text>
          <TouchableOpacity
            className="bg-red-500 p-4 rounded-lg items-center mt-4"
            onPress={handleRemoveModerator}
          >
            <Text className="text-white font-medium">Remove Moderator</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="mb-6">
          <Text className="text-lg font-medium mb-4">Generate New Moderator</Text>
          <TextInput
            className="w-full mb-4 p-3 border border-gray-300 rounded-lg"
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
      )}

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