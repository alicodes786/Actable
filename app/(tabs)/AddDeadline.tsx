import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useAuth } from '@/providers/AuthProvider';
import { addDeadline } from '@/db/deadlines';
import { useRouter } from 'expo-router';

export default function AddDeadlineScreen() {
  const { user } = useAuth();
  const router = useRouter();
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
      const { error }  = await addDeadline(
        String(user), 
        deadlineName, 
        deadlineDescription, 
        deadlineDate!
      );

      if (error) throw error;

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
    <View style={styles.container}>
      <Text style={styles.label}>Deadline Name</Text>
      <TextInput
        style={styles.input}
        value={deadlineName}
        onChangeText={setDeadlineName}
        placeholder="Enter deadline name"
      />
      
      <Text style={styles.label}>Deadline Date & Time</Text>
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>
          {deadlineDate 
            ? deadlineDate.toLocaleString() 
            : 'No date selected'}
        </Text>
        <Button title="Select Date & Time" onPress={showDatePicker} />
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        date={deadlineDate || undefined}
      />

      <Text style={styles.label}>Deadline Description</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        value={deadlineDescription}
        onChangeText={setDeadlineDescription}
        placeholder="Enter description"
        multiline
        numberOfLines={4}
      />

      <Button 
        title="Add Deadline" 
        onPress={handleSubmit} 
        disabled={isSubmitting} 
      />
    </View>
  );
}

// ... styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 16
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top'
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  dateText: {
    flex: 1,
    marginRight: 10
  }
});