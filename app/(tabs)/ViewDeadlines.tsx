import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getDeadlines } from '@/db/deadlines';
import { useAuth } from '@/providers/AuthProvider';
import { Ideadline } from '@/lib/interfaces';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import CountDownTimer from '@/components/CountDownTimer';


export default function ViewDeadlinesScreen() {
  const [deadlines, setDeadlines] = useState<Ideadline[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDeadlines = async () => {
      if (user) {  
        const result = await getDeadlines(String(user)); // Convert number to string for the DB call
        if (result?.deadlineList) {
          setDeadlines(result.deadlineList);
        }
      }
    };

    fetchDeadlines();
  }, [user]);

  const handleSubmission = (item: any) => {
    router.push({
        pathname: "/(tabs)/submission",
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
        pathname: "/(tabs)/editDeadline",
        params: {
            deadlineId: item.id
        }
    });
  };

  const getUpcomingDeadlines = () => {
    if (!deadlines) return [];
    
    return deadlines
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  };

  const blueGradient = ['#66b3ff', '#007FFF', '#0066cc'];
  const redGradient = ['#ff6666', '#ff1a1a', '#cc0000'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Deadlines</Text>
      
      <ScrollView style={styles.scrollView}>
        {
          getUpcomingDeadlines().map((deadline) => {
            const deadlinePassed = new Date(deadline.date).getTime() >= Date.now();
            
            return(
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
                    
                    
                    <Text className="text-white text-base font-medium">
                      {deadlinePassed ?
                        <CountDownTimer deadlineDate={deadline.date} />
                        :
                        "Deadline Passed"
                      }
                    </Text>
                  </View>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.iconButton} 
                        onPress={() => handleEdit(deadline)}
                      >
                        <Ionicons name="create" size={24} color="#fff" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.submitButton}
                      onPress={() => handleSubmission(deadline)}
                    >
                      <Text>Submit</Text>
                    </TouchableOpacity>
                  </View>


                </LinearGradient>
              </View>
            )
          })
        }
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
  submitButton: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#007FFF',
    fontWeight: 'bold',
  },
  iconButton:{
    flex: 1,
    flexDirection: 'row',
    gap: 10
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10
  },
});