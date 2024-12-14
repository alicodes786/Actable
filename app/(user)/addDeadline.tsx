import React, { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useAuth } from '@/providers/AuthProvider';
import { addDeadline } from '@/db/deadlines';
import { router } from 'expo-router';
import { toUTC } from '@/lib/dateUtils';
import { fonts } from '@/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddDeadlineScreen() {
  const { user } = useAuth();
  const [deadlineName, setDeadlineName] = useState('');
  const [deadlineDescription, setDeadlineDescription] = useState('');
  const [deadlineDate, setDeadlineDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const utcDate = toUTC(deadlineDate!);
      
      const { success, error } = await addDeadline(
        String(user?.id), 
        deadlineName, 
        deadlineDescription, 
        utcDate
      );
  
      if (!success) {
        throw new Error(error);
      }
  
      Alert.alert('Success', 'Deadline added successfully!');
      setDeadlineName('');
      setDeadlineDescription('');
      setDeadlineDate(null);
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to add deadline. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
    <SafeAreaView className="flex-1 bg-white" edges={['left', 'right']}>
      <View className="flex-row items-center h-14 px-5 mt-2">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="flex-row items-center space-x-2"
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
          <Text style={{ fontFamily: fonts.primary }} className="text-lg">
            New Deadline
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

        <TouchableOpacity 
          className="bg-black p-4 rounded-xl mt-2 items-center"
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text 
            className="text-white text-base font-semibold"
            style={{ fontFamily: fonts.primary }}
          >
            Add Deadline
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}