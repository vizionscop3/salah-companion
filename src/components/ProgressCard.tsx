/**
 * Progress Card Component
 *
 * Displays user's prayer progress, streaks, and achievements.
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Card, ProgressBar} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography, colors, elevation} from '@constants/theme';

export interface ProgressCardProps {
  prayersCompleted: number;
  totalPrayers: number;
  currentStreak: number;
  longestStreak?: number;
  achievements?: number;
  showDetails?: boolean;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  prayersCompleted,
  totalPrayers,
  currentStreak,
  longestStreak,
  achievements = 0,
  showDetails = true,
}) => {
  const {currentTheme} = useTheme();

  const progress = totalPrayers > 0 ? prayersCompleted / totalPrayers : 0;
  const progressPercentage = Math.round(progress * 100);

  return (
    <Card style={[styles.card, elevation[2]]}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: currentTheme.colors.text}]}>
            Today's Progress
          </Text>
          <Text style={[styles.progressPercentage, {color: currentTheme.colors.primary}]}>
            {progressPercentage}%
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <ProgressBar
            progress={progress}
            color={currentTheme.colors.primary}
            style={styles.progressBar}
          />
          <Text style={[styles.progressText, {color: currentTheme.colors.text}]}>
            {prayersCompleted} of {totalPrayers} prayers completed
          </Text>
        </View>

        {showDetails && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, {color: currentTheme.colors.primary}]}>
                {currentStreak}
              </Text>
              <Text style={[styles.statLabel, {color: currentTheme.colors.text}]}>
                Day Streak
              </Text>
            </View>
            {longestStreak !== undefined && (
              <View style={styles.statItem}>
                <Text style={[styles.statValue, {color: currentTheme.colors.secondary}]}>
                  {longestStreak}
                </Text>
                <Text style={[styles.statLabel, {color: currentTheme.colors.text}]}>
                  Best Streak
                </Text>
              </View>
            )}
            <View style={styles.statItem}>
              <Text style={[styles.statValue, {color: colors.accent.bold}]}>
                {achievements}
              </Text>
              <Text style={[styles.statLabel, {color: currentTheme.colors.text}]}>
                Achievements
              </Text>
            </View>
          </View>
        )}

        {currentStreak > 0 && (
          <View style={styles.streakBadge}>
            <Text style={[styles.streakText, {color: currentTheme.colors.primary}]}>
              🔥 {currentStreak} day streak! Keep it up!
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface.main,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h5,
    fontWeight: '600',
  },
  progressPercentage: {
    ...typography.h4,
    fontWeight: '700',
  },
  progressContainer: {
    marginBottom: spacing.lg,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  progressText: {
    ...typography.body2,
    textAlign: 'center',
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surface.dark,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h4,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    opacity: 0.7,
  },
  streakBadge: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.primary.light + '20',
    borderRadius: 8,
    alignItems: 'center',
  },
  streakText: {
    ...typography.body1,
    fontWeight: '600',
  },
});

