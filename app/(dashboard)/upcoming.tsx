import React, { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, ScrollView, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { getDeadlines } from '@/db/deadlines';
import { useAuth } from '@/providers/AuthProvider';
import { Ideadline } from '@/lib/interfaces';
import CountDownTimer from '@/components/CountDownTimer';
import { colors, fonts } from '@/styles/theme';

// Define categories using theme colors
const CATEGORIES = {
  ALL: {
    label: 'All',
    color: '#000000',
  },
  UPCOMING: {
    label: 'Upcoming',
    color: colors.upcoming,
  },
  SUBMITTED: {
    label: 'Submitted',
    color: colors.pending,
  },
  INVALID: {
    label: 'Invalid',
    color: colors.invalid,
  },
};

export default function UpcomingScreen() {
  const [deadlines, setDeadlines] = useState<Ideadline[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('UPCOMING');
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

  const filterDeadlines = () => {
    if (!deadlines) return [];
    
    const now = Date.now();
    return deadlines
      .filter(deadline => {
        const deadlineTime = new Date(deadline.date).getTime();
        const submission = deadline.submissions?.find(
          sub => sub.id === deadline.lastsubmissionid
        );

        // First check if deadline is expired and has no submission
        if (deadlineTime < now && !submission) {
          return false; // Don't show expired deadlines with no submissions
        }

        switch (selectedCategory) {
          case 'ALL':
            return deadlineTime > now || submission; // Only show future deadlines or ones with submissions
          case 'UPCOMING':
            return deadlineTime > now && !deadline.completed && !submission;
          case 'SUBMITTED':
            return submission?.status === 'pending';
          case 'INVALID':
            return submission?.status === 'invalid';
          default:
            return false;
        }
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getCategoryCounts = () => {
    if (!deadlines) return {};
    
    const now = Date.now();
    const counts = {
      ALL: 0,
      UPCOMING: 0,
      SUBMITTED: 0,
      INVALID: 0,
    };

    deadlines.forEach(deadline => {
      const deadlineTime = new Date(deadline.date).getTime();
      const submission = deadline.submissions?.find(
        sub => sub.id === deadline.lastsubmissionid
      );

      // Skip expired deadlines with no submissions
      if (deadlineTime < now && !submission) {
        return;
      }

      // Only count if deadline is future or has a submission
      if (deadlineTime > now || submission) {
        counts.ALL++;
      }

      if (deadlineTime > now && !deadline.completed && !submission) {
        counts.UPCOMING++;
      } else if (submission?.status === 'pending') {
        counts.SUBMITTED++;
      } else if (submission?.status === 'invalid') {
        counts.INVALID++;
      }
    });

    return counts;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4">
        <Text className="text-2xl mt-6 mb-5" style={{ fontFamily: fonts.primary }}>
          Upcoming Deadlines
        </Text>

        {/* Category Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="flex-row mb-4 max-h-10"
        >
          {Object.entries(CATEGORIES).map(([key, value]) => {
            const counts = getCategoryCounts();
            const count = counts[key as keyof typeof counts];
            
            if (count === 0) return null;

            return (
              <TouchableOpacity
                key={key}
                onPress={() => setSelectedCategory(key)}
                className={`px-3 py-1.5 mr-2 rounded-2xl items-center justify-center ${
                  selectedCategory === key 
                    ? ''
                    : 'bg-gray-100'
                }`}
                style={selectedCategory === key ? { backgroundColor: value.color } : undefined}
              >
                <Text 
                  className={`text-sm font-medium ${
                    selectedCategory === key 
                      ? 'text-white'
                      : 'text-gray-600'
                  }`}
                  style={{ fontFamily: fonts.secondary }}
                >
                  {value.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Deadlines List */}
        <ScrollView className="flex-1">
          {filterDeadlines().map((deadline) => {
            const getDeadlineColor = () => {
              if (selectedCategory !== 'ALL') {
                return CATEGORIES[selectedCategory as keyof typeof CATEGORIES].color;
              }

              const deadlineTime = new Date(deadline.date).getTime();
              const submission = deadline.submissions?.find(
                sub => sub.id === deadline.lastsubmissionid
              );

              if (submission?.status === 'pending') return colors.pending;
              if (submission?.status === 'invalid') return colors.invalid;
              if (deadlineTime > Date.now() && !deadline.completed && !submission) {
                return colors.upcoming;
              }
              return colors.upcoming;
            };

            const backgroundColor = getDeadlineColor();
            
            return (
              <View key={deadline.id} className="mb-5">
                <View
                  className="rounded-3xl p-4 shadow-md"
                  style={{ backgroundColor }}
                >
                  <View className="flex-1">
                    <Text className="text-white text-lg mb-1" style={{ fontFamily: fonts.primary }}>
                      {deadline.name}
                    </Text>
                    <Text className="text-white/80 text-sm mb-3" style={{ fontFamily: fonts.secondary }}>
                      {deadline.description}
                    </Text>
                    <Text className="text-white text-lg font-medium" style={{ fontFamily: fonts.primary }}>
                      <CountDownTimer 
                        deadlineDate={new Date(deadline.date)} 
                        textColour="#FFFFFF" 
                      />
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
          
          {filterDeadlines().length === 0 && (
            <Text className="text-center text-gray-500 mt-5" style={{ fontFamily: fonts.secondary }}>
              No deadlines in this category
            </Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
} 