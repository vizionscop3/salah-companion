/**
 * Prayer Card Component
 *
 * Reusable card component for displaying prayer information
 * with Material Neubrutomorphism styling.
 */

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Card} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography, elevation, colors} from '@constants/theme';
import {PrayerName} from '@services/prayer/prayerTimeService';

export interface PrayerCardProps {
  prayerName: string;
  prayerKey: PrayerName;
  time: Date;
  rakAhs: number;
  isNext?: boolean;
  isPassed?: boolean;
  onPress?: () => void;
}

const PRAYER_ICONS: Record<PrayerName, string> = {
  fajr: '🌅',
  dhuhr: '☀️',
  asr: '⛅',
  maghrib: '🌇',
  isha: '🌙',
};

export const PrayerCard: React.FC<PrayerCardProps> = ({
  prayerName,
  prayerKey,
  time,
  rakAhs,
  isNext = false,
  isPassed = false,
  onPress,
}) => {
  const {currentTheme} = useTheme();

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const cardStyle = [
    styles.card,
    isNext && styles.nextCard,
    isPassed && styles.passedCard,
    elevation[isNext ? 4 : 2],
  ];

  const content = (
    <Card style={cardStyle}>
      <Card.Content style={styles.content}>
        <View style={styles.prayerRow}>
          <View style={styles.prayerInfo}>
            <View style={styles.prayerHeader}>
              <Text style={styles.prayerIcon}>{PRAYER_ICONS[prayerKey]}</Text>
              <View style={styles.prayerNameContainer}>
                <Text
                  style={[
                    styles.prayerName,
                    {color: currentTheme.colors.text},
                    isNext && styles.nextPrayerName,
                  ]}>
                  {prayerName}
                </Text>
                <Text
                  style={[
                    styles.rakAhs,
                    {color: currentTheme.colors.text},
                    isPassed && styles.passedText,
                  ]}>
                  {rakAhs} Rak'ahs
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.timeContainer}>
            <Text
              style={[
                styles.time,
                {color: isNext ? currentTheme.colors.primary : currentTheme.colors.text},
                isPassed && styles.passedTime,
              ]}>
              {formatTime(time)}
            </Text>
            {isNext && (
              <View style={styles.nextBadge}>
                <Text style={styles.nextBadgeText}>Next</Text>
              </View>
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface.main,
  },
  nextCard: {
    backgroundColor: colors.primary.light + '15', // 15% opacity
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  passedCard: {
    opacity: 0.6,
  },
  content: {
    padding: spacing.md,
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prayerInfo: {
    flex: 1,
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerIcon: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  prayerNameContainer: {
    flex: 1,
  },
  prayerName: {
    ...typography.h5,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  nextPrayerName: {
    color: colors.primary.dark,
  },
  rakAhs: {
    ...typography.body2,
    opacity: 0.7,
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  time: {
    ...typography.h4,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  passedTime: {
    opacity: 0.5,
  },
  passedText: {
    opacity: 0.5,
  },
  nextBadge: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    marginTop: spacing.xs,
  },
  nextBadgeText: {
    ...typography.caption,
    color: colors.primary.contrastText,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

