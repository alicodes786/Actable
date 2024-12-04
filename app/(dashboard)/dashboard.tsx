import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { router, useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';
import { DeadlineWithSubmission, fetchUnapprovedSubmissions } from '@/db/submissions';

export default function Dashboard() {
  const { logout, assignedUser } = useAuth();
  const [submissions, setSubmissions] = useState<DeadlineWithSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const refreshInterval = setInterval(() => {
        if (isActive) {
          loadSubmissions();
        }
      }, 5000);

      loadSubmissions();

      return () => {
        isActive = false;
        clearInterval(refreshInterval);
      };
    }, [assignedUser])
  );

  const loadSubmissions = async () => {
    if (!assignedUser?.id) return;
    
    try {
      const data = await fetchUnapprovedSubmissions(String(assignedUser.id));
      setSubmissions(data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load submissions',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const isSubmissionLate = (deadlineDate: string, submissionDate: string) => {
    const deadline = new Date(deadlineDate);
    const submitted = new Date(submissionDate);
    return submitted > deadline;
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="p-5">
          <Text className="text-2xl font-bold mb-5">
            Pending Submissions
          </Text>

          {submissions.map((item) => (
            <TouchableOpacity
              key={item.id}
              className={`flex-row bg-white mb-4 p-4 rounded-xl shadow-sm border-l-4 
                ${isSubmissionLate(item.date, item.submission.submitteddate) 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-green-500 bg-green-50'}`}
              onPress={() => router.push({
                pathname: "/(dashboard)/submission/[id]",
                params: { id: item.submission.id }
              })}
            >
              <Image
                source={{ uri: item.submission.imageurl }}
                className="w-20 h-20 rounded-lg"
              />
              <View className="flex-1 ml-4 justify-center">
                <Text className="text-lg font-semibold mb-1">{item.name}</Text>
                <Text className={`text-sm ${
                  isSubmissionLate(item.date, item.submission.submitteddate)
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}>
                  Submitted: {formatDate(item.submission.submitteddate)}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  Due: {formatDate(item.date)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {submissions.length === 0 && !loading && (
            <Text className="text-center text-gray-500 mt-5">
              No pending submissions to review
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
} 