import React from 'react';
import { Dimensions, StyleSheet, View, Text } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

interface ChartProps {
  labels: string[];
  data: number[];
}

const ChartComponent: React.FC<ChartProps> = ({ labels, data }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deadlines in Last 30 Days</Text>
      <BarChart
        data={{
          labels,
          datasets: [{ data }],
        }}
        width={Dimensions.get('window').width - 32}
        height={220}
        chartConfig={{
          backgroundGradientFrom: '#eff3ff',
          backgroundGradientTo: '#efefef',
          color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          barPercentage: 0.5,
        }}
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  chart: {
    borderRadius: 16,
  },
});

export default ChartComponent;
