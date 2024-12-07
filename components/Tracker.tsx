import React, { useCallback, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from 'tamagui';
import { useFocusEffect } from 'expo-router';
import { getDeadlines } from '@/db/deadlines';
import { IdeadlineList } from '@/lib/interfaces';

interface TrackerProps {
  userId: string;
}

export default function Tracker({ userId }: TrackerProps) {
  const [deadlines, setDeadlines] = useState<IdeadlineList | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    onTime: 0,
    late: 0,
    missed: 0,
    invalid: 0,
  });

  useFocusEffect(
    useCallback(() => {
      const fetchDeadlines = async () => {
        try {
          const fetchedDeadlines = await getDeadlines(userId);
          setDeadlines(fetchedDeadlines);
          calculateStats(fetchedDeadlines);
        } catch (error) {
          console.error('Error fetching deadlines:', error);
        }
      };

      fetchDeadlines();
    }, [userId])
  );

  const calculateStats = (deadlines: IdeadlineList | null) => {
    if (!deadlines?.deadlineList) return;

    const newStats = {
      total: deadlines.deadlineList.length,
      onTime: 0,
      late: 0,
      missed: 0,
      invalid: 0,
    };

    deadlines.deadlineList.forEach(deadline => {
      const submission = deadline.submissions?.[0];
      if (!submission) {
        newStats.missed++;
        return;
      }

      if (submission.status === 'invalid') {
        newStats.invalid++;
        return;
      }

      const submittedDate = new Date(submission.submitteddate);
      const deadlineDate = new Date(deadline.date);

      if (submittedDate <= deadlineDate) {
        newStats.onTime++;
      } else {
        newStats.late++;
      }
    });

    setStats(newStats);
  };

  return (
    <ScrollView className="flex-1" bounces={false}>
      <View className="px-5 pt-2 pb-10">
        <Text className="text-2xl font-bold mb-5">Submission Statistics</Text>
        
        <View className="bg-white rounded-xl p-5 shadow-sm mb-4">
          <Text className="text-lg mb-3">Total Deadlines: {stats.total}</Text>
          <Text className="text-green-600 mb-2">On Time: {stats.onTime}</Text>
          <Text className="text-orange-500 mb-2">Late: {stats.late}</Text>
          <Text className="text-red-500 mb-2">Missed: {stats.missed}</Text>
          <Text className="text-gray-500 mb-2">Invalid: {stats.invalid}</Text>
        </View>

        {stats.total > 0 && (
          <View className="bg-white rounded-xl p-5 shadow-sm">
            <Text className="text-lg mb-3">Performance</Text>
            <Text className="mb-2">
              On-Time Rate: {((stats.onTime / stats.total) * 100).toFixed(1)}%
            </Text>
            <Text className="mb-2">
              Submission Rate: {(((stats.onTime + stats.late) / stats.total) * 100).toFixed(1)}%
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
} 