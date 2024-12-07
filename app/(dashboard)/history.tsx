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

interface HistoryEntry {
  deadline: any;
  status: DeadlineStatus;
  completedDate?: Date;  // Date when the deadline was completed (if applicable)
  dueDate: Date;
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

  const getHistoryEntries = (): HistoryEntry[] => {
    if (!deadlines?.deadlineList) return [];

    const now = new Date();
    
    return deadlines.deadlineList
      .filter(deadline => {
        const dueDate = new Date(deadline.date);
        const submission = deadline.submissions?.[0];
        
        // Include if:
        // 1. Has an approved submission (completed) OR
        // 2. Due date has passed and no approved submission (missed)
        return submission?.isapproved || (!submission?.isapproved && dueDate < now);
      })
      .map(deadline => {
        const dueDate = new Date(deadline.date);
        const submission = deadline.submissions?.[0];

        let status: DeadlineStatus;
        let completedDate: Date | undefined;

        if (submission?.isapproved) {
          completedDate = new Date(submission.submitteddate);
          status = completedDate <= dueDate ? 'VALID' : 'LATE';
        } else {
          // Check if there's a lastsubmission ID
          status = deadline.lastsubmissionid ? 'INVALID' : 'MISSED';
        }

        return {
          deadline,
          status,
          completedDate,
          dueDate,
        };
      })
      .sort((a, b) => {
        // Sort by due date
        return b.dueDate.getTime() - a.dueDate.getTime();
      });
  };

  const getStatusLabel = (status: DeadlineStatus): string => {
    switch (status) {
      case 'VALID': return 'Submitted on time';
      case 'LATE': return 'Submitted late';
      case 'MISSED': return 'Not submitted';
      case 'INVALID': return 'Pending';
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
          <Text className="text-2xl font-bold mb-3">History</Text>

          {getHistoryEntries().map(({ deadline, status, completedDate, dueDate }, idx) => (
            <TouchableOpacity
              key={deadline.id || idx}
              onPress={() => handleViewSubmission(deadline)}
            >
              <LinearGradient
                colors={STATUS_COLORS[status]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="mt-4 p-5 rounded-2xl shadow-md"
              >
                <Text className="text-white text-base font-medium mb-1">
                  {deadline.name}
                </Text>
                {completedDate && (
                  <Text className="text-white text-sm mb-1">
                    Completed: {formatDate(completedDate)}
                  </Text>
                )}
                <Text className="text-white text-sm mb-1">
                  Due: {formatDate(dueDate)}
                </Text>
                <Text className="text-white text-sm mb-2 italic">
                  {getStatusLabel(status)}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}

          {getHistoryEntries().length === 0 && (
            <Text className="text-gray-500 text-center mt-10">
              No deadline history found
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 