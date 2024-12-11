import React, { useCallback, useState } from 'react';
import { View, ScrollView, SafeAreaView, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { IdeadlineList } from '@/lib/interfaces';
import { getDeadlines } from '@/db/deadlines';
import { useAuth } from '@/providers/AuthProvider';

// Define status colors
const STATUS_COLORS: Record<DeadlineStatus, readonly [string, string]> = {
  VALID: ['#50C878', '#3CB371'] as const,      // Green
  LATE: ['#FFA500', '#FF8C00'] as const,       // Orange
  MISSED: ['#FF6347', '#DC143C'] as const,     // Red
  INVALID: ['#808080', '#696969'] as const,    // Grey
  PENDING: ['#2563EB', '#1D4ED8'] as const,    // Blue
};

type DeadlineStatus = 'VALID' | 'LATE' | 'MISSED' | 'INVALID' | 'PENDING';

interface HistoryEntry {
  deadline: any;
  status: DeadlineStatus;
  completedDate?: Date;
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
          const userId = user?.role === 'mod' ? String(assignedUser?.id) : String(user?.id);
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
        // Include if deadline is completed OR if it's in the past
        return deadline.completed || dueDate < now;
      })
      .map(deadline => {
        const dueDate = new Date(deadline.date);
        let status: DeadlineStatus;
        let completedDate: Date | undefined;

        const submission = deadline.submissions?.find(
          sub => sub.id === deadline.lastsubmissionid
        );

        // If there's no submission and deadline is past, it's missed
        if (!deadline.lastsubmissionid && dueDate < now) {
          status = 'MISSED';
        }
        // If there's a submission, determine its status
        else if (submission) {
          completedDate = new Date(submission.submitteddate);
          if (submission.status === 'approved') {
            status = completedDate <= dueDate ? 'VALID' : 'LATE';
          } else if (submission.status === 'invalid') {
            status = 'INVALID';
          } else {
            status = 'PENDING';
          }
        }
        // Fallback (shouldn't happen given our filter)
        else {
          status = 'PENDING';
        }

        return {
          deadline,
          status,
          completedDate,
          dueDate,
        };
      })
      .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime());
  };

  const getStatusLabel = (status: DeadlineStatus): string => {
    switch (status) {
      case 'VALID': return 'Submitted on time';
      case 'LATE': return 'Submitted late';
      case 'MISSED': return 'Not submitted';
      case 'INVALID': return 'Submission invalid';
      case 'PENDING': return 'Pending approval';
    }
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
          <Text className="text-2xl font-bold mb-3" style={{ fontFamily: 'Manrope' }}>
            History
          </Text>

          {getHistoryEntries().map(({ deadline, status, completedDate, dueDate }, idx) => (
            <View key={deadline.id || idx}>
              <LinearGradient
                colors={STATUS_COLORS[status]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="mt-4 p-5 rounded-2xl shadow-md"
              >
                <Text className="text-white text-base font-medium mb-1" style={{ fontFamily: 'Roboto' }}>
                  {deadline.name}
                </Text>
                {completedDate && (
                  <Text className="text-white text-sm mb-1" style={{ fontFamily: 'Roboto' }}>
                    Completed: {formatDate(completedDate)}
                  </Text>
                )}
                <Text className="text-white text-sm mb-1" style={{ fontFamily: 'Roboto' }}>
                  Due: {formatDate(dueDate)}
                </Text>
                <Text className="text-white text-sm mb-2 italic" style={{ fontFamily: 'Roboto' }}>
                  {getStatusLabel(status)}
                </Text>
              </LinearGradient>
            </View>
          ))}

          {getHistoryEntries().length === 0 && (
            <Text className="text-gray-500 text-center mt-10" style={{ fontFamily: 'Roboto' }}>
              No deadline history found
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 