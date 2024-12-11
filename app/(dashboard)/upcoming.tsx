import React, { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, ScrollView, Text } from 'react-native';
import { getDeadlines } from '@/db/deadlines';
import { useAuth } from '@/providers/AuthProvider';
import { Ideadline } from '@/lib/interfaces';
import CountDownTimer from '@/components/CountDownTimer';

// Define status colors like dashboard
const STATUS_COLORS = {
  AWAITING: {
    bg: '#2563EB',    // Blue 600
    text: '#FFFFFF',   // White text
    badge: '#1D4ED8',  // Blue 700
  },
  PENDING_REVIEW: {
    bg: '#F59E0B',    // Amber 600 - for pending review
    text: '#FFFFFF',   // White text
    badge: '#B45309',  // Amber 700
  },
  INVALID: {
    bg: '#808080',    // Gray 600
    text: '#FFFFFF',   // White text
    badge: '#696969',  // Gray 700
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
      <Text className="text-2xl mt-6 font-bold mb-5" style={{ fontFamily: 'Manrope' }}>
        Upcoming Deadlines
      </Text>
      
      <ScrollView className="flex-1">
        {getUpcomingDeadlines().map((deadline) => {
          const submission = deadline.submissions?.find(
            sub => sub.id === deadline.lastsubmissionid
          );
          let status = STATUS_COLORS.AWAITING;
          let statusText = 'Awaiting Submission';

          if (submission) {
            if (submission.status === 'pending') {
              status = STATUS_COLORS.PENDING_REVIEW;
              statusText = 'Pending Review';
            } else if (submission.status === 'invalid') {
              status = STATUS_COLORS.INVALID;
              statusText = 'Invalid Submission';
            }
          }
          
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
                    style={{ 
                      color: status.text,
                      fontFamily: 'Roboto'
                    }}
                  >
                    {statusText}
                  </Text>
                </View>
                <Text 
                  className="text-lg font-bold mb-2" 
                  style={{ 
                    color: status.text,
                    fontFamily: 'Roboto'
                  }}
                >
                  {deadline.name}
                </Text>
                <Text 
                  className="text-sm mb-3" 
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
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