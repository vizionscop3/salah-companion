/**
 * Leaderboard Service
 *
 * Manages leaderboards for prayer streaks, practice sessions, and achievements.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {getTodayProgress} from '@services/progress/progressService';
import {getRecitationSummary} from '@services/progress/recitationAnalyticsService';

export type LeaderboardType =
  | 'prayer_streak'
  | 'practice_sessions'
  | 'achievements'
  | 'recitation_accuracy'
  | 'memorization';

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarUrl?: string;
  score: number;
  rank: number;
  metadata?: Record<string, any>;
}

export interface Leaderboard {
  type: LeaderboardType;
  entries: LeaderboardEntry[];
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  updatedAt: Date;
}

/**
 * Get leaderboard data
 * Note: In production, this would fetch from a backend API
 * For now, we'll use local storage to simulate leaderboard data
 */
export async function getLeaderboard(
  type: LeaderboardType,
  period: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'all_time',
): Promise<LeaderboardEntry[]> {
  try {
    const leaderboardKey = `@salah_companion:leaderboard:${type}:${period}`;
    const leaderboardData = await AsyncStorage.getItem(leaderboardKey);

    if (leaderboardData) {
      const parsed = JSON.parse(leaderboardData);
      return parsed.entries || [];
    }

    // Return empty leaderboard if no data
    return [];
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
}

/**
 * Get user's rank in leaderboard
 */
export async function getUserRank(
  userId: string,
  type: LeaderboardType,
  period: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'all_time',
): Promise<number | null> {
  try {
    const leaderboard = await getLeaderboard(type, period);
    const userEntry = leaderboard.find(entry => entry.userId === userId);
    return userEntry ? userEntry.rank : null;
  } catch (error) {
    console.error('Error getting user rank:', error);
    return null;
  }
}

/**
 * Update leaderboard with user's current score
 * In production, this would be handled by a backend service
 */
export async function updateLeaderboardEntry(
  userId: string,
  username: string,
  type: LeaderboardType,
  score: number,
  metadata?: Record<string, any>,
): Promise<void> {
  try {
    // In a real app, this would be an API call to update the leaderboard
    // For now, we'll store locally for demonstration
    const leaderboardKey = `@salah_companion:leaderboard:${type}:all_time`;
    const leaderboardData = await AsyncStorage.getItem(leaderboardKey);
    const leaderboard: LeaderboardEntry[] = leaderboardData
      ? JSON.parse(leaderboardData).entries || []
      : [];

    const existingIndex = leaderboard.findIndex(
      entry => entry.userId === userId,
    );

    const entry: LeaderboardEntry = {
      userId,
      username,
      score,
      rank: 0, // Will be recalculated
      metadata,
    };

    if (existingIndex >= 0) {
      leaderboard[existingIndex] = entry;
    } else {
      leaderboard.push(entry);
    }

    // Sort by score (descending) and assign ranks
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Keep top 100 entries
    const topEntries = leaderboard.slice(0, 100);

    await AsyncStorage.setItem(
      leaderboardKey,
      JSON.stringify({
        entries: topEntries,
        updatedAt: new Date().toISOString(),
      }),
    );
  } catch (error) {
    console.error('Error updating leaderboard:', error);
  }
}

/**
 * Get user's score for a leaderboard type
 */
export async function getUserScore(
  userId: string,
  type: LeaderboardType,
): Promise<number> {
  try {
    switch (type) {
      case 'prayer_streak': {
        const progress = await getTodayProgress(userId);
        return progress.currentStreak || 0;
      }
      case 'practice_sessions': {
        const summary = await getRecitationSummary(userId);
        return summary.totalPractices || 0;
      }
      case 'achievements': {
        // Get from achievement service
        const achievementKey = `@salah_companion:user_achievements:${userId}`;
        const achievements = await AsyncStorage.getItem(achievementKey);
        const parsed = achievements ? JSON.parse(achievements) : [];
        return parsed.length || 0;
      }
      case 'recitation_accuracy': {
        const summary = await getRecitationSummary(userId);
        return Math.round(summary.averageAccuracy || 0);
      }
      case 'memorization': {
        // Get from memorization service
        const {getMemorizationStats} = await import(
          '@services/memorization/memorizationService'
        );
        const stats = await getMemorizationStats(userId);
        return stats.mastered;
      }
      default:
        return 0;
    }
  } catch (error) {
    console.error('Error getting user score:', error);
    return 0;
  }
}

/**
 * Sync user's score to leaderboard
 */
export async function syncUserToLeaderboard(
  userId: string,
  username: string,
  type: LeaderboardType,
): Promise<void> {
  try {
    const score = await getUserScore(userId, type);
    await updateLeaderboardEntry(userId, username, type, score);
  } catch (error) {
    console.error('Error syncing user to leaderboard:', error);
  }
}

/**
 * Get top users for a leaderboard
 */
export async function getTopUsers(
  type: LeaderboardType,
  limit: number = 10,
  period: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'all_time',
): Promise<LeaderboardEntry[]> {
  try {
    const leaderboard = await getLeaderboard(type, period);
    return leaderboard.slice(0, limit);
  } catch (error) {
    console.error('Error getting top users:', error);
    return [];
  }
}

