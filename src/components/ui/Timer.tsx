import { useState, useEffect } from 'react';

interface TimerProps {
  timeLeft: number;
  onTimeout: () => void;
  timerRunning: boolean;
}

export default function Timer({ timeLeft, onTimeout, timerRunning }: TimerProps) {
  const [time, setTime] = useState(timeLeft);

  useEffect(() => {
    setTime(timeLeft);
  }, [timeLeft]);

  useEffect(() => {
    if (!timerRunning || time <= 0) {
      return; // Stop updating when timer is stopped or reaches 0
    }
    
    const interval = setInterval(() => {
      setTime((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [time, onTimeout, timerRunning]);

  return (
    <span className="rounded bg-white px-2 py-1 text-lg font-bold text-[hsl(24,9.8%,10%)]">
    {time}s
    </span>
  );
}


