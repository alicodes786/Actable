import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Dimensions, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart } from 'react-native-chart-kit';
import { getLast30DaysDeadlines } from '@/db/deadlines'; // Ensure this import matches your project structure
import { Ideadline } from '@/lib/interfaces';
import { useAuth } from '@/providers/AuthProvider';

// Get window dimensions
const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

// Reusable Deadline Card component
const DeadlineCard = ({ title, count }: { title: string; count: number }) => (
  <LinearGradient
    colors={['#66b3ff', '#007FFF', '#0066cc']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.deadlinesCardGradient}
  >
    <View style={styles.topLeftContainer}>
      <Text style={styles.text}>{title}</Text>
    </View>
    <View style={styles.numberContainer}>
      <Text style={styles.number}>{count}</Text>
    </View>
  </LinearGradient>
);

export default function TrackerScreen() {
  const [metDeadlinesCount, setMetDeadlinesCount] = useState(0);
  const [missedDeadlinesCount, setMissedDeadlinesCount] = useState(0);
  const [lateDeadlinesCount, setLateDeadlinesCount] = useState(0);
  const [bestDeadlinesCount, setBestDeadlinesCount] = useState(0);
  const [last30DaysDeadlines, setLast30DaysDeadlines] = useState<Ideadline[] | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all deadlines for the current user
        const deadlines = await getLast30DaysDeadlines(String(user));
        setLast30DaysDeadlines(deadlines || []);

        // Calculate the counts
        const metCount = deadlines?.filter((d) => d.lastsubmissionid !== null).length || 0;
        const missedCount = deadlines?.filter((d) => d.lastsubmissionid === null).length || 0;
        const lateCount = deadlines?.filter((d) => d.isLate === true).length || 0;
        const bestCount = deadlines?.filter((d) => d.isBest === true).length || 0;

        // Update the state
        setMetDeadlinesCount(metCount);
        setMissedDeadlinesCount(missedCount);
        setLateDeadlinesCount(lateCount);
        setBestDeadlinesCount(bestCount);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [user]);

  // Group deadlines into weeks with more robust calculation
  const groupDeadlinesIntoWeeks = (deadlines: Ideadline[]) => {
    if (!deadlines || deadlines.length === 0) return [];

    const weeks: { [key: string]: number } = {};
    
    // Sort deadlines chronologically
    const sortedDeadlines = [...deadlines].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Find the earliest date to use as a reference point
    const startDate = new Date(sortedDeadlines[0].date);

    sortedDeadlines.forEach((deadline) => {
      const currentDate = new Date(deadline.date);
      const daysDifference = Math.floor(
        (currentDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
      );

      // Group by 7-day intervals
      const currentWeekIndex = Math.floor(daysDifference / 7) + 1;
      const weekLabel = `Week ${currentWeekIndex}`;

      weeks[weekLabel] = (weeks[weekLabel] || 0) + (deadline.lastsubmissionid !== null ? 1 : 0);
    });

    return Object.entries(weeks).map(([week, count]) => ({ week, count }));
  };

  // Weekly data for the chart with responsive label generation
  const weeklyData = groupDeadlinesIntoWeeks(last30DaysDeadlines || []);
  const chartData = {
    labels: weeklyData.map((data) => data.week),
    datasets: [
      {
        data: weeklyData.map((data) => data.count),
        color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  // Improved chart configuration
  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#e3f2fd',
    backgroundGradientTo: '#90caf9',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { 
      borderRadius: 16 
    },
    barPercentage: 0.6,  // Increased bar width
    propsForLabels: {
      fontSize: 10,  // Smaller font size
      fontWeight: 'bold',
    },
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: '#e3e3e3',
    },
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Tracker</Text>

        {/* Deadlines Stats */}
        <View style={styles.deadlineData}>
          <DeadlineCard title="Deadlines Met" count={metDeadlinesCount} />
          <DeadlineCard title="Missed" count={missedDeadlinesCount} />
        </View>

        {/* Bar Chart for Weekly Deadlines */}
        <View style={styles.graphicalData}>
          <BarChart
            data={chartData}
            width={windowWidth - 40}  // Slightly reduced width
            height={275}  // Increased height to accommodate labels
            yAxisLabel=""
            chartConfig={chartConfig}
            fromZero
            showValuesOnTopOfBars
            verticalLabelRotation={45}
            horizontalLabelRotation={45}
            style={{
              marginVertical: 10,
              marginHorizontal: 20,
              borderRadius: 16,
            }}
          />
        </View>

        {/* Additional Deadline Data */}
        <View style={styles.moreDeadlineData}>
          <DeadlineCard title="Late" count={lateDeadlinesCount} />
          <DeadlineCard title="Best" count={bestDeadlinesCount} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollViewContent: {
    padding: 16,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  deadlineData: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  deadlinesCardGradient: {
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
  },
  text: {
    color: 'white',
    fontSize: 18,
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
    fontSize: 36,
    fontWeight: '700',
  },
  graphicalData: {
    alignItems: 'center',
    marginVertical: 10,
  },
  moreDeadlineData: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});