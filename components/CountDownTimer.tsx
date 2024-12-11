import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import { fromUTC, isExpired } from '@/lib/dateUtils';
import { useAuth } from '@/providers/AuthProvider';

interface CountDownTimerProps {
  deadlineDate: Date;
  textColour: string;
}

const CountDownTimer: React.FC<CountDownTimerProps> = ({ deadlineDate }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const { userTimezone } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const localDeadline = fromUTC(deadlineDate.toISOString(), userTimezone);
      const distance = localDeadline.getTime() - now.getTime();

      if (isExpired(deadlineDate.toISOString(), userTimezone)) {
        setTimeLeft('EXPIRED');
        clearInterval(timer);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [deadlineDate, userTimezone]);

  return <Text>{timeLeft}</Text>;
};

export default CountDownTimer;
