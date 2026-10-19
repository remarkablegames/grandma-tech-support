import { useEffect, useState } from 'react';

const TICK_MS = 1000;

export function formatTime(date: Date): string {
  // Modern ICU puts a narrow no-break space before AM/PM — show a plain one.
  return date
    .toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    .replace(/[\u00A0\u202F]/g, ' ');
}

export function useCurrentTime(): string {
  const [time, setTime] = useState(() => formatTime(new Date()));

  useEffect(() => {
    const ticker = setInterval(() => {
      setTime(formatTime(new Date()));
    }, TICK_MS);

    return () => {
      clearInterval(ticker);
    };
  }, []);

  return time;
}
