import React from 'react';
import { LineChart } from 'react-native-chart-kit';
import { View, Text } from 'react-native';

type ChartData = {
  labels: string[];
  datasets: {
    data: number[];
  }[];
};

type ChartProps = {
  data: ChartData;
  width: number;
  height: number;
};

const ChartComponent: React.FC<ChartProps> = ({ data, width, height }) => {
  return (
    <View>
      <LineChart
        data={data}
        width={width}
        height={height}
        chartConfig={{
          backgroundColor: '#000',
          backgroundGradientFrom: '#000',
          backgroundGradientTo: '#000',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
      />
    </View>
  );
};

export default ChartComponent;
