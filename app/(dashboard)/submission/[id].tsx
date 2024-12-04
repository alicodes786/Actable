import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { approveSubmission, Submission, fetchSubmissionById } from '@/db/submissions';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SubmissionReviewScreen() {
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const submissionId = Number(params.id);

  useEffect(() => {
    loadSubmission();
  }, [submissionId]);

  const loadSubmission = async () => {
    try {
      const data = await fetchSubmissionById(submissionId);
      setSubmission(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load submission');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsLoading(true);
      await approveSubmission(submissionId);
      Alert.alert('Success', 'Submission approved successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to approve submission');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!submission) {
    return (
      <View className="flex-1 bg-white">
        <Text className="text-base text-gray-600 text-center mt-5">
          Submission not found
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-5">
        <View className="bg-gray-50 rounded-2xl overflow-hidden shadow-sm">
          <Image
            source={{ uri: submission.imageurl }}
            className="w-full h-96"
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity 
          className={`mt-6 bg-green-500 py-4 px-6 rounded-xl 
            ${isLoading ? 'opacity-50' : 'opacity-100'}`}
          onPress={handleApprove}
          disabled={isLoading}
        >
          <Text className="text-white text-center font-semibold text-base">
            {isLoading ? 'Approving...' : 'Approve Submission'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 