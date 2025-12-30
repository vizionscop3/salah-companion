/**
 * Memorization Screen
 *
 * Tracks surah memorization progress with spaced repetition scheduling.
 */

import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Card, Title, Paragraph, Button, ProgressBar, Chip} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {useAuth} from '@context/AuthContext';
import {spacing, typography, colors} from '@constants/theme';
import {islamicShadows, islamicBorderRadius} from '@constants/islamicTheme';
import {
  getMemorizationProgress,
  getSurahsDueForReview,
  getMemorizationStats,
  startMemorizingSurah,
  ReviewSchedule,
} from '@services/memorization/memorizationService';
import {COMMON_SURAHS} from '@services/recitation/quranicTextService';
import {LoadingState} from '@components/index';

export const MemorizationScreen: React.FC = () => {
  const {currentTheme} = useTheme();
  const {user} = useAuth();
  const [progress, setProgress] = useState<any[]>([]);
  const [dueForReview, setDueForReview] = useState<ReviewSchedule[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'learning' | 'reviewing' | 'mastered'>('all');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [progressData, reviewData, statsData] = await Promise.all([
        getMemorizationProgress(user.id),
        getSurahsDueForReview(user.id),
        getMemorizationStats(user.id),
      ]);
      setProgress(progressData);
      setDueForReview(reviewData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading memorization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartMemorizing = async (surahNumber: number, surahName: string) => {
    if (!user?.id) return;

    try {
      await startMemorizingSurah(user.id, surahNumber, surahName);
      await loadData();
    } catch (error) {
      console.error('Error starting memorization:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingState message="Loading memorization progress..." />
      </SafeAreaView>
    );
  }

  const filteredProgress =
    filter === 'all'
      ? progress
      : progress.filter(p => p.status === filter);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: currentTheme.colors.text}]}>
            Memorization
          </Text>
          <Text style={[styles.subtitle, {color: currentTheme.colors.text}]}>
            Track your Quran memorization progress
          </Text>
        </View>

        {/* Statistics */}
        {stats && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Statistics</Title>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, {color: colors.primary.main}]}>
                    {stats.totalSurahs}
                  </Text>
                  <Text style={[styles.statLabel, {color: currentTheme.colors.text}]}>
                    Total Surahs
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, {color: colors.warning.main}]}>
                    {stats.learning}
                  </Text>
                  <Text style={[styles.statLabel, {color: currentTheme.colors.text}]}>
                    Learning
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, {color: colors.success.main}]}>
                    {stats.mastered}
                  </Text>
                  <Text style={[styles.statLabel, {color: currentTheme.colors.text}]}>
                    Mastered
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, {color: colors.accent.gold}]}>
                    {stats.currentStreak}
                  </Text>
                  <Text style={[styles.statLabel, {color: currentTheme.colors.text}]}>
                    Day Streak
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Due for Review */}
        {dueForReview.length > 0 && (
          <Card style={[styles.card, styles.reviewCard]}>
            <Card.Content>
              <Title style={{color: colors.warning.main}}>Due for Review</Title>
              {dueForReview.slice(0, 3).map(item => (
                <View key={item.surahNumber} style={styles.reviewItem}>
                  <Text style={[styles.reviewSurah, {color: currentTheme.colors.text}]}>
                    Surah {item.surahNumber}
                  </Text>
                  <Chip
                    style={[
                      styles.priorityChip,
                      item.priority === 'high' && {backgroundColor: colors.error.main},
                    ]}>
                    {item.priority}
                  </Chip>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Filter */}
        <View style={styles.filterContainer}>
          {(['all', 'learning', 'reviewing', 'mastered'] as const).map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterChip, filter === f && styles.filterChipSelected]}>
              <Text
                style={[
                  styles.filterText,
                  filter === f && styles.filterTextSelected,
                  {color: currentTheme.colors.text},
                ]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Progress List */}
        <View style={styles.progressContainer}>
          {filteredProgress.length === 0 ? (
            <Card style={styles.card}>
              <Card.Content>
                <Paragraph style={{textAlign: 'center', opacity: 0.7}}>
                  No surahs in this category. Start memorizing a surah!
                </Paragraph>
              </Card.Content>
            </Card>
          ) : (
            filteredProgress.map(item => (
              <Card key={item.surahNumber} style={styles.card}>
                <Card.Content>
                  <View style={styles.progressHeader}>
                    <View>
                      <Title>Surah {item.surahNumber}</Title>
                      <Text style={[styles.surahName, {color: currentTheme.colors.text}]}>
                        {item.surahName}
                      </Text>
                    </View>
                    <Chip
                      style={[
                        styles.statusChip,
                        item.status === 'mastered' && {
                          backgroundColor: colors.success.main,
                        },
                        item.status === 'reviewing' && {
                          backgroundColor: colors.warning.main,
                        },
                        item.status === 'learning' && {
                          backgroundColor: colors.primary.main,
                        },
                      ]}>
                      {item.status}
                    </Chip>
                  </View>
                  <ProgressBar
                    progress={item.progress / 100}
                    color={colors.primary.main}
                    style={styles.progressBar}
                  />
                  <Text style={[styles.progressText, {color: currentTheme.colors.text}]}>
                    {Math.round(item.progress)}% Complete
                  </Text>
                  {item.nextReview && (
                    <Text style={[styles.reviewDate, {color: currentTheme.colors.text}]}>
                      Next review: {new Date(item.nextReview).toLocaleDateString()}
                    </Text>
                  )}
                </Card.Content>
              </Card>
            ))
          )}
        </View>

        {/* Start New Surah */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Start Memorizing</Title>
            <Paragraph>Choose a surah from Juz Amma to start memorizing</Paragraph>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {COMMON_SURAHS.slice(0, 10).map(surah => {
                const isStarted = progress.some(p => p.surahNumber === surah.number);
                return (
                  <TouchableOpacity
                    key={surah.number}
                    onPress={() =>
                      !isStarted &&
                      handleStartMemorizing(surah.number, surah.englishName)
                    }
                    disabled={isStarted}
                    style={[
                      styles.surahChip,
                      isStarted && styles.surahChipDisabled,
                    ]}>
                    <Text
                      style={[
                        styles.surahChipText,
                        isStarted && styles.surahChipTextDisabled,
                        {color: currentTheme.colors.text},
                      ]}>
                      {surah.number}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body2,
    opacity: 0.7,
  },
  card: {
    marginBottom: spacing.md,
    ...islamicShadows.medium,
    borderRadius: islamicBorderRadius.large,
    backgroundColor: colors.surface.secondary,
  },
  reviewCard: {
    borderWidth: 2,
    borderColor: colors.warning.main,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  statItem: {
    width: '50%',
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.body2,
    opacity: 0.7,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.background.paper,
    borderRadius: 8,
  },
  reviewSurah: {
    ...typography.body1,
    fontWeight: '600',
  },
  priorityChip: {
    height: 24,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    borderRadius: islamicBorderRadius.medium,
    backgroundColor: colors.surface.secondary,
    borderWidth: 2,
    borderColor: colors.border.primary,
  },
  filterChipSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + '20',
  },
  filterText: {
    ...typography.body2,
    fontWeight: '600',
  },
  filterTextSelected: {
    color: colors.primary.main,
  },
  progressContainer: {
    marginBottom: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  surahName: {
    ...typography.body2,
    opacity: 0.7,
  },
  statusChip: {
    height: 28,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginVertical: spacing.sm,
  },
  progressText: {
    ...typography.body2,
    marginTop: spacing.xs,
  },
  reviewDate: {
    ...typography.caption,
    marginTop: spacing.xs,
    opacity: 0.7,
  },
  surahChip: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  surahChipDisabled: {
    backgroundColor: colors.surface.tertiary,
    opacity: 0.5,
  },
  surahChipText: {
    ...typography.h4,
    color: '#FFFFFF',
  },
  surahChipTextDisabled: {
    color: colors.text.secondary,
  },
});

