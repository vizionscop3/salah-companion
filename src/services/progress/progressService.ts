/**
 * Progress Service
 *
 * Manages user prayer progress, streaks, and achievements.
 * 
 * NOTE: Prisma cannot run in React Native (Node.js only).
 * This service uses AsyncStorage for local storage.
 * TODO: Replace with proper backend API integration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {PrayerName} from '@services/prayer/prayerTimeService';

export interface PrayerCompletionData {
  userId: string;
  prayerName: PrayerName;
  prayerDate: Date;
  prayerTime: Date;
  wasGuided?: boolean;
  wasOnTime?: boolean;
  rakAhsCompleted?: number;
  sunnahBefore?: boolean;
  sunnahAfter?: boolean;
  notes?: string;
}

export interface ProgressStats {
  prayersCompleted: number;
  totalPrayers: number;
  currentStreak: number;
  longestStreak: number;
  achievements: number;
  todayProgress: number;
  // Enhanced analytics
  recitationStats?: {
    totalPractices: number;
    averageAccuracy: number;
    surahsPracticed: number;
  };
  pronunciationStats?: {
    lettersLearned: number;
    totalLetters: number;
    masteryProgress: number;
  };
}

interface PrayerRecord {
  id: string;
  userId: string;
  prayerName: PrayerName;
  prayerDate: string; // ISO string
  prayerTime: string; // ISO string
  wasGuided?: boolean;
  wasOnTime?: boolean;
  rakAhsCompleted?: number;
  sunnahBefore?: boolean;
  sunnahAfter?: boolean;
  notes?: string;
}

interface UserProgress {
  userId: string;
  progressDate: string; // ISO string (date only)
  prayersCompleted: number;
  currentStreak: number;
  longestStreak: number;
  experiencePoints: number;
}

const STORAGE_KEYS = {
  PRAYER_RECORDS: (userId: string) => `@salah_companion:prayer_records:${userId}`,
  USER_PROGRESS: (userId: string) => `@salah_companion:user_progress:${userId}`,
  ACHIEVEMENTS: (userId: string) => `@salah_companion:achievements:${userId}`,
};

/**
 * Record a prayer completion
 */
export async function recordPrayerCompletion(
  data: PrayerCompletionData,
): Promise<void> {
  try {
    // Get existing prayer records
    const recordsKey = STORAGE_KEYS.PRAYER_RECORDS(data.userId);
    const existingRecordsJson = await AsyncStorage.getItem(recordsKey);
    const existingRecords: PrayerRecord[] = existingRecordsJson
      ? JSON.parse(existingRecordsJson)
      : [];

    // Create new prayer record
    const newRecord: PrayerRecord = {
      id: `prayer_${Date.now()}_${Math.random()}`,
      userId: data.userId,
      prayerName: data.prayerName,
      prayerDate: data.prayerDate.toISOString(),
      prayerTime: data.prayerTime.toISOString(),
      wasGuided: data.wasGuided ?? true,
      wasOnTime: data.wasOnTime,
      rakAhsCompleted: data.rakAhsCompleted ?? 0,
      sunnahBefore: data.sunnahBefore ?? false,
      sunnahAfter: data.sunnahAfter ?? false,
      notes: data.notes,
    };

    existingRecords.push(newRecord);
    await AsyncStorage.setItem(recordsKey, JSON.stringify(existingRecords));

    // Update user progress
    await updateUserProgress(data.userId, data.prayerDate);

    // Check for new achievements (non-blocking)
    checkAchievementsAsync(data.userId);
  } catch (error) {
    console.error('Error recording prayer completion:', error);
    throw error;
  }
}

/**
 * Check achievements asynchronously (non-blocking)
 */
async function checkAchievementsAsync(userId: string): Promise<void> {
  try {
    // Use static import to avoid Jest dynamic import issues
    const achievementService = require('@services/achievements/achievementService');
    await achievementService.checkAndUnlockAchievements(userId);
  } catch (error) {
    // Silently fail - achievements are not critical
    console.warn('Failed to check achievements:', error);
  }
}

/**
 * Get today's prayer progress for a user
 */
