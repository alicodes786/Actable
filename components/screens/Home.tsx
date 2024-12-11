import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { IdeadlineList } from '@/lib/interfaces';
import { getDeadlines } from '@/db/deadlines';
import CountDownTimer from '../CountDownTimer';
import { useAuth } from '@/providers/AuthProvider';
import { getUserName } from '@/db/users'; // Assuming you have this function to fetch user name

const GRADIENT_COLORS: [string, string][] = [
  ['#87CEEB', '#00BFFF'],
  ['#ff7a63', '#FF6347'],
  ['#8f75ff', '#5d3ce8'],
];

const STATUS_COLORS = {
  INVALID: {
    bg: '#808080',    // Gray 600
    text: '#FFFFFF',   // White text
    badge: '#696969',  // Gray 700
  },
  PENDING: {
    bg: '#FFA500',    // Orange
    text: '#FFFFFF',   // White text
    badge: '#FF8C00',  // Dark Orange
  },
};

export default function Home() {
  const [deadlines, setDeadlines] = useState<IdeadlineList | null>(null);
  const [userName, setUserName] = useState<string | null>(null); // State to store user name
  const { isLoading, user } = useAuth();

  // Fetch user name when the user is available
  useEffect(() => {
    if (!user || isLoading) return;

    const fetchUserName = async () => {
      try {
        const name = await getUserName(user?.id); // Fetch name using the user ID
        setUserName(name);
      } catch (error) {
        console.error('Error fetching user name:', error);
      }
    };

    fetchUserName();
  }, [user, isLoading]);

  useFocusEffect(
    useCallback(() => {
      if (isLoading || !user) return;

      const fetchDeadlines = async () => {
        try {
          const fetchedDeadlines = await getDeadlines(String(user?.id)); // Pass user.id to get deadlines
          setDeadlines(fetchedDeadlines);
        } catch (error) {
          console.error('Error fetching deadlines:', error);
          // Handle error appropriately
        }
      };

      fetchDeadlines();
    }, [isLoading, user])
  );

  const handleSubmission = (item: any) => {
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

  const getUpcomingDeadlines = () => {
    if (!deadlines?.deadlineList) return [];

    return deadlines.deadlineList
      .filter(item => 
        new Date(item.date).getTime() >= Date.now() && 
        !item.completed
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" bounces={false}>
        <View className="px-5 pt-2 pb-10 flex-1">
          <Text className="text-lg font-medium" style={{ fontFamily: 'Manrope' }}>Welcome {userName || 'Loading...'}</Text>

          <View className="mt-10">
            <Text className="text-2xl font-bold mb-3" style={{ fontFamily: 'Manrope' }}>Upcoming</Text>

            {getUpcomingDeadlines().map((item, idx) => {
              const submission = item.submissions?.find(
                sub => sub.id === item.lastsubmissionid
              );
              const isInvalid = submission?.status === 'invalid';
              const isPending = submission?.status === 'pending';
              const hasSubmission = !!submission;

              return (
                <LinearGradient
                  key={item.id || idx}
                  colors={GRADIENT_COLORS[idx]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="mt-4 p-5 rounded-2xl shadow-md relative"
                >
                  {(isInvalid || isPending) && (
                    <View 
                      className="absolute top-2 right-2 rounded-full px-3 py-1"
                      style={{ 
                        backgroundColor: isInvalid 
                          ? STATUS_COLORS.INVALID.badge 
                          : STATUS_COLORS.PENDING.badge 
                      }}
                    >
                      <Text 
                        className="text-xs font-medium"
                        style={{ 
                          color: isInvalid 
                            ? STATUS_COLORS.INVALID.text 
                            : STATUS_COLORS.PENDING.text 
                        }}
                      >
                        {isInvalid ? 'Invalid Submission' : 'Pending Review'}
                      </Text>
                    </View>
                  )}
                  <Text className="text-white text-base font-medium mb-1">
                    {item.name}
                  </Text>
                  <Text className="text-white text-base font-medium">
                    <CountDownTimer 
                      deadlineDate={new Date(item.date)} 
                      textColour="#FFFFFF" 
                    />
                  </Text>
                  <TouchableOpacity
                    className="bg-black p-2.5 rounded mt-2.5 self-start min-w-[100px] items-center"
                    onPress={() => handleSubmission(item)}
                  >
                    <Text className="text-white text-lg font-semibold">
                      {hasSubmission ? 'Resubmit' : 'Submit'}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
