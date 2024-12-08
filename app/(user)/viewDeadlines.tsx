import React, { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getDeadlines } from '@/db/deadlines';
import { useAuth } from '@/providers/AuthProvider';
import { Ideadline } from '@/lib/interfaces';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import CountDownTimer from '@/components/CountDownTimer';
import { getAssignedMod } from '@/db/mod';
import { fromUTC, formatLocalDate } from '@/lib/dateUtils';

// Define categories and their colors
const CATEGORIES = {
  UPCOMING: {
    label: 'Upcoming',
    colors: ['#66b3ff', '#007FFF', '#0066cc'],
  },
  PENDING: {
    label: 'Pending',
    colors: ['#F59E0B', '#D97706', '#B45309'],
  },
  INVALID: {
    label: 'Invalid',
    colors: ['#808080', '#6B7280', '#4B5563'],
  },
  COMPLETED: {
    label: 'Completed',
    colors: ['#10B981', '#059669', '#047857'],
  },
  MISSED: {
    label: 'Missed',
    colors: ['#EF4444', '#DC2626', '#B91C1C'],
  },
  LATE: {
    label: 'Late',
    colors: ['#F97316', '#EA580C', '#C2410C'],
  },
};

const convertUTCToLocal = (dateString: string) => {
  const date = new Date(dateString);
  // No conversion needed since the date is already in the correct timezone
  return date;
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

export default function ViewDeadlinesScreen() {
  const [deadlines, setDeadlines] = useState<Ideadline[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('UPCOMING');
  const [hasMod, setHasMod] = useState<boolean | null>(null);
  const { user } = useAuth();

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (user) {
          // Fetch deadlines
          const result = await getDeadlines(String(user.id));
          if (result?.deadlineList) {
            setDeadlines(result.deadlineList);
          }

          // Check if user has an assigned mod
          const assignedMod = await getAssignedMod(String(user.id));
          setHasMod(assignedMod !== null);
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

  const filterDeadlines = () => {
    if (!deadlines) return [];
    
    const now = new Date();
    let filteredDeadlines: Ideadline[] = [];
    
    switch (selectedCategory) {
      case 'UPCOMING':
        filteredDeadlines = deadlines.filter(deadline => {
          const deadlineTime = new Date(deadline.date);
          return deadlineTime > now && !deadline.completed;
        });
        break;
      
      case 'PENDING':
        if (!hasMod) return [];
        filteredDeadlines = deadlines.filter(deadline => 
          deadline.submissions?.some(sub => 
            sub.id === deadline.lastsubmissionid && sub.status === 'pending'
          )
        );
        break;
      
      case 'INVALID':
        if (!hasMod) return [];
        filteredDeadlines = deadlines.filter(deadline => 
          deadline.submissions?.some(sub => 
            sub.id === deadline.lastsubmissionid && sub.status === 'invalid'
          )
        );
        break;
      
      case 'COMPLETED':
        filteredDeadlines = deadlines.filter(deadline => deadline.completed);
        break;
      
      case 'MISSED':
        filteredDeadlines = deadlines.filter(deadline => {
          const deadlineTime = new Date(deadline.date);
          return deadlineTime < now && !deadline.submissions?.length;
        });
        break;
      
      case 'LATE':
        filteredDeadlines = deadlines.filter(deadline => {
          const deadlineTime = new Date(deadline.date);
          return deadlineTime < now && deadline.submissions?.length && !deadline.completed;
        });
        break;
      
      default:
        return [];
    }

    // Sort deadlines by date
    return filteredDeadlines.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      
      // For upcoming deadlines, sort by closest first
      if (selectedCategory === 'UPCOMING') {
        return dateA - dateB;
      }
      // For all other categories, sort by most recent first
      return dateB - dateA;
    });
  };

  const getCategoryCounts = useCallback(() => {
    if (!deadlines) return {};
    
    const now = Date.now();
    const counts = {
      UPCOMING: 0,
      PENDING: 0,
      INVALID: 0,
      COMPLETED: 0,
      MISSED: 0,
      LATE: 0
    };
    
    deadlines.forEach(deadline => {
      const localDeadlineTime = convertUTCToLocal(deadline.date).getTime();
      
      if (deadline.completed) {
        counts.COMPLETED++;
      } else if (hasMod && deadline.submissions?.some(sub => 
        sub.id === deadline.lastsubmissionid && sub.status === 'pending'
      )) {
        counts.PENDING++;
      } else if (hasMod && deadline.submissions?.some(sub => 
        sub.id === deadline.lastsubmissionid && sub.status === 'invalid'
      )) {
        counts.INVALID++;
      } else if (localDeadlineTime > now) {
        counts.UPCOMING++;
      } else if (!deadline.submissions?.length) {
        counts.MISSED++;
      } else {
        counts.LATE++;
      }
    });
    
    return counts;
  }, [deadlines, hasMod]);

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-5">Your Deadlines</Text>
      
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
              style={selectedCategory === key ? { backgroundColor: value.colors[1] } : undefined}
            >
              <Text 
                className={`text-sm font-medium ${
                  selectedCategory === key 
                    ? 'text-white'
                    : 'text-gray-600'
                }`}
              >
                {value.label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView className="flex-1">
        {filterDeadlines().map((deadline) => {
          const colors = CATEGORIES[selectedCategory as keyof typeof CATEGORIES].colors as [string, string, string];
          const showActions = !['COMPLETED', 'LATE', 'MISSED'].includes(selectedCategory);
          
          return(
            <View key={deadline.id} className="mb-4">
              <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-xl p-4 shadow-md"
              >
                <View className="flex-1">
                  <Text className="text-lg font-bold text-white mb-2">
                    {deadline.name}
                  </Text>
                  <Text className="text-sm text-white mb-2">
                    {deadline.description}
                  </Text>
                  
                  {selectedCategory === 'MISSED' ? (
                    <View>
                      <View className="flex-row justify-end items-center mt-2">
                        <View>
                          <Text className="text-white text-xs uppercase mb-1 opacity-80">
                            Due Date
                          </Text>
                          <Text className="text-white text-sm font-medium">
                            {formatDate(deadline.date)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : ['COMPLETED', 'LATE'].includes(selectedCategory) ? (
                    <View>
                      <View className="flex-row justify-between items-center mt-2">
                        <View>
                          <Text className="text-white text-xs uppercase mb-1 opacity-80">
                            Submitted
                          </Text>
                          <Text className="text-white text-sm font-medium">
                            {formatDate(deadline.submissions?.find(
                              sub => sub.id === deadline.lastsubmissionid
                            )?.submitteddate || '')}
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
                    </View>
                  ) : (
                    <Text className="text-white text-base font-medium">
                      {new Date(deadline.date).getTime() >= Date.now() ?
                        <CountDownTimer deadlineDate={new Date(deadline.date)} />
                        :
                        "Deadline Passed"
                      }
                    </Text>
                  )}
                </View>

                {showActions && (
                  <View className="flex-row items-center justify-end mt-2.5">
                    {selectedCategory === 'UPCOMING' && (
                      <TouchableOpacity
                        className="flex-1 flex-row gap-2.5"
                        onPress={() => handleEdit(deadline)}
                      >
                        <Ionicons name="create" size={24} color="#fff" />
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity 
                      className="bg-white px-2 py-2 rounded-lg"
                      onPress={() => handleSubmission(deadline)}
                    >
                      <Text>
                        {selectedCategory === 'UPCOMING' ? 'Submit' : 'Resubmit'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </LinearGradient>
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
  );
}