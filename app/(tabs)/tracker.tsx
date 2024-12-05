import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart } from 'react-native-chart-kit';
import { getLast30DaysDeadlines } from '@/db/deadlines'; // Ensure this function fetches the correct data
import { Ideadline } from '@/lib/interfaces';
import { useAuth } from '@/providers/AuthProvider';

export default function TrackerScreen() {
  const [metDeadlinesCount, setMetDeadlinesCount] = useState(0);
  const [missedDeadlinesCount, setMissedDeadlinesCount] = useState(0);
  const [lateDeadlinesCount, setLateDeadlinesCount] = useState(0);
  const [bestDeadlinesCount, setBestDeadlinesCount] = useState(0);
  const [last30DaysDeadlines, setLast30DaysDeadlines] = useState<Ideadline[] | null>(null);
  const { user } = useAuth();
  const { width } = useWindowDimensions(); // Dynamically fetch screen width

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all deadlines for the current user
        const deadlines = await getLast30DaysDeadlines(String(user));
        setLast30DaysDeadlines(deadlines || []);

        // Calculate the counts
        const metCount = deadlines?.filter((d) => d.lastsubmissionid !== null).length || 0;
        const missedCount = deadlines?.filter((d) => d.lastsubmissionid === null).length || 0;
        const lateCount = deadlines?.filter((d) => d.isLate === true).length || 0; // Assuming we have a `isLate` field
        const bestCount = deadlines?.filter((d) => d.isBest === true).length || 0; // Assuming we have a `isBest` field

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

  // Group deadlines into weeks
  const groupDeadlinesIntoWeeks = (deadlines: Ideadline[]) => {
    const weeks: { [key: string]: number } = {};
    let weekIndex = 1; // Start with Week 1
    let currentWeek = getWeekNumber(new Date(deadlines[0]?.date || Date.now()));

    deadlines.forEach((deadline) => {
      const weekNumber = getWeekNumber(new Date(deadline.date));
      if (weekNumber !== currentWeek) {
        currentWeek = weekNumber;
        weekIndex++;
      }
      const weekLabel = `Week ${weekIndex}`;
      weeks[weekLabel] = (weeks[weekLabel] || 0) + (deadline.lastsubmissionid !== null ? 1 : 0);
    });

    return Object.entries(weeks).map(([week, count]) => ({ week, count }));
  };

  // Calculate the week number for a given date
  const getWeekNumber = (date: Date): number => {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const dayOfYear = ((date.getTime() - firstDay.getTime()) / 86400000) + 1;
    return Math.ceil(dayOfYear / 7);
  };

  // Weekly data for the chart
  const weeklyData = groupDeadlinesIntoWeeks(last30DaysDeadlines || []);
  const chartData = {
    labels: weeklyData.map((data) => data.week), // Week 1, Week 2, etc.
    datasets: [
      {
        data: weeklyData.map((data) => data.count),
        color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
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
            width={width - 32} // Use dynamic width from window
            height={220}
            fromZero
            yAxisLabel=""
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#e3f2fd',
              backgroundGradientTo: '#90caf9',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
              barPercentage: 0.7,
            }}
            style={{ marginVertical: 10, borderRadius: 16 }}
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
    flexWrap: 'wrap',
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
    maxWidth: 200, // Adjust for smaller screens
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    flexWrap: 'wrap',
  },
});
