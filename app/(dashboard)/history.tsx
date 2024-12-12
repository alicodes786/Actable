import React, { useCallback, useState } from 'react';
import { View, ScrollView, SafeAreaView, Text } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { IdeadlineList } from '@/lib/interfaces';
import { getDeadlines } from '@/db/deadlines';
import { useAuth } from '@/providers/AuthProvider';
import { colors, fonts } from '@/styles/theme';

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
      case 'VALID': return 'Completed';
      case 'LATE': return 'Late';
      case 'MISSED': return 'Missed';
      case 'INVALID': return 'Invalid';
      case 'PENDING': return 'Pending';
    }
  };

  const getStatusColor = (status: DeadlineStatus): string => {
    switch (status) {
      case 'VALID': return colors.completed;
      case 'LATE': return colors.late;
      case 'MISSED': return colors.missed;
      case 'INVALID': return colors.invalid;
      case 'PENDING': return colors.pending;
    }
  };

  const getLighterShade = (status: DeadlineStatus): string => {
    switch (status) {
      case 'VALID': return `${colors.completed}33`;    // 33 is hex for 20% opacity
      case 'LATE': return `${colors.late}33`;
      case 'MISSED': return `${colors.missed}33`;
      case 'INVALID': return `${colors.invalid}33`;
      case 'PENDING': return `${colors.pending}33`;
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
          <Text className="text-2xl mt-6 mb-3" style={{ fontFamily: fonts.primary }}>
            History
          </Text>

          {getHistoryEntries().map(({ deadline, status, completedDate, dueDate }, idx) => (
            <View key={deadline.id || idx} className="mb-4">
              <View 
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: getStatusColor(status) }}
              >
                {/* Status Label */}
                <View className="p-4">
                  <View 
                    className="self-start rounded-full px-3 py-1"
                    style={{ backgroundColor: '#FFFFFF33' }} // semi-transparent white
                  >
                    <Text 
                      className="text-xs uppercase font-medium" 
                      style={{ 
                        fontFamily: fonts.secondary,
                        color: '#FFFFFF'
                      }}
                    >
                      {getStatusLabel(status)}
                    </Text>
                  </View>
                </View>

                {/* Main Content */}
                <View className="px-4 pb-4">
                  <Text 
                    className="text-white text-lg mb-3" 
                    style={{ fontFamily: fonts.primary }}
                  >
                    {deadline.name}
                  </Text>

                  {/* Dates Section */}
                  <View className="flex-row justify-between">
                    <View>
                      <Text 
                        className="text-white/60 text-xs uppercase mb-1" 
                        style={{ fontFamily: fonts.secondary }}
                      >
                        SUBMITTED
                      </Text>
                      <Text 
                        className="text-white text-sm" 
                        style={{ fontFamily: fonts.secondary }}
                      >
                        {status === 'MISSED' ? 'Deadline Passed' : formatDate(completedDate || '')}
                      </Text>
                    </View>
                    <View>
                      <Text 
                        className="text-white/60 text-xs uppercase mb-1" 
                        style={{ fontFamily: fonts.secondary }}
                      >
                        DUE DATE
                      </Text>
                      <Text 
                        className="text-white text-sm" 
                        style={{ fontFamily: fonts.secondary }}
                      >
                        {formatDate(dueDate)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}

          {getHistoryEntries().length === 0 && (
            <Text className="text-gray-500 text-center mt-10" style={{ fontFamily: fonts.secondary }}>
              No deadline history found
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 