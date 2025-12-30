/**
 * Achievement Badge Component
 *
 * Displays a single achievement badge with progress indicator.
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Card, ProgressBar} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography, colors, elevation} from '@constants/theme';
import type {AchievementProgress} from '@services/achievements/achievementService';

export interface AchievementBadgeProps {
  achievement: AchievementProgress;
  showProgress?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const ICON_MAP: Record<string, string> = {
  fire: '🔥',
  star: '⭐',
  trophy: '🏆',
  crown: '👑',
  'check-circle': '✅',
  medal: '🥇',
  award: '🏅',
  'book-open': '📖',
  book: '📚',
  library: '📚',
  'graduation-cap': '🎓',
  layers: '📑',
  bookmark: '🔖',
  target: '🎯',
  alphabet: '🔤',
  type: '⌨️',
  mic: '🎤',
  headphones: '🎧',
  calendar: '📅',
  'calendar-check': '📆',
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  showProgress = true,
  size = 'medium',
}) => {
  const {currentTheme} = useTheme();
  const isUnlocked = achievement.isUnlocked;
  const icon = ICON_MAP[achievement.iconName] || '🏆';

  const sizeStyles = {
    small: {
      cardPadding: spacing.sm,
      iconSize: 32,
      titleSize: typography.body2,
      descriptionSize: typography.caption,
    },
    medium: {
      cardPadding: spacing.md,
      iconSize: 48,
      titleSize: typography.h6,
      descriptionSize: typography.body2,
    },
    large: {
      cardPadding: spacing.lg,
      iconSize: 64,
      titleSize: typography.h5,
      descriptionSize: typography.body1,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <Card
      style={[
        styles.card,
        elevation[2],
        isUnlocked && styles.unlockedCard,
        !isUnlocked && styles.lockedCard,
      ]}>
      <Card.Content style={[styles.content, {padding: currentSize.cardPadding}]}>
        <View style={styles.iconContainer}>
          <Text style={[styles.icon, {fontSize: currentSize.iconSize}]}>{icon}</Text>
          {isUnlocked && (
            <View style={styles.unlockedBadge}>
              <Text style={styles.unlockedText}>✓</Text>
            </View>
          )}
        </View>

        <View style={styles.textContainer}>
          <Text
            style={[
              currentSize.titleSize,
              styles.title,
              {
                color: isUnlocked
                  ? currentTheme.colors.text
                  : currentTheme.colors.text + '80',
                fontWeight: '600',
              },
            ]}>
            {achievement.title}
          </Text>
          <Text
            style={[
              currentSize.descriptionSize,
              styles.description,
              {
                color: isUnlocked
                  ? currentTheme.colors.text + 'CC'
                  : currentTheme.colors.text + '60',
              },
            ]}>
            {achievement.description}
          </Text>

          {showProgress && !isUnlocked && (
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={achievement.progress / 100}
                color={currentTheme.colors.primary}
                style={styles.progressBar}
              />
              <Text
                style={[
                  styles.progressText,
                  {color: currentTheme.colors.text + '80'},
                ]}>
                {achievement.currentValue} / {achievement.requirementValue} (
                {achievement.progress}%)
              </Text>
            </View>
          )}

          {isUnlocked && achievement.unlockedAt && (
            <Text
              style={[
                styles.unlockedDate,
                {color: currentTheme.colors.primary},
              ]}>
              Unlocked {formatDate(achievement.unlockedAt)}
            </Text>
          )}

          <View style={styles.pointsContainer}>
            <Text
              style={[
                styles.pointsText,
                {color: currentTheme.colors.secondary},
              ]}>
              +{achievement.pointsAwarded} points
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

function formatDate(date: Date): string {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'today';
  } else if (diffDays === 1) {
    return 'yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  unlockedCard: {
    backgroundColor: colors.surface.secondary,
    borderWidth: 2,
    borderColor: colors.primary.main + '40',
  },
  lockedCard: {
    backgroundColor: colors.surface.tertiary,
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: spacing.md,
    position: 'relative',
  },
  icon: {
    textAlign: 'center',
  },
  unlockedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success.main,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface.secondary,
  },
  unlockedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    marginBottom: spacing.xs,
  },
  description: {
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  progressContainer: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.xs,
  },
  progressText: {
    ...typography.caption,
    fontSize: 10,
  },
  unlockedDate: {
    ...typography.caption,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  pointsContainer: {
    marginTop: spacing.xs,
  },
  pointsText: {
    ...typography.caption,
    fontWeight: '600',
  },
});
