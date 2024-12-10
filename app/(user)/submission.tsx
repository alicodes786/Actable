import { Stack } from 'expo-router';
import { View, Text, ActivityIndicator, Image, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import CountDownTimer from '@/components/CountDownTimer';
import { uploadSubmissionImage } from '@/db/imageUpload';
import { createNewSubmission, fetchLastSubmissionImage, SubmissionError } from '@/db/submissions';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/providers/AuthProvider';
import { getSingleDeadline } from '@/db/deadlines';

interface SubmissionData {
  name: string;
  description: string;
  date: Date;
}

export default function SubmissionScreen() {
  return (
    <>
      <Stack.Screen 
        options={{
          title: "submission",
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackVisible: true,
        }} 
      />
      <SubmissionContent />
    </>
  );
}

function ImageCapture({ deadlineId, userId }: { deadlineId: string; userId: string }) {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isNewPhoto, setIsNewPhoto] = useState(false);

  useEffect(() => {
    const loadLastSubmission = async () => {
      try {
        const imageUrl = await fetchLastSubmissionImage(deadlineId);
        if (imageUrl) {
          setImage(imageUrl);
          setIsNewPhoto(false);
        }
      } catch (error) {
        if (error instanceof SubmissionError) {
          console.error('Error loading last submission:', error.message);
          Alert.alert(
            'Error',
            'Failed to load previous submission. Please try again.',
            [{ text: 'OK' }]
          );
        }
      }
    };

    loadLastSubmission();
  }, [deadlineId]);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
        setIsNewPhoto(true);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert(
        'Error',
        'Failed to take photo. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleUpload = async () => {
    if (!image || !isNewPhoto || !userId) return;

    setUploading(true);

    try {
      const { publicUrl, error } = await uploadSubmissionImage({
        uri: image,
        userId,
        deadlineId,
      });

      if (error) {
        Alert.alert(
          'Upload Failed',
          'Failed to upload image. Please try again.',
          [{ text: 'OK' }]
        );
        return;
      }

      try {
        await createNewSubmission(
          deadlineId,
          userId,
          publicUrl
        );

        // Fetch the signed URL for display
        const signedUrl = await fetchLastSubmissionImage(deadlineId);
        if (signedUrl) {
          setImage(signedUrl);
          setIsNewPhoto(false);
        }

        Alert.alert(
          'Success',
          'Submission uploaded successfully!',
          [{ text: 'OK' }]
        );

      } catch (error) {
        Alert.alert(
          'Submission Failed',
          error instanceof SubmissionError 
            ? error.message 
            : 'Failed to create submission. Please try again.',
          [{ text: 'OK' }]
        );
      }

    } catch (error) {
      Alert.alert(
        'Upload Failed',
        'Failed to upload image. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="items-center mt-5">
      {image ? (
        <View className="w-full items-center">
          <Image 
            source={{ uri: image }} 
            className="w-[300px] h-[225px] rounded-lg mb-4"
            onError={(error) => console.error('Image preview error:', error)}
          />
          <View className="flex-row justify-around w-full">
            <TouchableOpacity 
              className={`bg-red-500 px-5 py-3 rounded-lg min-w-[120px] items-center ${uploading ? 'opacity-50' : ''}`}
              onPress={takePhoto}
              disabled={uploading}
            >
              <Text className="text-white text-base font-semibold">Retake Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`bg-green-500 px-5 py-3 rounded-lg min-w-[120px] items-center ${(!isNewPhoto || uploading) ? 'opacity-50' : ''}`}
              onPress={handleUpload}
              disabled={!isNewPhoto || uploading}
            >
              <Text className="text-white text-base font-semibold">
                {uploading ? 'Uploading...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>
          {uploading && (
            <ActivityIndicator 
              className="mt-2.5"
              size="large" 
              color="#0000ff" 
            />
          )}
        </View>
      ) : (
        <TouchableOpacity 
          className="bg-blue-500 px-5 py-3 rounded-lg w-full items-center"
          onPress={takePhoto}
        >
          <Text className="text-white text-base font-semibold">Take Photo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function SubmissionContent() {
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [submissionData, setSubmissionData] = useState<SubmissionData | null>(null);
  const [isInvalidSubmission, setIsInvalidSubmission] = useState(false);
  const { user } = useAuth();
  const deadlineId = Number(params.deadlineId);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      setSubmissionData(null);

      const fetchSubmissionData = async () => {
        try {
          const deadline = await getSingleDeadline(deadlineId.toString());
          
          if (deadline) {
            
            setSubmissionData({
              name: deadline.name,
              description: deadline.description,
              date: new Date(deadline.date),
            });
            
            // Only set invalid if there's a last submission and it's specifically invalid
            const lastSubmission = deadline.submissions?.find(
              sub => sub.id === deadline.lastsubmissionid
            );
            
            // Only set to true if we have a submission and its status is 'invalid'
            setIsInvalidSubmission(!!lastSubmission && lastSubmission.status === 'invalid');
          }
        } catch (error) {
          console.error('Error fetching submission data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      if (deadlineId) {
        fetchSubmissionData();
      }

      return () => {
        // Cleanup if needed
      };
    }, [deadlineId])
  );

  if (isLoading || !submissionData) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 p-6 bg-white">
      <Text className="text-lg font-bold mb-2.5">{submissionData.name}</Text>
      <Text className="text-sm mb-2.5">{submissionData.description}</Text>

      {isInvalidSubmission && (
        <View className="bg-red-50 p-3 rounded-lg mt-2.5 mb-2.5">
          <Text className="text-red-600 text-sm font-medium">
            Your last submission was marked as invalid. Please submit a new photo.
          </Text>
        </View>
      )}

      <View className="w-full items-center mt-8">      
        <CountDownTimer 
          deadlineDate={submissionData.date} 
          textColour='black'
        />
      </View>

      <ImageCapture deadlineId={params.deadlineId as string} userId={String(user?.id)} />
    </View>
  );
}