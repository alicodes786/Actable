import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';

interface CountDownTimerProps {
  deadlineDate: Date;
}

const CountDownTimer: React.FC<CountDownTimerProps> = ({ deadlineDate }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const deadline = new Date(deadlineDate);
      const distance = deadline.getTime() - now.getTime();

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (distance < 0) {
        setTimeLeft('EXPIRED');
        clearInterval(timer);
      } else {
        setTimeLeft(
          `${days}d ${hours}h ${minutes}m ${seconds}s`
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadlineDate]);

  return <Text>{timeLeft}</Text>;
};

export default CountDownTimer;
