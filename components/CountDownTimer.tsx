import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type CountdownTimerProps = {
  deadlineDate: Date;
  textColour?: string;
};

export default function CountDownTimer({ deadlineDate, textColour }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(timeRemaining(deadlineDate));

  const styles = StyleSheet.create({
    taskText: {
      color: textColour ? textColour : 'white',
      fontSize: 25,
      fontWeight: '500',
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(timeRemaining(deadlineDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [deadlineDate]);

  function timeRemaining(deadline: Date): TimeLeft {
    const total = new Date(deadline).getTime() - new Date().getTime();
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / (1000 * 60)) % 60);
    const seconds = Math.floor((total / 1000) % 60);
    return { days, hours, minutes, seconds };
  }

  // Conditionally render the time parts
  const timeParts: string[] = [];
  if (timeLeft.days > 0) timeParts.push(`${timeLeft.days}d`);
  if (timeLeft.hours > 0 || timeLeft.days > 0) timeParts.push(`${timeLeft.hours}h`);
  if (timeLeft.minutes > 0 || timeLeft.hours > 0 || timeLeft.days > 0) timeParts.push(`${timeLeft.minutes}m`);
  if (timeLeft.seconds >= 0) timeParts.push(`${timeLeft.seconds}s`);

  return (
    <View>
      <Text style={styles.taskText}>
        {timeParts.join(' ')}
      </Text>
    </View>
  );
}
