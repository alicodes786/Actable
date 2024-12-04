import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
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

  const handleSignOut = async () => {
    try {
      await logout();
      Toast.show({
        type: 'success',
        text1: 'Signed Out Successfully',
        text2: 'Redirecting to login...',
        position: 'bottom',
        visibilityTime: 2000,
      });
      router.replace('/(auth)/sign-in');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to sign out. Please try again.',
        position: 'bottom',
      });
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
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
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

      <View className="p-5 border-t border-gray-200">
        <TouchableOpacity 
          className="bg-purple-600 py-4 rounded-xl"
          onPress={handleSignOut}
        >
          <Text className="text-white text-center font-semibold">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  cardContent: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDate: {
    fontSize: 14,
    color: '#666',
  },
  noSubmissions: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  signOutButton: {
    backgroundColor: '#443399',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 