import { useEffect, useState } from 'react';

/** Tiempo que falta hasta `date`, actualizado cada segundo. */
export function useCountdown(date: string) {
  const target = new Date(date).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const left = Math.max(0, Math.floor((target - now) / 1000));
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    days: pad(Math.floor(left / 86_400)),
    hours: pad(Math.floor((left % 86_400) / 3600)),
    minutes: pad(Math.floor((left % 3600) / 60)),
    seconds: pad(left % 60),
  };
}