export async function getTodayProgress(userId: string): Promise<ProgressStats> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

    // Get prayer records
    const recordsKey = STORAGE_KEYS.PRAYER_RECORDS(userId);
    const recordsJson = await AsyncStorage.getItem(recordsKey);
    const allRecords: PrayerRecord[] = recordsJson ? JSON.parse(recordsJson) : [];

    // Filter today's records
    const todayRecords = allRecords.filter(record => {
      const recordDate = new Date(record.prayerDate);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === today.getTime();
    });

    // Get user progress
    const progressKey = STORAGE_KEYS.USER_PROGRESS(userId);
    const progressJson = await AsyncStorage.getItem(progressKey);
    const allProgress: UserProgress[] = progressJson ? JSON.parse(progressJson) : [];

    const todayProgress = allProgress.find(p => {
      const progressDate = new Date(p.progressDate);
      progressDate.setHours(0, 0, 0, 0);
      return progressDate.getTime() === today.getTime();
    });

    // Get achievement count
    const achievementsKey = STORAGE_KEYS.ACHIEVEMENTS(userId);
    const achievementsJson = await AsyncStorage.getItem(achievementsKey);
    const achievements: string[] = achievementsJson ? JSON.parse(achievementsJson) : [];

    // Calculate today's completed prayers (should be 5 for full day)
    const prayersCompleted = todayRecords.length;
    const totalPrayers = 5; // Fajr, Dhuhr, Asr, Maghrib, Isha

    // Get enhanced analytics (non-blocking - don't fail if these fail)
    let recitationStats: ProgressStats['recitationStats'];
    let pronunciationStats: ProgressStats['pronunciationStats'];

    try {
      const recitationService = require('./recitationAnalyticsService');
      const {getRecitationSummary} = recitationService;
      const recitationSummary = await getRecitationSummary(userId);
      recitationStats = {
        totalPractices: recitationSummary.totalPractices,
        averageAccuracy: recitationSummary.averageAccuracy,
        surahsPracticed: recitationSummary.surahsPracticed,
      };
    } catch (error) {
      console.warn('Failed to load recitation stats:', error);
    }

    try {
      const pronunciationService = require('./pronunciationAnalyticsService');
      const {getPronunciationSummary} = pronunciationService;
      const pronunciationSummary = await getPronunciationSummary(userId);
      pronunciationStats = {
        lettersLearned: pronunciationSummary.lettersLearned,
        totalLetters: pronunciationSummary.totalLetters,
        masteryProgress: pronunciationSummary.masteryProgress,
      };
    } catch (error) {
      console.warn('Failed to load pronunciation stats:', error);
    }

    return {
      prayersCompleted,
      totalPrayers,
      currentStreak: todayProgress?.currentStreak ?? 0,
      longestStreak: todayProgress?.longestStreak ?? 0,
      achievements: achievements.length,
      todayProgress: prayersCompleted,
      recitationStats,
      pronunciationStats,
    };
  } catch (error) {
    console.error('Error getting today progress:', error);
    // Return default progress on error
    return {
      prayersCompleted: 0,
      totalPrayers: 5,
      currentStreak: 0,
      longestStreak: 0,
      achievements: 0,
      todayProgress: 0,
    };
  }
}

/**
 * Get user progress for a date range
 */
