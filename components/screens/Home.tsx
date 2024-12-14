import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { IdeadlineList } from '@/lib/interfaces';
import { getDeadlines } from '@/db/deadlines';
import CountDownTimer from '../CountDownTimer';
import { useAuth } from '@/providers/AuthProvider';
import { getUserName } from '@/db/users'; // Assuming you have this function to fetch user name
import Header from '@/components/Header';
import Ionicons from 'react-native-vector-icons/Ionicons';

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

const DEADLINE_COLORS = [
  '#FF7B7B',  // Coral Red
  '#82C3FF',  // Light Blue
  '#98D8A3',  // Light Green
  '#FFB480',  // Light Orange
  '#B5A8FF',  // Light Purple
  '#FF9FD3',  // Light Pink
];

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

  const getUniqueRandomColor = (previousColor?: string): string => {
    const availableColors = DEADLINE_COLORS.filter(color => color !== previousColor);
    return availableColors[Math.floor(Math.random() * availableColors.length)];
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" bounces={false}>
        <View className="pb-10 flex-1">
          <Header />
          <View className="mt-10 px-5">
            <Text className="text-3xl mb-3" style={{ fontFamily: 'Manrope' }}>Upcoming</Text>

            {getUpcomingDeadlines().map((item, idx, array) => {
              const previousColor = idx > 0 ? 
                (array[idx - 1] as any).cardColor : undefined;
              const cardColor = getUniqueRandomColor(previousColor);
              
              (item as any).cardColor = cardColor;

              const submission = item.submissions?.find(
                sub => sub.id === item.lastsubmissionid
              );
              const hasSubmission = !!submission;

              return (
                <View 
                  key={item.id || idx} 
                  className="mb-4"
                >
                  <View
                    className="rounded-3xl p-4 shadow-md"
                    style={{ backgroundColor: cardColor }}
                  >
                    <Text className="text-white text-lg mb-1" style={{ fontFamily: 'Manrope' }}>
                      {item.name}
                    </Text>
                    <Text className="text-white/80 text-sm mb-3" style={{ fontFamily: 'Manrope' }}>
                      {item.description}
                    </Text>

                    <View className="flex-row justify-between items-center mt-3">
                      <Text className="text-white text-lg font-medium flex-shrink" style={{ fontFamily: 'Manrope' }}>
                        <CountDownTimer 
                          deadlineDate={new Date(item.date)} 
                          textColour="#FFFFFF" 
                        />
                      </Text>

                      <TouchableOpacity 
                        className="bg-white px-4 py-2 rounded-lg ml-2"
                        onPress={() => handleSubmission(item)}
                      >
                        <Text className="text-black font-medium">
                          {hasSubmission ? 'Resubmit →' : 'Submit →'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
