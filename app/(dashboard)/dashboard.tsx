import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { DeadlineWithSubmission, fetchUnapprovedSubmissions } from '@/db/submissions';
import { useSignedUrl } from '@/lib/hooks/useSignedUrl';
import { fonts } from '@/styles/theme';

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
      className="mb-4"
    >
      <View className="rounded-2xl overflow-hidden bg-white shadow-lg border border-gray-300">
        {/* Image Container */}
        <View className="relative">
          {signedUrl && (
            <Image
              source={{ uri: signedUrl }}
              className="w-full h-48"
              resizeMode="cover"
            />
          )}
          {/* Floating Title */}
          <View className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
            <Text className="text-white text-lg font-medium" style={{ fontFamily: fonts.primary }}>
              {item.name}
            </Text>
          </View>
        </View>

        {/* Status and Dates */}
        <View className="p-4 flex-row justify-between items-center">
          <View>
            <Text 
              className="text-green-600 text-sm uppercase mb-1" 
              style={{ fontFamily: fonts.secondary }}
            >
              SUBMITTED
            </Text>
            <Text 
              className="text-gray-600 text-sm" 
              style={{ fontFamily: fonts.secondary }}
            >
              {formatDate(item.submission.submitteddate)}
            </Text>
          </View>
          <View>
            <Text 
              className="text-gray-500 text-sm uppercase mb-1" 
              style={{ fontFamily: fonts.secondary }}
            >
              DUE
            </Text>
            <Text 
              className="text-gray-600 text-sm" 
              style={{ fontFamily: fonts.secondary }}
            >
              {formatDate(item.date)}
            </Text>
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
          <Text className="text-2xl mt-6 mb-5" style={{ fontFamily: 'Manrope' }}>
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