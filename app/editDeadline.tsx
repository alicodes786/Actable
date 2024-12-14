import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useAuth } from '@/providers/AuthProvider';
import { getSingleDeadline, updateDeadline, deleteDeadline } from '@/db/deadlines';
import { router } from 'expo-router';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '@/styles/theme';

export default function EditDeadlineScreen() {
  const { user } = useAuth();
  const route = useRoute();
  const { deadlineId } = route.params as { deadlineId: number };
  const [deadlineName, setDeadlineName] = useState('');
  const [deadlineDescription, setDeadlineDescription] = useState('');
  const [deadlineDate, setDeadlineDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDeadline = async () => {
      try {
        const deadlineData = await getSingleDeadline(deadlineId);
  
        if (!deadlineData) {
          throw new Error('Failed to fetch deadline.');
        }
  
        setDeadlineName(deadlineData.name);
        setDeadlineDescription(deadlineData.description);
        setDeadlineDate(new Date(deadlineData.date));
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to load deadline data.');
      }
    };
  
    fetchDeadline();
  }, [deadlineId, user]);

  const validateForm = () => {
    if (!deadlineName.trim()) {
      Alert.alert('Error', 'Deadline name is required.');
      return false;
    }
    if (!deadlineDate) {
      Alert.alert('Error', 'Deadline date and time are required.');
      return false;
    }

    const currentDate = new Date();
    if (new Date(deadlineDate) <= currentDate) {
      Alert.alert('Error', 'Deadline date must be in the future.');
      return false;
    }

    if (!deadlineDescription.trim()) {
      Alert.alert('Error', 'Deadline description is required.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (!deadlineDate) {
        throw new Error("Missing deadline date");
      }

      const { success, error } = await updateDeadline(
        deadlineId,
        String(user?.id),
        {
          name: deadlineName,
          description: deadlineDescription,
          date: deadlineDate,
        }
      );

      if (!success) {
        throw new Error(error);
      }

      Alert.alert('Success', 'Deadline updated successfully!');
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update deadline. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this deadline?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { success, error } = await deleteDeadline(deadlineId, String(user?.id));

              if (!success) {
                throw new Error(error);
              }

              Alert.alert('Success', 'Deadline deleted successfully!');
              router.back();
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Failed to delete deadline. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    setDeadlineDate(date);
    hideDatePicker();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center h-14 px-5">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="flex-row items-center space-x-2"
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
          <Text style={{ fontFamily: fonts.primary }} className="text-lg">
            Edit Deadline
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-5">
        <Text className="text-base mb-2" style={{ fontFamily: fonts.primary }}>
          Name
        </Text>
        <TextInput
          className="bg-[#F5F5F5] p-4 rounded-xl mb-6 text-base"
          style={{ fontFamily: fonts.secondary }}
          value={deadlineName}
          onChangeText={setDeadlineName}
          placeholder="Enter deadline name"
          placeholderTextColor="#999"
        />
        
        <Text className="text-base mb-2" style={{ fontFamily: fonts.primary }}>
          Description
        </Text>
        <TextInput
          className="bg-[#F5F5F5] p-4 rounded-xl mb-6 text-base h-[120px]"
          style={{ fontFamily: fonts.secondary, textAlignVertical: 'top' }}
          value={deadlineDescription}
          onChangeText={setDeadlineDescription}
          placeholder="Enter description"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
        />

        <Text className="text-base mb-2" style={{ fontFamily: fonts.primary }}>
          Due Date
        </Text>
        <TouchableOpacity 
          className="bg-[#F5F5F5] p-4 rounded-xl mb-6 flex-row items-center justify-between"
          onPress={showDatePicker}
        >
          <Text 
            className="text-base text-black"
            style={{ fontFamily: fonts.secondary }}
          >
            {deadlineDate 
              ? deadlineDate.toLocaleString() 
              : 'Select date and time'}
          </Text>
          <Ionicons name="calendar-outline" size={24} color="#666" />
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          date={deadlineDate || undefined}
        />

        <View className="mt-auto mb-6 space-y-4">
          <TouchableOpacity 
            className="bg-black p-4 rounded-xl items-center"
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text 
              className="text-white text-base font-semibold"
              style={{ fontFamily: fonts.primary }}
            >
              Update Deadline
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-red-500 p-4 rounded-xl items-center"
            onPress={handleDelete}
          >
            <Text 
              className="text-white text-base font-semibold"
              style={{ fontFamily: fonts.primary }}
            >
              Delete Deadline
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
