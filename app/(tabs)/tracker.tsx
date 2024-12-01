import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { fetchDeadlineStats } from '@/db/deadlinesTracker';
import { getLast30DaysDeadlines } from '@/db/deadlines';
import { Ideadline } from '@/lib/interfaces';
import { useAuth } from '@/providers/AuthProvider';
import ChartComponent from '@/components/ChartComponent'; // Ensure this is the correct path for ChartComponent

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function TrackerScreen() {
  const [metDeadlinesCount, setMetDeadlinesCount] = useState(0);
  const [missedDeadlinesCount, setMissedDeadlinesCount] = useState(0);
  const [last30DaysDeadlines, setLast30DaysDeadlines] = useState<Ideadline[] | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch deadline stats
        const { metCount, missedCount } = await fetchDeadlineStats();
        setMetDeadlinesCount(metCount);
        setMissedDeadlinesCount(missedCount);

        // Fetch last 30 days' deadlines
        const deadlines = await getLast30DaysDeadlines(String(user));
        setLast30DaysDeadlines(deadlines || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const blueGradient: [string, string, ...string[]] = ['#66b3ff', '#007FFF', '#0066cc'];
  const blackGradient: [string, string, ...string[]] = ['#333333', '#111111', '#000000'];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Tracker</Text>
        <View style={styles.deadlineData}>
          <LinearGradient
            colors={blueGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.deadlinesCardGradient}
          >
            <View style={styles.topLeftContainer}>
              <Text style={styles.text}>Deadlines Met</Text>
            </View>
            <View style={styles.numberContainer}>
              <Text style={styles.number}>{metDeadlinesCount}</Text>
            </View>
          </LinearGradient>
          <LinearGradient
            colors={blueGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.deadlinesCardGradient}
          >
            <View style={styles.topLeftContainer}>
              <Text style={styles.text}>Missed</Text>
            </View>
            <View style={styles.numberContainer}>
              <Text style={styles.number}>{missedDeadlinesCount}</Text>
            </View>
          </LinearGradient>
        </View>
        <View style={styles.graphicalData}>
          <ChartComponent
            data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [
                {
                  data: [20, 45, 28, 80, 99, 43],
                },
              ],
            }}
            width={windowWidth - 32}
            height={220}
          />
        </View>
        <View style={styles.moreDeadlineData}>
          <LinearGradient
            colors={blueGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.deadlinesCardGradient}
          >
            <View style={styles.topLeftContainer}>
              <Text style={styles.text}>Late</Text>
            </View>
            <View style={styles.numberContainer}>
              <Text style={styles.number}>{metDeadlinesCount}</Text>
            </View>
          </LinearGradient>
          <LinearGradient
            colors={blueGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.deadlinesCardGradient}
          >
            <View style={styles.topLeftContainer}>
              <Text style={styles.text}>Best</Text>
            </View>
            <View style={styles.numberContainer}>
              <Text style={styles.number}>{missedDeadlinesCount}</Text>
            </View>
          </LinearGradient>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: windowWidth * 0.05,
    paddingTop: 10,
  },
  deadlineData: {
    flexDirection: 'row',
    maxHeight: '25%',
    justifyContent: 'space-around',
    alignItems: 'center',
    maxWidth: '100%',
  },
  deadlinesCardGradient: {
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
    width: '45%',
    maxWidth: 400,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topLeftContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    alignSelf: 'flex-start',
  },
  text: {
    color: 'white',
    fontSize: 20,
    fontWeight: '500',
  },
  numberContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    marginTop: 20,
  },
  number: {
    color: 'white',
    fontSize: 40,
    marginTop: 40,
  },
  graphicalData: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '100%',
    marginTop: 10,
  },
  moreDeadlineData: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 20,
  },
});
