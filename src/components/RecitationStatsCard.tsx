/**
 * Recitation Stats Card Component
 *
 * Displays recitation practice analytics including total practices,
 * average accuracy, most practiced surah, and practice frequency.
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Card, Title, Paragraph, ProgressBar} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography, colors, elevation} from '@constants/theme';
import type {RecitationSummary} from '@services/progress/recitationAnalyticsService';

export interface RecitationStatsCardProps {
  summary: RecitationSummary | null;
  loading?: boolean;
}

export const RecitationStatsCard: React.FC<RecitationStatsCardProps> = ({
  summary,
  loading = false,
}) => {
  const {currentTheme} = useTheme();

  if (loading) {
    return (
      <Card style={[styles.card, elevation[2]]}>
        <Card.Content>
          <Paragraph>Loading recitation stats...</Paragraph>
        </Card.Content>
      </Card>
    );
  }

  if (!summary || summary.totalPractices === 0) {
    return (
      <Card style={[styles.card, elevation[2]]}>
        <Card.Content>
          <Title style={[styles.title, {color: currentTheme.colors.text}]}>
            Recitation Practice
          </Title>
          <Paragraph style={[styles.emptyText, {color: currentTheme.colors.text}]}>
            Start practicing to see your statistics here.
          </Paragraph>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={[styles.card, elevation[2]]}>
      <Card.Content>
        <Title style={[styles.title, {color: currentTheme.colors.text}]}>
          Recitation Practice
        </Title>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, {color: currentTheme.colors.primary}]}>
              {summary.totalPractices}
            </Text>
            <Text style={[styles.statLabel, {color: currentTheme.colors.text}]}>
              Total Practices
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, {color: currentTheme.colors.secondary}]}>
              {summary.averageAccuracy}%
            </Text>
            <Text style={[styles.statLabel, {color: currentTheme.colors.text}]}>
              Avg Accuracy
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, {color: colors.accent.bold}]}>
              {summary.surahsPracticed}
            </Text>
            <Text style={[styles.statLabel, {color: currentTheme.colors.text}]}>
              Surahs Practiced
            </Text>
          </View>
        </View>

        {summary.mostPracticedSurah && (
          <View style={styles.mostPracticedContainer}>
            <Paragraph style={[styles.mostPracticedLabel, {color: currentTheme.colors.text}]}>
              Most Practiced:
            </Paragraph>
            <Text style={[styles.mostPracticedName, {color: currentTheme.colors.primary}]}>
              {summary.mostPracticedSurah.surahName}
            </Text>
            <Text style={[styles.mostPracticedStats, {color: currentTheme.colors.text}]}>
              {summary.mostPracticedSurah.timesPracticed} times •{' '}
              {summary.mostPracticedSurah.averageAccuracy}% avg
            </Text>
          </View>
        )}

        <View style={styles.frequencyContainer}>
          <Paragraph style={[styles.frequencyTitle, {color: currentTheme.colors.text}]}>
            Practice Frequency
          </Paragraph>
          <View style={styles.frequencyRow}>
            <View style={styles.frequencyItem}>
              <Text style={[styles.frequencyValue, {color: currentTheme.colors.primary}]}>
                {summary.practiceFrequency.daily}
              </Text>
              <Text style={[styles.frequencyLabel, {color: currentTheme.colors.text}]}>
                Last 7 days
              </Text>
            </View>
            <View style={styles.frequencyItem}>
              <Text style={[styles.frequencyValue, {color: currentTheme.colors.secondary}]}>
                {summary.practiceFrequency.weekly}
              </Text>
              <Text style={[styles.frequencyLabel, {color: currentTheme.colors.text}]}>
                Last 4 weeks
              </Text>
            </View>
            <View style={styles.frequencyItem}>
              <Text style={[styles.frequencyValue, {color: colors.accent.bold}]}>
                {summary.practiceFrequency.monthly}
              </Text>
              <Text style={[styles.frequencyLabel, {color: currentTheme.colors.text}]}>
                Last 12 months
              </Text>
            </View>
          </View>
        </View>

        {summary.totalPracticeMinutes > 0 && (
          <View style={styles.timeContainer}>
            <Paragraph style={[styles.timeText, {color: currentTheme.colors.text}]}>
              Total practice time: {Math.round(summary.totalPracticeMinutes)} minutes
            </Paragraph>
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
  title: {
    ...typography.h5,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.body1,
    opacity: 0.7,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.dark,
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
  mostPracticedContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.primary.light + '10',
    borderRadius: 8,
  },
  mostPracticedLabel: {
    ...typography.body2,
    opacity: 0.7,
    marginBottom: spacing.xs,
  },
  mostPracticedName: {
    ...typography.h6,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  mostPracticedStats: {
    ...typography.body2,
    opacity: 0.7,
  },
  frequencyContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surface.dark,
  },
  frequencyTitle: {
    ...typography.body1,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  frequencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  frequencyItem: {
    alignItems: 'center',
  },
  frequencyValue: {
    ...typography.h5,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  frequencyLabel: {
    ...typography.caption,
    opacity: 0.7,
    fontSize: 10,
  },
  timeContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surface.dark,
  },
  timeText: {
    ...typography.body2,
    textAlign: 'center',
    opacity: 0.7,
  },
});
