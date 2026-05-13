import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';

interface TimerProps {
  durationSec: number;
  onExpire: () => void;
  isRunning: boolean;
}

const WARNING_THRESHOLD_SEC = 300;
const TICK_INTERVAL_MS = 1000;

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Timer({ durationSec, onExpire, isRunning }: TimerProps) {
  const [remaining, setRemaining] = useState(durationSec);
  const [paused, setPaused] = useState(false);

  const remainingRef = useRef(durationSec);
  const onExpireRef = useRef(onExpire);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  onExpireRef.current = onExpire;

  useEffect(() => {
    setRemaining(durationSec);
    remainingRef.current = durationSec;
  }, [durationSec]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        setPaused(false);
      } else {
        setPaused(true);
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isRunning || paused) return;

    intervalRef.current = setInterval(() => {
      remainingRef.current -= 1;

      if (remainingRef.current <= 0) {
        remainingRef.current = 0;
        setRemaining(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        onExpireRef.current();
        return;
      }

      setRemaining(remainingRef.current);
    }, TICK_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, paused]);

  const isWarning = remaining > 0 && remaining < WARNING_THRESHOLD_SEC;

  return (
    <View style={styles.container}>
      <Text style={[styles.timerText, isWarning && styles.warningText]}>
        {isRunning && paused ? 'Paused' : formatTime(remaining)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    fontVariant: ['tabular-nums'],
  },
  warningText: {
    color: '#E53935',
  },
});
