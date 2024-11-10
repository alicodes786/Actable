import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useAuth } from '@/providers/AuthProvider';
import { getSingleDeadline, updateDeadline, deleteDeadline } from '@/db/deadlines';
import { useRouter } from 'expo-router';
import { useRoute } from '@react-navigation/native';

export default function EditDeadlineScreen() {
  const { user } = useAuth();
  const router = useRouter();
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
        String(user),
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
              const { success, error } = await deleteDeadline(deadlineId, String(user));

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
          {deadlineDate ? deadlineDate.toLocaleString() : 'No date selected'}
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

    <View>
      <Button 
        title="Update Deadline" 
        onPress={handleSubmit} 
        disabled={isSubmitting} 
      />
    </View>
    <View className='mt-10'>
      <Button
        title="Delete Deadline"
        color="red"
        onPress={handleDelete}
      />
    </View>

    </View>
  );
}

// Styles remain the same
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
