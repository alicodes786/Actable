import React, { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, ScrollView } from 'react-native';
import { Text } from 'tamagui';
import { getDeadlines } from '@/db/deadlines';
import { useAuth } from '@/providers/AuthProvider';
import { Ideadline } from '@/lib/interfaces';
import CountDownTimer from '@/components/CountDownTimer';

// Define status colors like dashboard
const STATUS_COLORS = {
  PENDING: {
    bg: '#2563EB',    // Blue 600 - lighter, vibrant blue
    text: '#FFFFFF',   // White text
    badge: '#1D4ED8',  // Blue 700 - slightly darker for badge
  },
  SUBMITTED: {
    bg: '#02ba4f',    // Emerald 600 - lighter green to match blue intensity
    text: '#FFFFFF',   // White text
    badge: '#047857',  // Emerald 700 - slightly darker for badge
  },
};

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
      .filter(deadline => {
        const deadlineTime = new Date(deadline.date).getTime();
        // Only show future deadlines that aren't completed
        return deadlineTime > now && !deadline.completed;
      })
      .sort((a, b) => {
        const aTime = new Date(a.date).getTime();
        const bTime = new Date(b.date).getTime();
        return aTime - bTime;
      });
  };

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-5">Upcoming Deadlines</Text>
      
      <ScrollView className="flex-1">
        {getUpcomingDeadlines().map((deadline) => {
          const hasSubmission = deadline.lastsubmissionid
          const status = hasSubmission ? STATUS_COLORS.SUBMITTED : STATUS_COLORS.PENDING;
          
          return (
            <View 
              key={deadline.id} 
              className="mb-4 rounded-xl p-4 shadow-md"
              style={{ backgroundColor: status.bg }}
            >
              <View className="flex-1">
                <View 
                  className="self-start rounded-full px-3 py-1 mb-2"
                  style={{ backgroundColor: status.badge }}
                >
                  <Text 
                    className="text-xs font-medium"
                    style={{ color: status.text }}
                  >
                    {hasSubmission ? 'Submitted' : 'Pending'}
                  </Text>
                </View>
                <Text className="text-lg font-bold mb-2" style={{ color: status.text }}>
                  {deadline.name}
                </Text>
                <Text className="text-sm mb-3" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {deadline.description}
                </Text>
                <CountDownTimer 
                  deadlineDate={new Date(deadline.date)}
                  textColour={status.text}
                />
              </View>
            </View>
          );
        })}
        
        {getUpcomingDeadlines().length === 0 && (
          <Text className="text-center text-gray-500 mt-4">
            No upcoming deadlines
          </Text>
        )}
      </ScrollView>
    </View>
  );
} 