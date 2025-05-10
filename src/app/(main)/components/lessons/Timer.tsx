import { useEffect, useRef, useState } from "react";

interface TimerProps {
  timeLeft: number;
  onTimeout: () => void;
  timerRunning: boolean;
}

export default function Timer({ timeLeft, onTimeout, timerRunning }: TimerProps) {
  const [time, setTime] = useState(timeLeft);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasTimedOut = useRef(false);

  // Reset on props change
  useEffect(() => {
    setTime(timeLeft);
    hasTimedOut.current = false;
    clearInterval(intervalRef.current!);

    if (timerRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTime(prev => {
          if (prev <= 1 && !hasTimedOut.current) {
            hasTimedOut.current = true;
            clearInterval(intervalRef.current!);
            onTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(intervalRef.current!);
  }, [timeLeft, timerRunning, onTimeout]);

  return (
    <span className="rounded bg-white px-2 py-1 text-lg font-bold text-[hsl(24,9.8%,10%)]">
      {time}s
    </span>
  );
}
