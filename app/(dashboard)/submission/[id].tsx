import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { approveSubmission, Submission } from '@/db/submissions';
import Toast from 'react-native-toast-message';
import { supabase } from '@/lib/db';
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
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', submissionId)
        .single();

      if (error) throw error;
      setSubmission(data);
    } catch (error) {
      console.error('Error loading submission:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load submission',
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsLoading(true);
      await approveSubmission(submissionId);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Submission approved successfully',
        position: 'bottom',
      });
      router.back();
    } catch (error) {
      console.error('Error approving submission:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to approve submission',
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!submission) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Submission not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: submission.imageurl }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <TouchableOpacity 
        style={styles.approveButton}
        onPress={handleApprove}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Approving...' : 'Approve Submission'}
        </Text>
      </TouchableOpacity>

      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    padding: 20,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 400,
    borderRadius: 12,
  },
  approveButton: {
    backgroundColor: '#34C759',
    margin: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
}); 