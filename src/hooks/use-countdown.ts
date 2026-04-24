import { useEffect, useRef, useState, useCallback } from "react";

interface UseCountdownResult {
  remainingMs: number;
  progress: number; // 1 = full, 0 = empty
  isRunning: boolean;
  start: (durationMs: number) => void;
  reset: () => void;
  pause: () => void;
}

export function useCountdown(onExpire: () => void): UseCountdownResult {
  const [remainingMs, setRemainingMs] = useState(0);
  const [totalMs, setTotalMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const initialDurationRef = useRef<number>(0);
  const onExpireRef = useRef(onExpire);
  const expiredRef = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const start = useCallback((durationMs: number) => {
    if (intervalRef.current !== null) clearInterval(intervalRef.current);
    expiredRef.current = false;
    initialDurationRef.current = durationMs;
    startTimeRef.current = Date.now();
    setTotalMs(durationMs);
    setRemainingMs(durationMs);
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, initialDurationRef.current - elapsed);
      setRemainingMs(remaining);

      if (remaining <= 0) {
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsRunning(false);
        if (!expiredRef.current) {
          expiredRef.current = true;
          onExpireRef.current();
        }
      }
    }, 50); // 20fps updates — smooth enough for countdown ring, works in background tabs
  }, []);

  const reset = useCallback(() => {
    stop();
    setRemainingMs(0);
    setTotalMs(0);
    expiredRef.current = false;
  }, [stop]);

  const pause = useCallback(() => {
    stop();
  }, [stop]);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, []);

  const progress = totalMs > 0 ? remainingMs / totalMs : 0;

  return { remainingMs, progress, isRunning, start, reset, pause };
}
