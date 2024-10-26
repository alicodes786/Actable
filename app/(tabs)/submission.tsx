// (tabs)/submission.tsx
import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

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

  return (
    <View style={styles.container}>
      <Text>Submission for: {params.description}</Text>
      <Text>Deadline: {params.date}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff"
  },
});