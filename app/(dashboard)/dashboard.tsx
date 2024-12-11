import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { DeadlineWithSubmission, fetchUnapprovedSubmissions } from '@/db/submissions';
import { useSignedUrl } from '@/lib/hooks/useSignedUrl';

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

// Create a SubmissionCard component to handle individual submissions
function SubmissionCard({ item }: { item: DeadlineWithSubmission }) {
  const signedUrl = useSignedUrl(item.submission.imageurl);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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

  const isLate = isSubmissionLate(item.date, item.submission.submitteddate);
  const colors = isLate ? STATUS_COLORS.LATE : STATUS_COLORS.ON_TIME;

  return (
    <TouchableOpacity
      onPress={() => router.push({
        pathname: "/(dashboard)/submission/[id]",
        params: { id: item.submission.id }
      })}
    >
      <View className="mt-4 overflow-hidden rounded-2xl">
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View className="p-5 pb-3">
            {signedUrl && (
              <Image
                source={{ uri: signedUrl }}
                className="w-full h-40 rounded-lg"
              />
            )}
          </View>
        </LinearGradient>
        <View 
          className="bg-white p-5"
          style={{
            borderTopWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.05)',
          }}
        >
          <Text className="text-gray-900 text-lg font-semibold mb-3" style={{ fontFamily: 'Roboto' }}>
            {item.name}
          </Text>
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-gray-500 text-xs uppercase mb-1" style={{ fontFamily: 'Roboto' }}>
                Submitted
              </Text>
              <Text 
                className="text-sm font-medium"
                style={{ 
                  color: isSubmissionLate(item.date, item.submission.submitteddate) 
                    ? STATUS_TEXT_COLORS.LATE 
                    : STATUS_TEXT_COLORS.ON_TIME,
                  fontFamily: 'Roboto'
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
}

export default function Dashboard() {
  const { user, assignedUser } = useAuth();
  const [submissions, setSubmissions] = useState<DeadlineWithSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'mod') {
      // Redirect non-moderators to user home if they somehow end up here
      router.replace('/(user)');
    }
  }, [user]);

  // Only render dashboard content for moderators
  if (user?.role !== 'mod') return null;

  const loadSubmissions = async () => {
    if (assignedUser?.id) {
      try {
        const data = await fetchUnapprovedSubmissions(assignedUser.id);
        setSubmissions(data);
      } catch (error) {
        console.error('Error loading submissions:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadSubmissions();
    }, [assignedUser?.id])
  );

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="p-5">
          <Text className="text-2xl mt-6 font-bold mb-5" style={{ fontFamily: 'Manrope' }}>
            Pending Submissions
          </Text>

          {submissions.map((item) => (
            <SubmissionCard key={item.id} item={item} />
          ))}

          {submissions.length === 0 && !loading && (
            <Text className="text-center text-gray-500 mt-5" style={{ fontFamily: 'Roboto' }}>
              No pending submissions to review
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
} 