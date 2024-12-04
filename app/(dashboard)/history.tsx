import React, { useCallback, useState } from 'react';
import { View, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Text } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, router } from 'expo-router';
import { IdeadlineList } from '@/lib/interfaces';
import { getDeadlines } from '@/db/deadlines';
import { useAuth } from '@/providers/AuthProvider';

// Define status colors
const STATUS_COLORS: Record<DeadlineStatus, readonly [string, string]> = {
  VALID: ['#50C878', '#3CB371'] as const,      // Green
  LATE: ['#FFA500', '#FF8C00'] as const,       // Orange
  MISSED: ['#FF6347', '#DC143C'] as const,     // Red
  INVALID: ['#808080', '#696969'] as const,    // Grey
};

type DeadlineStatus = 'VALID' | 'LATE' | 'MISSED' | 'INVALID';

interface CategorizedDeadline {
  item: any;
  status: DeadlineStatus;
}

export default function HistoryScreen() {
  const [deadlines, setDeadlines] = useState<IdeadlineList | null>(null);
  const { isLoading, user, assignedUser } = useAuth();

  useFocusEffect(
    useCallback(() => {
      if (isLoading) return;

      const fetchDeadlines = async () => {
        try {
          const userId = user?.isMod ? String(assignedUser?.id) : String(user?.id);
          if (!userId) return;

          const fetchedDeadlines = await getDeadlines(userId);
          setDeadlines(fetchedDeadlines);
        } catch (error) {
          console.error('Error fetching deadlines:', error);
        }
      };

      fetchDeadlines();
    }, [isLoading, user, assignedUser])
  );

  const categorizeDeadline = (deadline: any): CategorizedDeadline => {
    const deadlineDate = new Date(deadline.date);
    const submission = deadline.submissions?.[0];
    
    if (!submission) {
      return {
        item: deadline,
        status: 'MISSED'
      };
    }

    const submittedDate = new Date(submission.submitteddate);

    if (!submission.isapproved) {
      return {
        item: deadline,
        status: 'INVALID'
      };
    }

    if (submittedDate <= deadlineDate) {
      return {
        item: deadline,
        status: 'VALID'
      };
    }

    return {
      item: deadline,
      status: 'LATE'
    };
  };

  const getCompletedDeadlines = () => {
    if (!deadlines?.deadlineList) return [];

    return deadlines.deadlineList
      .filter(item => {
        // Include deadlines that either:
        // 1. Are in the past, OR
        // 2. Have an approved submission
        const isPastDeadline = new Date(item.date).getTime() < Date.now();
        const hasApprovedSubmission = item.submissions?.[0]?.isapproved === true;
        
        return isPastDeadline || hasApprovedSubmission;
      })
      .map(categorizeDeadline)
      .sort((a, b) => {
        // Sort by due date (most recent first)
        return new Date(b.item.date).getTime() - new Date(a.item.date).getTime();
      });
  };

  const getStatusLabel = (status: DeadlineStatus): string => {
    switch (status) {
      case 'VALID': return 'Submitted on time';
      case 'LATE': return 'Submitted late';
      case 'MISSED': return 'Not submitted';
      case 'INVALID': return 'Invalid submission';
    }
  };

  const handleViewSubmission = (item: any) => {
    router.push({
      pathname: "/(user)/submission",
      params: {
        deadlineId: item.id,
        name: item.name,
        description: item.description,
        date: item.date instanceof Date ? item.date.toISOString() : item.date,
      }
    });
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" bounces={false}>
        <View className="px-5 pt-2 pb-10 flex-1">
          <Text className="text-2xl font-bold mb-3">Completed Deadlines</Text>

          {getCompletedDeadlines().map(({ item, status }, idx) => (
            <LinearGradient
              key={item.id || idx}
              colors={STATUS_COLORS[status]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="mt-4 p-5 rounded-2xl shadow-md"
            >
              <Text className="text-white text-base font-medium mb-1">
                {item.name}
              </Text>
              <Text className="text-white text-sm mb-1">
                Due: {formatDate(item.date)}
              </Text>
              <Text className="text-white text-sm mb-2 italic">
                Status: {getStatusLabel(status)}
              </Text>
            </LinearGradient>
          ))}

          {getCompletedDeadlines().length === 0 && (
            <Text className="text-gray-500 text-center mt-10">
              No completed deadlines found
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 