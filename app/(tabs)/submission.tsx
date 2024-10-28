import { Stack } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import CountDownTimer from '@/components/CountDownTimer';
import { uploadSubmissionImage } from '@/db/imageUpload';
import { createNewSubmission, fetchLastSubmissionImage, SubmissionError } from '@/db/submissions';
import LoadingSpinner from '@/components/LoadingSpinner';

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
    if (!image || !isNewPhoto) return;

    setUploading(true);

    try {
      const { publicUrl, error } = await uploadSubmissionImage({
        uri: image,
        userId,
        deadlineId,
      });

      if (error) {
        throw error;
      }

      const newSubmission = await createNewSubmission(
        deadlineId,
        userId,
        publicUrl
      );

      Alert.alert(
        'Success',
        'Submission uploaded successfully!',
        [{ text: 'OK' }]
      );
      setImage(publicUrl);
      setIsNewPhoto(false);

    } catch (error) {
      console.error('Error uploading submission:', error);
      Alert.alert(
        'Upload Failed',
        error instanceof SubmissionError 
          ? error.message 
          : 'Failed to upload submission. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.imageSection}>
      {image ? (
        <View style={styles.previewContainer}>
          <Image 
            source={{ uri: image }} 
            style={styles.preview}
            onError={(error) => console.error('Image preview error:', error)}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.retakeButton]} 
              onPress={takePhoto}
              disabled={uploading}
            >
              <Text style={styles.buttonText}>Retake Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.uploadButton,
                (!isNewPhoto || uploading) && styles.disabledButton
              ]}
              onPress={handleUpload}
              disabled={!isNewPhoto || uploading}
            >
              <Text style={styles.buttonText}>
                {uploading ? 'Uploading...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>
          {uploading && (
            <ActivityIndicator 
              style={styles.loadingIndicator} 
              size="large" 
              color="#0000ff" 
            />
          )}
        </View>
      ) : (
        <TouchableOpacity 
          style={[styles.button, styles.photoButton]} 
          onPress={takePhoto}
        >
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function SubmissionContent() {
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [submissionData, setSubmissionData] = useState<SubmissionData | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setSubmissionData(null);

    const processData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSubmissionData({
          name: params.name as string,
          description: params.description as string,
          date: new Date(params.date as string)
        });
      } catch (error) {
        console.error('Error processing submission data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    processData();
  }, [params.description, params.date]);

  if (isLoading || !submissionData) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{submissionData.name}</Text>
      <Text style={styles.description}>{submissionData.description}</Text>

      <View style={styles.timer}>      
        <CountDownTimer 
            deadlineDate={submissionData.date} 
            textColour='black'
        />
      </View>

      <ImageCapture deadlineId={params.deadlineId as string} userId={'1'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#fff"
  },
  loadingText: {
    marginTop: 10,
    color: '#666'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
  },
  timer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 50
  },
  imageSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  previewContainer: {
    width: '100%',
    alignItems: 'center',
  },
  preview: {
    width: 300,
    height: 225,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  photoButton: {
    minWidth: '100%'
  },
  retakeButton: {
    backgroundColor: '#FF3B30',
  },
  uploadButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingIndicator: {
    marginTop: 10,
  },
});