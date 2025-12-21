/**
 * Achievement Grid Component
 *
 * Displays achievements in a grid layout, organized by category.
 */

import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {Card, Title, Tabs, Tab} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography, colors, elevation} from '@constants/theme';
import {AchievementBadge} from './AchievementBadge';
import type {AchievementProgress} from '@services/achievements/achievementService';

export interface AchievementGridProps {
  achievements: AchievementProgress[];
  loading?: boolean;
}

type Category = 'all' | 'prayer' | 'recitation' | 'pronunciation' | 'consistency';

export const AchievementGrid: React.FC<AchievementGridProps> = ({
  achievements,
  loading = false,
}) => {
  const {currentTheme} = useTheme();
  const [activeTab, setActiveTab] = React.useState<Category>('all');

  if (loading) {
    return (
      <Card style={[styles.card, elevation[2]]}>
        <Card.Content>
          <Text>Loading achievements...</Text>
        </Card.Content>
      </Card>
    );
  }

  const filteredAchievements =
    activeTab === 'all'
      ? achievements
      : achievements.filter(a => a.category === activeTab);

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;

  const categories: {key: Category; label: string; count: number}[] = [
    {key: 'all', label: 'All', count: totalCount},
    {
      key: 'prayer',
      label: 'Prayer',
      count: achievements.filter(a => a.category === 'prayer').length,
    },
    {
      key: 'recitation',
      label: 'Recitation',
      count: achievements.filter(a => a.category === 'recitation').length,
    },
    {
      key: 'pronunciation',
      label: 'Pronunciation',
      count: achievements.filter(a => a.category === 'pronunciation').length,
    },
    {
      key: 'consistency',
      label: 'Consistency',
      count: achievements.filter(a => a.category === 'consistency').length,
    },
  ];

  return (
    <Card style={[styles.card, elevation[2]]}>
      <Card.Content>
        <View style={styles.header}>
          <Title style={[styles.title, {color: currentTheme.colors.text}]}>
            Achievements
          </Title>
          <Text style={[styles.count, {color: currentTheme.colors.primary}]}>
            {unlockedCount} / {totalCount}
          </Text>
        </View>

        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          style={styles.tabs}
          theme={{colors: {primary: currentTheme.colors.primary}}}>
          {categories.map(category => (
            <Tab
              key={category.key}
              label={`${category.label} (${category.count})`}
              value={category.key}
            />
          ))}
        </Tabs>

        <ScrollView style={styles.scrollView} nestedScrollEnabled>
          <View style={styles.grid}>
            {filteredAchievements.map(achievement => (
              <AchievementBadge
                key={achievement.achievementKey}
                achievement={achievement}
                showProgress={true}
                size="medium"
              />
            ))}
          </View>
        </ScrollView>
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
  count: {
    ...typography.h6,
    fontWeight: '700',
  },
  tabs: {
    marginBottom: spacing.md,
  },
  scrollView: {
    maxHeight: 600,
  },
  grid: {
    paddingTop: spacing.sm,
  },
});
