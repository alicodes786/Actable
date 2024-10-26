// (tabs)/submission.tsx
import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import CountDownTimer from '@/components/CountDownTimer';

// Type for your route params
interface SubmissionScreenParams {
  deadlineId: string;
  description: string;
  date: string;
}

export default function SubmissionScreen() {
  return (
    <>
      <Stack.Screen 
        options={{
          title: "Submit Deadline",
          // You can customize the header here
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          // Optionally show a back button
          headerBackVisible: true,
        }} 
      />
      <SubmissionContent />
    </>
  );
}

// Separate component for the content
function SubmissionContent() {
  const params = useLocalSearchParams();
  const deadlineDate = new Date(params.date as string);

  return (
    <View style={styles.container}>
      <Text>Submission for: {params.description}</Text>
      <Text><CountDownTimer deadlineDate={deadlineDate} textColour='black'/></Text>
      <Text>Some filler</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff"
  }
});