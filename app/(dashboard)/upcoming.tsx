import React, { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, ScrollView } from 'react-native';
import { Text } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { getDeadlines } from '@/db/deadlines';
import { useAuth } from '@/providers/AuthProvider';
import { Ideadline } from '@/lib/interfaces';
import CountDownTimer from '@/components/CountDownTimer';

export default function UpcomingScreen() {
  const [deadlines, setDeadlines] = useState<Ideadline[]>([]);
  const { isLoading, user, assignedUser } = useAuth();

  useFocusEffect(
    useCallback(() => {
      if (isLoading) return;

      const fetchDeadlines = async () => {
        try {
          if (!assignedUser?.id) return;
          const result = await getDeadlines(String(assignedUser.id));
          if (result?.deadlineList) {
            setDeadlines(result.deadlineList);
          }
        } catch (error) {
          console.error('Error fetching deadlines:', error);
        }
      };

      fetchDeadlines();
    }, [isLoading, assignedUser])
  );

  const getUpcomingDeadlines = () => {
    if (!deadlines) return [];
    
    const now = Date.now();
    return deadlines
      .sort((a, b) => {
        const aTime = new Date(a.date).getTime();
        const bTime = new Date(b.date).getTime();
        
        // First sort by whether deadline has passed
        const aHasPassed = aTime < now;
        const bHasPassed = bTime < now;
        if (aHasPassed !== bHasPassed) {
          return aHasPassed ? 1 : -1; // Put non-passed deadlines first
        }
        
        // Then sort by date
        return aTime - bTime;
      });
  };

  const blueGradient: [string, string, ...string[]] = ['#66b3ff', '#007FFF', '#0066cc'];
  const redGradient: [string, string, ...string[]] = ['#ff6666', '#ff1a1a', '#cc0000'];

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-5">Upcoming Deadlines</Text>
      
      <ScrollView className="flex-1">
        {getUpcomingDeadlines().map((deadline) => {
          const deadlinePassed = new Date(deadline.date).getTime() >= Date.now();
          
          return (
            <View key={deadline.id} className="mb-4">
              <LinearGradient
                colors={deadlinePassed ? blueGradient : redGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-xl p-4 shadow-md"
              >
                <View className="flex-1">
                  <Text className="text-lg font-bold text-white mb-2">{deadline.name}</Text>
                  <Text className="text-sm text-white mb-2">{deadline.description}</Text>
                  <Text className="text-sm text-white font-medium">
                    {deadlinePassed ?
                      <CountDownTimer deadlineDate={new Date(deadline.date)} />
                      :
                      "Deadline Passed"
                    }
                  </Text>
                </View>
              </LinearGradient>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
} 