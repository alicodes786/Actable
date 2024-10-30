import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Platform, View, Text, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IdeadlineList } from '@/lib/interfaces';
import { getDeadlines } from '@/db/deadlines';
import CountDownTimer from '../CountDownTimer';

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
    const blueGradient = ['#66b3ff', '#007FFF', '#0066cc'];
    const blackGradient = ['#333333', '#111111', '#000000'];
  return (
    <View style={styles.container}>
     <Text style={styles.headerText}>Welcome, Hassan</Text>
    <View style={styles.content}>
      <View style={styles.upcomingDeadlines}>
        <Text style={styles.title}>Upcoming Deadlines</Text>
        <ScrollView>
          {deadlines && deadlines.deadlineList.map((item, idx) => (
            <LinearGradient
              key={idx}
              colors={idx % 2 === 0 ? blueGradient : blackGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.deadlinesCard}
            >
              <Text style={styles.taskText}>
                {item.description}
              </Text>
              <Text style={styles.taskText}>
                <CountDownTimer deadlineDate={item.date} />
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
    paddingTop: Platform.OS === 'ios' ? windowHeight * 0.03 : windowHeight * 0.02,
  },
  upcomingDeadlines: {
    width: '100%',
    marginBottom: 20,
  },
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
    fontSize: 17,
    fontWeight: '500',
  },
  title: {
    fontSize: Math.min(windowWidth * 0.06, 24), 
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
    fontSize: 18,
    fontWeight: '600',
  },
  headerText: {
    // position:'absolute',
    fontSize: 20,
    fontWeight: '500',
    marginLeft:12,
    top:-5
    
  },
});