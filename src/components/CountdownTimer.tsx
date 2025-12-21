/**
 * Countdown Timer Component
 *
 * Displays a countdown timer until the next prayer time
 * with visual progress indicator.
 */

import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {ProgressBar} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography, colors} from '@constants/theme';

export interface CountdownTimerProps {
  targetTime: Date;
  onComplete?: () => void;
  showProgress?: boolean;
}

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetTime,
  onComplete,
  showProgress = true,
}) => {
  const {currentTheme} = useTheme();
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    const calculateTimeRemaining = (): TimeRemaining | null => {
      const now = new Date();
      const diff = targetTime.getTime() - now.getTime();

      if (diff <= 0) {
        if (onComplete) {
          onComplete();
        }
        return null;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      return {hours, minutes, seconds, totalSeconds};
    };

    // Calculate immediately
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
      if (!remaining) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime, onComplete]);

  if (!timeRemaining) {
    return (
      <View style={styles.container}>
        <Text style={[styles.completeText, {color: currentTheme.colors.primary}]}>
          Prayer time has arrived
        </Text>
      </View>
    );
  }

  const formatTime = (value: number): string => {
    return value.toString().padStart(2, '0');
  };

  // Calculate progress (assuming max countdown is 24 hours)
  const maxSeconds = 24 * 60 * 60;
  const progress = showProgress ? 1 - timeRemaining.totalSeconds / maxSeconds : 0;

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <View style={styles.timeUnit}>
          <Text style={[styles.timeValue, {color: currentTheme.colors.primary}]}>
            {formatTime(timeRemaining.hours)}
          </Text>
          <Text style={[styles.timeLabel, {color: currentTheme.colors.text}]}>
            Hours
          </Text>
        </View>
        <Text style={[styles.separator, {color: currentTheme.colors.text}]}>:</Text>
        <View style={styles.timeUnit}>
          <Text style={[styles.timeValue, {color: currentTheme.colors.primary}]}>
            {formatTime(timeRemaining.minutes)}
          </Text>
          <Text style={[styles.timeLabel, {color: currentTheme.colors.text}]}>
            Minutes
          </Text>
        </View>
        <Text style={[styles.separator, {color: currentTheme.colors.text}]}>:</Text>
        <View style={styles.timeUnit}>
          <Text style={[styles.timeValue, {color: currentTheme.colors.primary}]}>
            {formatTime(timeRemaining.seconds)}
          </Text>
          <Text style={[styles.timeLabel, {color: currentTheme.colors.text}]}>
            Seconds
          </Text>
        </View>
      </View>
      {showProgress && (
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={progress}
            color={currentTheme.colors.primary}
            style={styles.progressBar}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: spacing.md,
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  timeUnit: {
    alignItems: 'center',
    minWidth: 60,
  },
  timeValue: {
    ...typography.h3,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  timeLabel: {
    ...typography.caption,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  separator: {
    ...typography.h3,
    fontWeight: '700',
    marginHorizontal: spacing.xs,
    opacity: 0.5,
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  completeText: {
    ...typography.h5,
    textAlign: 'center',
    fontWeight: '600',
  },
});

