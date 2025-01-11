import { useState, useEffect } from 'react';

interface TimerProps {
  timeLeft: number;
  onTimeout: () => void;
}

export default function Timer({ timeLeft, onTimeout }: TimerProps) {
  const [time, setTime] = useState(timeLeft);

  useEffect(() => {
    setTime(timeLeft);
  }, [timeLeft]);

  useEffect(() => {
    if (time <= 0) {
      onTimeout();
      return;
    }
    const interval = setInterval(() => {
      setTime((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [time, onTimeout]);

  return (
    <div className="timer text-center text-lg font-bold text-red-500">
      Time Left: {time} seconds
    </div>
  );
}
