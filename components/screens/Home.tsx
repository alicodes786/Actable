import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Platform, View, Text, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IdeadlineList } from '@/lib/interfaces';
import { getDeadlines } from '@/db/deadlines';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function Home() {
    const [deadlines, setDeadlines] = useState<IdeadlineList | null >(null);

    useEffect(() => {
      const fetchDeadlines = async () => {
        const fetchedDeadlines: IdeadlineList | null = await getDeadlines();
        console.log(fetchedDeadlines);
        setDeadlines(fetchedDeadlines);
      };
      fetchDeadlines();
    }, []);
  return (
    <View style={styles.container}>
    <View style={styles.content}>
      <View style={styles.upcomingDeadlines}>
        <Text style={styles.title}>Upcoming Deadlines</Text>
        <ScrollView style={styles.scrollView}>
          {deadlines && deadlines.deadlineList.map((item, idx) => (
            <LinearGradient
              key={idx}
              colors={[
                '#66b3ff',
                '#007FFF',
                '#0066cc'
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.deadlinesCard}
            >
              <Text style={styles.taskText}>
                {item.description}
              </Text>
              <Text style={styles.taskText}>
                {item.date}
              </Text>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={() => {
                  console.log('Submit pressed for item:', item);
                }}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </LinearGradient>
          ))}
        </ScrollView>
      </View>
    </View>
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  content: {
    flex: 1,
    paddingHorizontal: windowWidth * 0.05, 
    paddingTop: Platform.OS === 'ios' ? windowHeight * 0.05 : windowHeight * 0.02,
  },
  upcomingDeadlines: {
    width: '100%',
    marginBottom: 20,
  },
//   scrollView: {
//     flex: 1, 
//   },
  deadlinesCard: {
    marginTop: 15,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '100%', 
    maxWidth: 400,
  },
  taskText: {
    color: 'white',
    marginVertical: windowHeight * 0.01, 
    fontSize: 20,
    fontWeight: '500',
  },
  title: {
    fontSize: Math.min(windowWidth * 0.05, 24), 
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'flex-start', 
    minWidth: 100, 
    alignItems: 'center', 
  },
  submitButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  }
});