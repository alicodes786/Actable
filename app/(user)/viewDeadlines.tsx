import React, { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getDeadlines } from '@/db/deadlines';
import { useAuth } from '@/providers/AuthProvider';
import { Ideadline } from '@/lib/interfaces';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import CountDownTimer from '@/components/CountDownTimer';
import { getAssignedMod } from '@/db/mod';
import { fromUTC, formatLocalDate } from '@/lib/dateUtils';
import Header from '@/components/Header';
import { colors, fonts } from '@/styles/theme';

// Define categories and their colors
const CATEGORIES = {
  UPCOMING: {
    label: 'Upcoming',
    color: colors.upcoming,
  },
  PENDING: {
    label: 'Pending',
    color: colors.pending,
  },
  LATE: {
    label: 'Late',
    color: colors.late,
  },
  ON_TIME: {
    label: 'On Time',
    color: colors.completed,
  },
  MISSED: {
    label: 'Missed',
    color: colors.missed,
  },
  INVALID: {
    label: 'Invalid',
    color: colors.invalid,
  },
};

const convertUTCToLocal = (dateString: string) => {
  return fromUTC(dateString);
};

const formatDate = (dateString: string) => {
  const localDate = convertUTCToLocal(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - localDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // If less than 24 hours ago, show relative time
  if (diffDays === 0) {
    const hours = Math.floor(diffTime / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diffTime / (1000 * 60));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  
  // If within 7 days, show day of week
  if (diffDays < 7) {
    return localDate.toLocaleDateString('en-US', { weekday: 'long' }) + 
           ' at ' + 
           localDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  
  // Otherwise show date
  return localDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const getLateDuration = (submittedDate: Date, deadlineDate: Date) => {
  const diffTime = submittedDate.getTime() - deadlineDate.getTime();
  const diffSeconds = Math.floor(diffTime / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} late`;
  }
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} late`;
  }
  if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} late`;
  }
  return `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''} late`;
};

export default function ViewDeadlinesScreen() {
  const [deadlines, setDeadlines] = useState<Ideadline[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('UPCOMING');
  const [hasMod, setHasMod] = useState<boolean | null>(null);
  const { user, userTimezone } = useAuth();

  useFocusEffect(
    useCallback(() => {
      if (!user) return;

      const fetchData = async () => {
        try {
          // Fetch deadlines
          const result = await getDeadlines(String(user.id));
          if (result?.deadlineList) {
            setDeadlines(result.deadlineList);
          }

          // Check if user has an assigned mod
          const assignedMod = await getAssignedMod(String(user.id));
          setHasMod(assignedMod !== null);
        } catch (error) {
          console.error('Error fetching deadlines:', error);
        }
      };

      fetchData();
    }, [user])
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

  const handleEdit = (item: any) => {
    router.push({
        pathname: "/editDeadline",
        params: {
            deadlineId: item.id
        }
    });
  };

  const getDeadlineCategory = (deadline: Ideadline): keyof typeof CATEGORIES | null => {
    const now = new Date();
    const submission = deadline.submissions?.[0];
    const localDeadlineTime = convertUTCToLocal(deadline.date);

    // Check categories in order of priority
    if (hasMod && deadline.submissions?.some(sub => 
      sub.id === deadline.lastsubmissionid && sub.status === 'pending'
    )) {
      return 'PENDING';
    }
    
    if (hasMod && deadline.submissions?.some(sub => 
      sub.id === deadline.lastsubmissionid && sub.status === 'invalid'
    )) {
      return 'INVALID';
    }

    if (submission) {
      const submittedDate = convertUTCToLocal(submission.submitteddate);
      const deadlineDate = convertUTCToLocal(deadline.date);
      
      if (submittedDate.getTime() > deadlineDate.getTime()) {
        return 'LATE';
      }
      if (deadline.completed) {
        return 'ON_TIME';
      }
    }

    if (localDeadlineTime < now && !deadline.submissions?.length) {
      return 'MISSED';
    }

    if (localDeadlineTime > now && !deadline.completed) {
      return 'UPCOMING';
    }

    return null;
  };

  const filterDeadlines = () => {
    if (!deadlines) return [];
    
    const filteredDeadlines = deadlines.filter(deadline => 
      getDeadlineCategory(deadline) === selectedCategory
    );

    // Sort deadlines by date
    return filteredDeadlines.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      
      return selectedCategory === 'UPCOMING' ? dateA - dateB : dateB - dateA;
    });
  };

  const getCategoryCounts = useCallback(() => {
    if (!deadlines) return {};
    
    const counts = {
      UPCOMING: 0,
      PENDING: 0,
      LATE: 0,
      ON_TIME: 0,
      MISSED: 0,
      INVALID: 0,
    };

    deadlines.forEach(deadline => {
      const category = getDeadlineCategory(deadline);
      if (category) {
        counts[category]++;
      }
    });
    
    return counts;
  }, [deadlines, hasMod]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header />
      <View className="flex-1 px-4">
        <Text className="text-2xl mt-10 mb-5" style={{ fontFamily: fonts.primary }}>All Deadlines</Text>
        
        {/* Category Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="flex-row mb-4 max-h-10"
        >
          {Object.entries(CATEGORIES).map(([key, value]) => {
            const counts = getCategoryCounts();
            const count = counts[key as keyof typeof counts];
            
            if (count === 0 && key !== 'LATE') return null;
            if (!hasMod && (key === 'PENDING' || key === 'INVALID')) return null;

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

        <ScrollView className="flex-1">
          {filterDeadlines().map((deadline) => {
            const backgroundColor = CATEGORIES[selectedCategory as keyof typeof CATEGORIES].color;
            const showActions = !['ON_TIME', 'LATE', 'MISSED'].includes(selectedCategory);
            
            return(
              <View key={deadline.id} className="mb-5">
                <View
                  className="rounded-3xl p-4 shadow-md"
                  style={{ backgroundColor }}
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-white text-lg mb-1" style={{ fontFamily: fonts.primary }}>
                        {deadline.name}
                      </Text>
                      <Text className="text-white text-md mb-3" style={{ fontFamily: fonts.secondary }}>
                        {deadline.description}
                      </Text>
                      
                      {selectedCategory === 'UPCOMING' ? (
                        <Text className="text-white text-lg font-medium" style={{ fontFamily: fonts.primary }}>
                          <CountDownTimer 
                            deadlineDate={new Date(deadline.date)} 
                            textColour="#FFFFFF" 
                          />
                        </Text>
                      ) : selectedCategory === 'MISSED' ? (
                        <View className="flex-row justify-end items-center">
                          <View>
                            <Text className="text-white text-xs uppercase mb-1 opacity-80">
                              Due Date
                            </Text>
                            <Text className="text-white text-sm font-medium">
                              {formatDate(deadline.date)}
                            </Text>
                          </View>
                        </View>
                      ) : ['ON_TIME', 'LATE'].includes(selectedCategory) ? (
                        <View className="flex-row justify-between items-center">
                          <View>
                            <Text className="text-white text-xs uppercase mb-1 opacity-80">
                              {selectedCategory === 'LATE' ? 'Late by' : 'Submitted'}
                            </Text>
                            <Text className="text-white text-sm font-medium">
                              {selectedCategory === 'LATE' ? 
                                getLateDuration(
                                  convertUTCToLocal(deadline.submissions?.find(
                                    sub => sub.id === deadline.lastsubmissionid
                                  )?.submitteddate || ''),
                                  convertUTCToLocal(deadline.date)
                                ) :
                                formatDate(deadline.submissions?.find(
                                  sub => sub.id === deadline.lastsubmissionid
                                )?.submitteddate || '')
                              }
                            </Text>
                          </View>
                          <View>
                            <Text className="text-white text-xs uppercase mb-1 opacity-80">
                              Due Date
                            </Text>
                            <Text className="text-white text-sm font-medium">
                              {formatDate(deadline.date)}
                            </Text>
                          </View>
                        </View>
                      ) : ['PENDING', 'INVALID'].includes(selectedCategory) && (
                        <View>
                          <Text className="text-white text-lg font-medium" style={{ fontFamily: fonts.primary }}>
                            <CountDownTimer 
                              deadlineDate={new Date(deadline.date)} 
                              textColour="#FFFFFF" 
                            />
                          </Text>
                        </View>
                      )}
                    </View>

                    {['UPCOMING', 'PENDING', 'INVALID'].includes(selectedCategory) && (
                      <TouchableOpacity 
                        className="p-1"
                        onPress={() => handleEdit(deadline)}
                      >
                        <Ionicons name="create-outline" size={20} color="white" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {['UPCOMING', 'PENDING', 'INVALID'].includes(selectedCategory) && (
                    <TouchableOpacity 
                      className="bg-white self-end px-4 py-2 rounded-lg mt-3"
                      onPress={() => handleSubmission(deadline)}
                    >
                      <Text className="text-black font-medium">
                        {selectedCategory === 'UPCOMING' ? 'Submit →' : 'Resubmit →'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
          
          {filterDeadlines().length === 0 && (
            <Text className="text-center text-gray-500 mt-5">
              No deadlines in this category
            </Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}