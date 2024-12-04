import React, { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
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
    <View style={styles.container}>
      <Text style={styles.title}>Upcoming Deadlines</Text>
      
      <ScrollView style={styles.scrollView}>
        {getUpcomingDeadlines().map((deadline) => {
          const deadlinePassed = new Date(deadline.date).getTime() >= Date.now();
          
          return (
            <View key={deadline.id}>
              <LinearGradient
                colors={deadlinePassed ? blueGradient : redGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.deadlineCard}
              >
                <View style={styles.deadlineContent}>
                  <Text style={styles.deadlineName}>{deadline.name}</Text>
                  <Text style={styles.deadlineDescription}>{deadline.description}</Text>
                  <Text style={styles.deadlineDate}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  deadlineCard: {
    marginBottom: 16,
    borderRadius: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deadlineContent: {
    flex: 1,
  },
  deadlineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  deadlineDescription: {
    fontSize: 14,
    color: 'white',
    marginBottom: 8,
  },
  deadlineDate: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
}); 