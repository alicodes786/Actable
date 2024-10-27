// (tabs)/submission.tsx
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import CountDownTimer from '@/components/CountDownTimer';
import { uploadSubmissionImage } from '@/db/imageUpload';
import { supabase } from '@/lib/db';

interface SubmissionData {
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

function LoadingSpinner() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={styles.loadingText}>Loading submission details...</Text>
    </View>
  );
}

function ImageCapture({ deadlineId, userId }: { deadlineId: string; userId: string }) {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
        console.log('Photo taken:', result.assets[0].uri);
        setImage(result.assets[0].uri);
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

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      Alert.alert(
        'Authentication Required',
        'Please sign in to upload submissions.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!image) return;

    // const isAuthenticated = await checkAuth();
    // if (!isAuthenticated) return;

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

      Alert.alert(
        'Success',
        'Submission uploaded successfully!',
        [{ text: 'OK' }]
      );
      setImage(null);
    } catch (error) {
      console.error('Error uploading submission:', error);
      Alert.alert(
        'Upload Failed',
        'Failed to upload submission. Please try again.',
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
                uploading && styles.disabledButton
              ]}
              onPress={handleUpload}
              disabled={uploading}
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
          style={styles.button} 
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
      <Text style={styles.title}>Submission for: {submissionData.description}</Text>
      <Text style={styles.timer}>
        <CountDownTimer 
          deadlineDate={submissionData.date} 
          textColour='black'
        />
      </Text>
      <ImageCapture deadlineId={params.deadlineId as string} userId={'1'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff"
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
  timer: {
    fontSize: 16,
    marginBottom: 20,
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