export async function getUserProgress(
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<UserProgress[]> {
  try {
    const progressKey = STORAGE_KEYS.USER_PROGRESS(userId);
    const progressJson = await AsyncStorage.getItem(progressKey);
    const allProgress: UserProgress[] = progressJson ? JSON.parse(progressJson) : [];

    return allProgress.filter(p => {
      const progressDate = new Date(p.progressDate);
      return progressDate >= startDate && progressDate <= endDate;
    });
  } catch (error) {
    console.error('Error getting user progress:', error);
    return [];
  }
}

/**
 * Update user progress after prayer completion
 */
async function updateUserProgress(userId: string, prayerDate: Date): Promise<void> {
  try {
    const today = new Date(prayerDate);
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Get today's prayer records
    const recordsKey = STORAGE_KEYS.PRAYER_RECORDS(userId);
    const recordsJson = await AsyncStorage.getItem(recordsKey);
    const allRecords: PrayerRecord[] = recordsJson ? JSON.parse(recordsJson) : [];

    const todayRecords = allRecords.filter(record => {
      const recordDate = new Date(record.prayerDate);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === today.getTime();
    });

    // Get or create today's progress
    const progressKey = STORAGE_KEYS.USER_PROGRESS(userId);
    const progressJson = await AsyncStorage.getItem(progressKey);
    const allProgress: UserProgress[] = progressJson ? JSON.parse(progressJson) : [];

    let todayProgress = allProgress.find(p => p.progressDate === todayStr);

    if (!todayProgress) {
      todayProgress = {
        userId,
        progressDate: todayStr,
        prayersCompleted: todayRecords.length,
        currentStreak: 1,
        longestStreak: 1,
        experiencePoints: 0,
      };
      allProgress.push(todayProgress);
    } else {
      todayProgress.prayersCompleted = todayRecords.length;
    }

    // Calculate streak
    const streak = await calculateStreak(userId, today);
    todayProgress.currentStreak = streak.currentStreak;
    todayProgress.longestStreak = Math.max(
      todayProgress.longestStreak,
      streak.currentStreak,
    );

    await AsyncStorage.setItem(progressKey, JSON.stringify(allProgress));
  } catch (error) {
    console.error('Error updating user progress:', error);
  }
}

/**
 * Calculate current streak for a user
 */
async function calculateStreak(
  userId: string,
  currentDate: Date,
): Promise<{currentStreak: number}> {
  try {
    let streak = 0;
    let checkDate = new Date(currentDate);
    checkDate.setHours(0, 0, 0, 0);

    // Get prayer records
    const recordsKey = STORAGE_KEYS.PRAYER_RECORDS(userId);
    const recordsJson = await AsyncStorage.getItem(recordsKey);
    const allRecords: PrayerRecord[] = recordsJson ? JSON.parse(recordsJson) : [];

    // Check if today has at least one prayer
    const todayRecords = allRecords.filter(record => {
      const recordDate = new Date(record.prayerDate);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === checkDate.getTime();
    });

    if (todayRecords.length === 0) {
      return {currentStreak: 0};
    }

    // Count consecutive days with at least one prayer
    while (true) {
      const dayRecords = allRecords.filter(record => {
        const recordDate = new Date(record.prayerDate);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === checkDate.getTime();
      });

      if (dayRecords.length > 0) {
        streak++;
        // Move to previous day
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {currentStreak: streak};
  } catch (error) {
    console.error('Error calculating streak:', error);
    return {currentStreak: 0};
  }
}

/**
 * Get prayer records for a user
 */
export async function getPrayerRecords(
  userId: string,
  startDate?: Date,
  endDate?: Date,
): Promise<PrayerRecord[]> {
  try {
    const recordsKey = STORAGE_KEYS.PRAYER_RECORDS(userId);
    const recordsJson = await AsyncStorage.getItem(recordsKey);
    const allRecords: PrayerRecord[] = recordsJson ? JSON.parse(recordsJson) : [];

    if (!startDate && !endDate) {
      return allRecords.sort(
        (a, b) => new Date(b.prayerDate).getTime() - new Date(a.prayerDate).getTime(),
      );
    }

    return allRecords
      .filter(record => {
        const recordDate = new Date(record.prayerDate);
        if (startDate && recordDate < startDate) return false;
        if (endDate && recordDate > endDate) return false;
        return true;
      })
      .sort((a, b) => new Date(b.prayerDate).getTime() - new Date(a.prayerDate).getTime());
  } catch (error) {
    console.error('Error getting prayer records:', error);
    return [];
  }
}

/**
 * Get user's longest streak
 */
export async function getLongestStreak(userId: string): Promise<number> {
  try {
    const progressKey = STORAGE_KEYS.USER_PROGRESS(userId);
    const progressJson = await AsyncStorage.getItem(progressKey);
    const allProgress: UserProgress[] = progressJson ? JSON.parse(progressJson) : [];

    if (allProgress.length === 0) return 0;

    return Math.max(...allProgress.map(p => p.longestStreak));
  } catch (error) {
    console.error('Error getting longest streak:', error);
    return 0;
  }
}
