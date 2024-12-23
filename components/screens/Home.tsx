import React, { useCallback, useState, useEffect} from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { IdeadlineList } from '@/lib/interfaces';
import { getDeadlines } from '@/db/deadlines';
import CountDownTimer from '../CountDownTimer';
import { useAuth } from '@/providers/AuthProvider';
import { getUserName } from '@/db/users'; // Assuming you have this function to fetch user name
import Header from '@/components/Header';
import { colors, fonts } from '@/styles/theme';

const DEADLINE_COLORS = [
  '#FF7B7B',  // Coral Red
  '#82C3FF',  // Light Blue
  '#98D8A3',  // Light Green
  '#FFB480',  // Light Orange
  '#B5A8FF',  // Light Purple
  '#FF9FD3',  // Light Pink
];

const getStatusLabel = (deadline: any, cardColor: string) => {
  const now = new Date();
  const deadlineDate = new Date(deadline.date);
  const timeDiff = deadlineDate.getTime() - now.getTime();
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

  if (daysDiff <= 1 && daysDiff > 0) {
    return {
      text: 'URGENT',
      textColor: '#FFFFFF',
      bgColor: 'rgba(255, 255, 255, 0.25)'
    };
  } else if (daysDiff > 1 && daysDiff <= 3) {
    return {
      text: 'APPROACHING',
      textColor: '#FFFFFF',
      bgColor: 'rgba(255, 255, 255, 0.25)'
    };
  } else if (daysDiff > 3) {
    return {
      text: 'UPCOMING',
      textColor: '#FFFFFF',
      bgColor: 'rgba(255, 255, 255, 0.25)',
    };
  }
  return null;
};


const generateColorMapping = (deadlines: any[]) => {
  const newColorMapping: Record<string, string> = {};
  const usedColors = new Set<string>();
  
  deadlines.forEach((deadline) => {
    if (!newColorMapping[deadline.id]) {
      const availableColors = DEADLINE_COLORS.filter(color => !usedColors.has(color));
      
      if (availableColors.length === 0) {
        usedColors.clear();
        availableColors.push(...DEADLINE_COLORS);
      }
      
      const randomIndex = Math.floor(Math.random() * availableColors.length);
      const randomColor = availableColors[randomIndex];
      
      newColorMapping[deadline.id] = randomColor;
      usedColors.add(randomColor);
    }
  });

  return newColorMapping;
};

export default function Home() {
  const [deadlines, setDeadlines] = useState<IdeadlineList | null>(null);
  const [userName, setUserName] = useState<string | null>(null); // State to store user name
  const { isLoading, user, deadlineColors, setDeadlineColors } = useAuth();

  // Update color mapping when deadlines change
  useEffect(() => {
    if (!deadlines?.deadlineList || deadlines.deadlineList.length === 0) return;
    
    // Only generate new colors if we don't have colors for these deadlines
    const needsNewColors = deadlines.deadlineList.some(
      deadline => !deadlineColors[deadline.id]
    );
    
    if (needsNewColors) {
      const newColors = generateColorMapping(deadlines.deadlineList);
      setDeadlineColors(newColors);
    }
  }, [deadlines?.deadlineList]); // Only depend on deadlines changing

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
        <View className="pb-10 flex-1">
          <Header />
          <View className="mt-10 px-5">
            <Text className="text-3xl mb-3" style={{ fontFamily: fonts.primary }}>Upcoming</Text>

            {getUpcomingDeadlines().map((item, idx) => {
              const cardColor = deadlineColors[item.id] || DEADLINE_COLORS[0];
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
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-white text-lg font-bold" style={{ fontFamily: fonts.primary }}>
                        {item.name}
                      </Text>
                      {getStatusLabel(item, cardColor) && (
                        <View 
                          className="px-3 py-1.5 font-bold rounded-full ml-2"
                          style={{ 
                            backgroundColor: getStatusLabel(item, cardColor)?.bgColor,
                            borderWidth: 1,
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                          }}
                        >
                          <Text 
                            className="text-xs font-bold"
                            style={{ 
                              fontFamily: fonts.primary,
                              color: getStatusLabel(item, cardColor)?.textColor
                            }}
                          >
                            {getStatusLabel(item, cardColor)?.text}
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text className="text-white font-bold text-md mb-3" style={{ fontFamily: fonts.primary }}>
                      {item.description}
                    </Text>

                    <View className="flex-row justify-between items-center mt-3">
                      <Text className="text-white text-lg font-medium flex-shrink" style={{ fontFamily: fonts.primary }}>
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
