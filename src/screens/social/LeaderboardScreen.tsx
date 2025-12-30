/**
 * Leaderboard Screen
 *
 * Displays leaderboards for prayer streaks, practice sessions, achievements, etc.
 */

import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, RefreshControl} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Card, Title, Chip, SegmentedButtons} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {useAuth} from '@context/AuthContext';
import {spacing, typography, colors} from '@constants/theme';
import {islamicShadows, islamicBorderRadius} from '@constants/islamicTheme';
import {
  getLeaderboard,
  getUserRank,
  LeaderboardType,
  LeaderboardEntry,
} from '@services/social/leaderboardService';
import {LoadingState} from '@components/index';

export const LeaderboardScreen: React.FC = () => {
  const {currentTheme} = useTheme();
  const {user} = useAuth();
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('prayer_streak');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all_time'>('all_time');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, [leaderboardType, period, user]);

  const loadLeaderboard = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [leaderboardData, rank] = await Promise.all([
        getLeaderboard(leaderboardType, period),
        getUserRank(user.id, leaderboardType, period),
      ]);
      setLeaderboard(leaderboardData);
      setUserRank(rank);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLeaderboard();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingState message="Loading leaderboard..." />
      </SafeAreaView>
    );
  }

  const getTypeLabel = (type: LeaderboardType): string => {
    const labels: Record<LeaderboardType, string> = {
      prayer_streak: 'Prayer Streak',
      practice_sessions: 'Practice Sessions',
      achievements: 'Achievements',
      recitation_accuracy: 'Recitation Accuracy',
      memorization: 'Memorization',
    };
    return labels[type];
  };

  const getRankEmoji = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.header}>
          <Text style={[styles.title, {color: currentTheme.colors.text}]}>
            Leaderboards
          </Text>
          <Text style={[styles.subtitle, {color: currentTheme.colors.text}]}>
            See how you rank among other users
          </Text>
        </View>

        {/* Type Selector */}
        <View style={styles.selectorContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(
              [
                'prayer_streak',
                'practice_sessions',
                'achievements',
                'recitation_accuracy',
                'memorization',
              ] as LeaderboardType[]
            ).map(type => (
              <Chip
                key={type}
                selected={leaderboardType === type}
                onPress={() => setLeaderboardType(type)}
                style={styles.typeChip}
                selectedColor={colors.primary.main}>
                {getTypeLabel(type)}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Period Selector */}
        <View style={styles.periodContainer}>
          <SegmentedButtons
            value={period}
            onValueChange={value =>
              setPeriod(value as 'daily' | 'weekly' | 'monthly' | 'all_time')
            }
            buttons={[
              {value: 'daily', label: 'Daily'},
              {value: 'weekly', label: 'Weekly'},
              {value: 'monthly', label: 'Monthly'},
              {value: 'all_time', label: 'All Time'},
            ]}
          />
        </View>

        {/* User Rank */}
        {userRank && (
          <Card style={[styles.card, styles.userRankCard]}>
            <Card.Content>
              <Text style={[styles.userRankLabel, {color: currentTheme.colors.text}]}>
                Your Rank
              </Text>
              <Text style={[styles.userRankValue, {color: colors.primary.main}]}>
                {getRankEmoji(userRank)}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Leaderboard */}
        <View style={styles.leaderboardContainer}>
          {leaderboard.length === 0 ? (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={[styles.emptyText, {color: currentTheme.colors.text}]}>
                  No entries yet. Be the first!
                </Text>
              </Card.Content>
            </Card>
          ) : (
            leaderboard.map((entry, index) => {
              const isCurrentUser = entry.userId === user?.id;
              return (
                <Card
                  key={entry.userId}
                  style={[
                    styles.card,
                    isCurrentUser && styles.currentUserCard,
                    index < 3 && styles.topThreeCard,
                  ]}>
                  <Card.Content>
                    <View style={styles.entryRow}>
                      <View style={styles.rankContainer}>
                        <Text style={[styles.rankText, {color: colors.primary.main}]}>
                          {getRankEmoji(entry.rank)}
                        </Text>
                      </View>
                      <View style={styles.userInfo}>
                        <Text
                          style={[
                            styles.username,
                            isCurrentUser && styles.currentUsername,
                            {color: currentTheme.colors.text},
                          ]}>
                          {entry.username}
                          {isCurrentUser && ' (You)'}
                        </Text>
                        <Text style={[styles.scoreLabel, {color: currentTheme.colors.text}]}>
                          {getTypeLabel(leaderboardType)}
                        </Text>
                      </View>
                      <View style={styles.scoreContainer}>
                        <Text style={[styles.score, {color: colors.primary.main}]}>
                          {entry.score}
                        </Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              );
            })
          )}
        </View>
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
  selectorContainer: {
    marginBottom: spacing.md,
  },
  typeChip: {
    marginRight: spacing.sm,
  },
  periodContainer: {
    marginBottom: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
    ...islamicShadows.medium,
    borderRadius: islamicBorderRadius.large,
    backgroundColor: colors.surface.secondary,
  },
  userRankCard: {
    borderWidth: 2,
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + '10',
  },
  userRankLabel: {
    ...typography.body2,
    opacity: 0.7,
    marginBottom: spacing.xs,
  },
  userRankValue: {
    ...typography.h2,
    textAlign: 'center',
  },
  leaderboardContainer: {
    marginBottom: spacing.lg,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + '10',
  },
  topThreeCard: {
    borderWidth: 2,
    borderColor: colors.accent.gold,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rankText: {
    ...typography.h4,
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  username: {
    ...typography.body1,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  currentUsername: {
    color: colors.primary.main,
  },
  scoreLabel: {
    ...typography.caption,
    opacity: 0.7,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    ...typography.h4,
    fontWeight: '700',
  },
  emptyText: {
    ...typography.body1,
    textAlign: 'center',
    opacity: 0.7,
  },
});

