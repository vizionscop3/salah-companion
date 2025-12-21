/**
 * Pronunciation Stats Card Component
 *
 * Displays pronunciation practice analytics including letters learned,
 * mastery progress, average accuracy, and practice frequency.
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Card, Title, Paragraph, ProgressBar} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography, colors, elevation} from '@constants/theme';
import type {PronunciationSummary} from '@services/progress/pronunciationAnalyticsService';

export interface PronunciationStatsCardProps {
  summary: PronunciationSummary | null;
  loading?: boolean;
}

export const PronunciationStatsCard: React.FC<PronunciationStatsCardProps> = ({
  summary,
  loading = false,
}) => {
  const {currentTheme} = useTheme();

  if (loading) {
    return (
      <Card style={[styles.card, elevation[2]]}>
        <Card.Content>
          <Paragraph>Loading pronunciation stats...</Paragraph>
        </Card.Content>
      </Card>
    );
  }

  if (!summary || summary.totalPracticeSessions === 0) {
    return (
      <Card style={[styles.card, elevation[2]]}>
        <Card.Content>
          <Title style={[styles.title, {color: currentTheme.colors.text}]}>
            Pronunciation Practice
          </Title>
          <Paragraph style={[styles.emptyText, {color: currentTheme.colors.text}]}>
            Start practicing letters to see your statistics here.
          </Paragraph>
        </Card.Content>
      </Card>
    );
  }

  const masteryProgress = summary.masteryProgress / 100;

  return (
    <Card style={[styles.card, elevation[2]]}>
      <Card.Content>
        <Title style={[styles.title, {color: currentTheme.colors.text}]}>
          Pronunciation Practice
        </Title>

        <View style={styles.masteryContainer}>
          <View style={styles.masteryHeader}>
            <Paragraph style={[styles.masteryLabel, {color: currentTheme.colors.text}]}>
              Mastery Progress
            </Paragraph>
            <Text style={[styles.masteryPercentage, {color: currentTheme.colors.primary}]}>
              {summary.masteryProgress}%
            </Text>
          </View>
          <ProgressBar
            progress={masteryProgress}
            color={currentTheme.colors.primary}
            style={styles.progressBar}
          />
          <Text style={[styles.masteryText, {color: currentTheme.colors.text}]}>
            {summary.lettersLearned} of {summary.totalLetters} letters mastered
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, {color: currentTheme.colors.primary}]}>
              {summary.lettersLearned}
            </Text>
            <Text style={[styles.statLabel, {color: currentTheme.colors.text}]}>
              Learned
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, {color: currentTheme.colors.secondary}]}>
              {summary.lettersInProgress}
            </Text>
            <Text style={[styles.statLabel, {color: currentTheme.colors.text}]}>
              In Progress
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, {color: colors.accent.bold}]}>
              {summary.averageAccuracy}%
            </Text>
            <Text style={[styles.statLabel, {color: currentTheme.colors.text}]}>
              Avg Accuracy
            </Text>
          </View>
        </View>

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

        <View style={styles.sessionsContainer}>
          <Paragraph style={[styles.sessionsText, {color: currentTheme.colors.text}]}>
            Total practice sessions: {summary.totalPracticeSessions}
          </Paragraph>
        </View>
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
  masteryContainer: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.dark,
  },
  masteryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  masteryLabel: {
    ...typography.body1,
    fontWeight: '600',
  },
  masteryPercentage: {
    ...typography.h5,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  masteryText: {
    ...typography.body2,
    opacity: 0.7,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
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
  frequencyContainer: {
    marginTop: spacing.md,
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
  sessionsContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surface.dark,
  },
  sessionsText: {
    ...typography.body2,
    textAlign: 'center',
    opacity: 0.7,
  },
});
