import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { fetchDeadlineStats } from '@/db/deadlinesTracker';
import { LineChart } from 'react-native-chart-kit';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function TrackerScreen() {
    const [metDeadlinesCount, setMetDeadlinesCount] = useState(0);
    const [missedDeadlinesCount, setMissedDeadlinesCount] = useState(0);
  
    useEffect(() => {
      const getDeadlineStats = async () => {
        const { metCount, missedCount } = await fetchDeadlineStats();
        setMetDeadlinesCount(metCount);
        setMissedDeadlinesCount(missedCount);
      };
  
      getDeadlineStats();
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
          <LineChart
        data={{
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              data: [20, 45, 28, 80, 99, 43],
            },
          ],
        }}
        width={Dimensions.get('window').width - 32} // Width of the chart
        height={220} // Height of the chart
        yAxisLabel="$"
        yAxisSuffix="k"
        chartConfig={{
          backgroundColor: '#1cc910',
          backgroundGradientFrom: '#eff3ff',
          backgroundGradientTo: '#efefef',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#ffa726',
          },
        }}
        bezier // Optional: Smooths out the line
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
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
    alignItems:'center',
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
    flex:1,
    flexDirection:'row',
    position: 'absolute', // Make the element positioned absolutely within its parent
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center', 
    justifyContent: 'center',
    maxWidth: '100%', 
    marginLeft:35,
    marginTop:10,
  },
  moreDeadlineData: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems:'center',
    position: 'absolute',
    bottom: 0,
    width: '100%', 
    alignSelf: 'center',
    paddingBottom: 20,  
  }
});