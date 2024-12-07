import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { approveSubmission, invalidateSubmission, Submission, fetchSubmissionById } from '@/db/submissions';
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

  const handleInvalidate = async () => {
    try {
      setIsLoading(true);
      await invalidateSubmission(submissionId);
      Alert.alert('Success', 'Submission marked as invalid', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to invalidate submission');
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

  // Don't show action buttons if submission is already processed
  const showActions = submission.status === 'pending';

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

        {showActions && (
          <View className="flex-row space-x-4 mt-6">
            <TouchableOpacity 
              className={`flex-1 bg-green-500 py-4 px-6 rounded-xl 
                ${isLoading ? 'opacity-50' : 'opacity-100'}`}
              onPress={handleApprove}
              disabled={isLoading}
            >
              <Text className="text-white text-center font-semibold text-base">
                {isLoading ? 'Processing...' : 'Approve'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className={`flex-1 bg-red-500 py-4 px-6 rounded-xl 
                ${isLoading ? 'opacity-50' : 'opacity-100'}`}
              onPress={handleInvalidate}
              disabled={isLoading}
            >
              <Text className="text-white text-center font-semibold text-base">
                {isLoading ? 'Processing...' : 'Mark Invalid'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!showActions && (
          <View className="mt-6 py-4 px-6 rounded-xl bg-gray-100">
            <Text className="text-center font-semibold text-base capitalize">
              Status: {submission.status}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
} 