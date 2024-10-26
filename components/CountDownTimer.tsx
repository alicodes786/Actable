import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';

type TimeLeft = {
  days: number
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
        color: textColour ? textColour : "white", 
        fontSize: 25,
        fontWeight: '500',
      },
})

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
    const weeksLeft = days > 7 ? days % 7 : days;
    return { days, hours, minutes, seconds };
  }

  return (
    <View>
      <Text style={styles.taskText}>
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </Text>
    </View>
  );
}