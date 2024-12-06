import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { router, useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import { DeadlineWithSubmission, fetchUnapprovedSubmissions } from '@/db/submissions';

// Define status colors
const STATUS_COLORS = {
  ON_TIME: ['#50C878', '#3CB371'] as const,    // Green
  LATE: ['#FF6347', '#DC143C'] as const,       // Red
};

// Define text colors to match status
const STATUS_TEXT_COLORS = {
  ON_TIME: '#3CB371',    // Green
  LATE: '#DC143C',       // Red
};

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
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // If less than 24 hours ago, show relative time
    if (diffDays === 0) {
      const hours = Math.floor(diffTime / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diffTime / (1000 * 60));
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      }
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // If within 7 days, show day of week
    if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' }) + 
             ' at ' + 
             date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
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

          {submissions.map((item) => {
            const isLate = isSubmissionLate(item.date, item.submission.submitteddate);
            const colors = isLate ? STATUS_COLORS.LATE : STATUS_COLORS.ON_TIME;
            
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push({
                  pathname: "/(dashboard)/submission/[id]",
                  params: { id: item.submission.id }
                })}
              >
                <View 
                  className="mt-4 overflow-hidden rounded-2xl"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 4,
                    },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                    elevation: 8
                  }}
                >
                  <LinearGradient
                    colors={colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <View className="p-5 pb-3">
                      <Image
                        source={{ uri: item.submission.imageurl }}
                        className="w-full h-40 rounded-lg"
                      />
                    </View>
                  </LinearGradient>
                  <View 
                    className="bg-white p-5"
                    style={{
                      borderTopWidth: 1,
                      borderColor: 'rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    <Text className="text-gray-900 text-lg font-semibold mb-3">
                      {item.name}
                    </Text>
                    <View className="flex-row justify-between items-center">
                      <View>
                        <Text className="text-gray-500 text-xs uppercase mb-1">
                          Submitted
                        </Text>
                        <Text 
                          className="text-sm font-medium"
                          style={{ 
                            color: isSubmissionLate(item.date, item.submission.submitteddate) 
                              ? STATUS_TEXT_COLORS.LATE 
                              : STATUS_TEXT_COLORS.ON_TIME 
                          }}
                        >
                          {formatDate(item.submission.submitteddate)}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-gray-500 text-xs uppercase mb-1">
                          Due Date
                        </Text>
                        <Text className="text-gray-800 text-sm font-medium">
                          {formatDate(item.date)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

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