/**
 * Recent Achievements Component
 *
 * Displays recently unlocked achievements in a compact format for the home screen.
 */

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {Card, Title, Paragraph} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography, colors, elevation} from '@constants/theme';
import {ICON_MAP} from './AchievementBadge';
import type {UnlockedAchievement} from '@services/achievements/achievementService';
import {useNavigation} from '@react-navigation/native';

export interface RecentAchievementsProps {
  achievements: UnlockedAchievement[];
  loading?: boolean;
  maxDisplay?: number;
}

export const RecentAchievements: React.FC<RecentAchievementsProps> = ({
  achievements,
  loading = false,
  maxDisplay = 3,
}) => {
  const {currentTheme} = useTheme();
  const navigation = useNavigation();

  if (loading) {
    return (
      <Card style={[styles.card, elevation[2]]}>
        <Card.Content>
          <Paragraph>Loading achievements...</Paragraph>
        </Card.Content>
      </Card>
    );
  }

  // Show empty state if no achievements
  if (achievements.length === 0) {
    return (
      <Card style={[styles.card, elevation[2]]}>
        <Card.Content>
          <View style={styles.header}>
            <Title style={[styles.title, {color: currentTheme.colors.text}]}>
              Recent Achievements
            </Title>
          </View>
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyIcon]}>🏆</Text>
            <Text style={[styles.emptyText, {color: currentTheme.colors.text + '80'}]}>
              Complete activities to unlock achievements!
            </Text>
            <Text
              style={[
                styles.emptySubtext,
                {color: currentTheme.colors.text + '60'},
              ]}>
              Practice prayers, recitation, or pronunciation to earn your first badge.
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  }

  const recentAchievements = achievements.slice(0, maxDisplay);

  const handleViewAll = () => {
    (navigation as any).navigate('Profile');
  };

  return (
    <Card style={[styles.card, elevation[2]]}>
      <Card.Content>
        <View style={styles.header}>
          <Title style={[styles.title, {color: currentTheme.colors.text}]}>
            Recent Achievements
          </Title>
          {achievements.length > maxDisplay && (
            <TouchableOpacity onPress={handleViewAll}>
              <Text style={[styles.viewAll, {color: currentTheme.colors.primary}]}>
                View All
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {recentAchievements.map((achievement, index) => (
            <View key={achievement.achievementKey} style={styles.achievementItem}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>
                  {ICON_MAP[achievement.iconName] || '🏆'}
                </Text>
                <View style={styles.sparkle}>
                  <Text style={styles.sparkleText}>✨</Text>
                </View>
              </View>
              <Text
                style={[styles.achievementTitle, {color: currentTheme.colors.text}]}
                numberOfLines={2}>
                {achievement.title}
              </Text>
              <Text
                style={[
                  styles.achievementDate,
                  {color: currentTheme.colors.text + '80'},
                ]}>
                {formatDate(achievement.unlockedAt)}
              </Text>
            </View>
          ))}
        </ScrollView>

      </Card.Content>
    </Card>
  );
};

function formatDate(date: Date): string {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}w ago`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `${months}mo ago`;
  }
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface.main,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h6,
    fontWeight: '600',
  },
  viewAll: {
    ...typography.body2,
    fontWeight: '600',
  },
  scrollContent: {
    paddingRight: spacing.md,
  },
  achievementItem: {
    width: 100,
    marginRight: spacing.md,
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 48,
    textAlign: 'center',
  },
  sparkle: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  sparkleText: {
    fontSize: 16,
  },
  achievementTitle: {
    ...typography.body2,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.xs,
    minHeight: 36,
  },
  achievementDate: {
    ...typography.caption,
    fontSize: 10,
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body1,
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  emptySubtext: {
    ...typography.body2,
    textAlign: 'center',
    fontSize: 12,
  },
});
















