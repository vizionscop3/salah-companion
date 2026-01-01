/**
 * Achievement Grid Component - Material Neubrutomorphism
 *
 * Displays achievements in a grid layout, organized by category.
 */

import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography, colors, borderRadius, brutalistShadows} from '@constants/theme';
import {NeubrutalCard} from './NeubrutalCard';
import {AchievementBadge} from './AchievementBadge';
import type {AchievementProgress} from '@services/achievements/achievementService';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

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
      <NeubrutalCard style={styles.card} shadowSize="medium">
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading achievements...</Text>
        </View>
      </NeubrutalCard>
    );
  }

  const filteredAchievements =
    activeTab === 'all'
      ? achievements
      : achievements.filter(a => a.category === activeTab);

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;

  const categories: {key: Category; label: string; count: number; icon: string}[] = [
    {key: 'all', label: 'All', count: totalCount, icon: 'apps'},
    {
      key: 'prayer',
      label: 'Prayer',
      count: achievements.filter(a => a.category === 'prayer').length,
      icon: 'hand-prayer',
    },
    {
      key: 'recitation',
      label: 'Recitation',
      count: achievements.filter(a => a.category === 'recitation').length,
      icon: 'microphone',
    },
    {
      key: 'pronunciation',
      label: 'Pronunciation',
      count: achievements.filter(a => a.category === 'pronunciation').length,
      icon: 'alphabetical',
    },
    {
      key: 'consistency',
      label: 'Consistency',
      count: achievements.filter(a => a.category === 'consistency').length,
      icon: 'calendar-check',
    },
  ];

  return (
    <NeubrutalCard style={styles.card} shadowSize="medium">
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Achievements</Text>
          <View style={styles.countBadge}>
            <Text style={styles.count}>
              {unlockedCount} / {totalCount}
            </Text>
          </View>
        </View>

        {/* Custom Tabs - Material Neubrutomorphism */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScrollView}
          contentContainerStyle={styles.tabsContainer}>
          {categories.map(category => {
            const isActive = activeTab === category.key;
            return (
              <TouchableOpacity
                key={category.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(category.key)}
                activeOpacity={0.7}>
                <MaterialCommunityIcons
                  name={category.icon}
                  size={16}
                  color={isActive ? colors.background.default : colors.text.secondary}
                  style={styles.tabIcon}
                />
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {category.label} ({category.count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Achievements Grid */}
        <ScrollView style={styles.scrollView} nestedScrollEnabled>
          {filteredAchievements.length > 0 ? (
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
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="trophy-outline"
                size={48}
                color={colors.text.secondary}
              />
              <Text style={styles.emptyStateText}>No achievements in this category</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </NeubrutalCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface.secondary,
    borderColor: colors.primary.main,
    borderWidth: 3,
    borderRadius: borderRadius.lg,
  },
  content: {
    gap: spacing.md,
  },
  loadingContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body1,
    color: colors.text.secondary,
    fontFamily: 'Poppins',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.h5,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: 'Poppins',
  },
  countBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface.tertiary,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  count: {
    ...typography.h6,
    fontWeight: '700',
    color: colors.primary.main,
    fontFamily: 'Poppins',
  },
  tabsScrollView: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface.tertiary,
    borderWidth: 2,
    borderColor: colors.surface.tertiary,
    gap: spacing.xs,
    ...brutalistShadows.small,
  },
  tabActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  tabIcon: {
    marginRight: spacing.xs,
  },
  tabLabel: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.text.secondary,
    fontFamily: 'Poppins',
  },
  tabLabelActive: {
    color: colors.background.default,
    fontWeight: '700',
  },
  scrollView: {
    maxHeight: 600,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  emptyStateText: {
    ...typography.body1,
    color: colors.text.secondary,
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
});
