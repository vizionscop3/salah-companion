/**
 * Memorization Service
 *
 * Tracks surah memorization progress with spaced repetition scheduling.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MemorizationProgress {
  surahNumber: number;
  surahName: string;
  status: 'not_started' | 'learning' | 'reviewing' | 'mastered';
  progress: number; // 0-100
  lastReviewed: Date | null;
  nextReview: Date | null;
  reviewCount: number;
  masteryLevel: number; // 0-5 (spaced repetition level)
  timesPracticed: number;
  lastPracticed: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewSchedule {
  surahNumber: number;
  reviewDate: Date;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

/**
 * Spaced repetition intervals (in days)
 * Based on SM-2 algorithm principles
 */
const SPACED_REPETITION_INTERVALS = [1, 3, 7, 14, 30, 60, 90, 180];

/**
 * Get user's memorization progress
 */
export async function getMemorizationProgress(
  userId: string,
): Promise<MemorizationProgress[]> {
  try {
    const progressKey = `@salah_companion:memorization_progress:${userId}`;
    const progressJson = await AsyncStorage.getItem(progressKey);
    const progress: MemorizationProgress[] = progressJson
      ? JSON.parse(progressJson).map((p: any) => ({
          ...p,
          lastReviewed: p.lastReviewed ? new Date(p.lastReviewed) : null,
          nextReview: p.nextReview ? new Date(p.nextReview) : null,
          lastPracticed: p.lastPracticed ? new Date(p.lastPracticed) : null,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        }))
      : [];

    return progress;
  } catch (error) {
    console.error('Error getting memorization progress:', error);
    return [];
  }
}

/**
 * Get memorization progress for a specific surah
 */
export async function getSurahMemorizationProgress(
  userId: string,
  surahNumber: number,
): Promise<MemorizationProgress | null> {
  const allProgress = await getMemorizationProgress(userId);
  return allProgress.find(p => p.surahNumber === surahNumber) || null;
}

/**
 * Start memorizing a surah
 */
export async function startMemorizingSurah(
  userId: string,
  surahNumber: number,
  surahName: string,
): Promise<void> {
  try {
    const progress = await getMemorizationProgress(userId);
    const existing = progress.find(p => p.surahNumber === surahNumber);

    if (existing) {
      // Already started
      return;
    }

    const newProgress: MemorizationProgress = {
      surahNumber,
      surahName,
      status: 'learning',
      progress: 0,
      lastReviewed: null,
      nextReview: new Date(), // Review tomorrow
      reviewCount: 0,
      masteryLevel: 0,
      timesPracticed: 0,
      lastPracticed: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    progress.push(newProgress);
    await saveMemorizationProgress(userId, progress);
  } catch (error) {
    console.error('Error starting memorization:', error);
    throw error;
  }
}

/**
 * Record a memorization practice session
 */
export async function recordMemorizationPractice(
  userId: string,
  surahNumber: number,
  accuracy: number, // 0-100
): Promise<void> {
  try {
    const progress = await getMemorizationProgress(userId);
    const surahProgress = progress.find(p => p.surahNumber === surahNumber);

    if (!surahProgress) {
      // Auto-start if not started
      await startMemorizingSurah(userId, surahNumber, `Surah ${surahNumber}`);
      const updatedProgress = await getMemorizationProgress(userId);
      const updated = updatedProgress.find(p => p.surahNumber === surahNumber);
      if (!updated) {
        throw new Error('Failed to create memorization progress');
      }
      return recordMemorizationPractice(userId, surahNumber, accuracy);
    }

    const now = new Date();
    surahProgress.timesPracticed += 1;
    surahProgress.lastPracticed = now;
    surahProgress.lastReviewed = now;
    surahProgress.updatedAt = now;

    // Update progress based on accuracy
    if (accuracy >= 90) {
      // Excellent - advance mastery level
      surahProgress.masteryLevel = Math.min(
        surahProgress.masteryLevel + 1,
        5,
      );
      surahProgress.progress = Math.min(surahProgress.progress + 10, 100);
    } else if (accuracy >= 70) {
      // Good - maintain or slightly advance
      surahProgress.progress = Math.min(surahProgress.progress + 5, 100);
    } else {
      // Needs work - don't advance
      surahProgress.progress = Math.max(surahProgress.progress - 5, 0);
    }

    // Update status based on progress
    if (surahProgress.progress >= 100 && surahProgress.masteryLevel >= 3) {
      surahProgress.status = 'mastered';
    } else if (surahProgress.progress >= 50) {
      surahProgress.status = 'reviewing';
    } else {
      surahProgress.status = 'learning';
    }

    // Calculate next review using spaced repetition
    surahProgress.reviewCount += 1;
    const intervalDays =
      SPACED_REPETITION_INTERVALS[
        Math.min(surahProgress.masteryLevel, SPACED_REPETITION_INTERVALS.length - 1)
      ];
    surahProgress.nextReview = new Date(
      now.getTime() + intervalDays * 24 * 60 * 60 * 1000,
    );

    await saveMemorizationProgress(userId, progress);
  } catch (error) {
    console.error('Error recording memorization practice:', error);
    throw error;
  }
}

/**
 * Get surahs due for review
 */
export async function getSurahsDueForReview(
  userId: string,
): Promise<ReviewSchedule[]> {
  try {
    const progress = await getMemorizationProgress(userId);
    const now = new Date();
    const dueSurahs: ReviewSchedule[] = [];

    for (const p of progress) {
      if (p.nextReview && p.nextReview <= now && p.status !== 'not_started') {
        const daysOverdue = Math.floor(
          (now.getTime() - p.nextReview.getTime()) / (24 * 60 * 60 * 1000),
        );

        let priority: 'high' | 'medium' | 'low' = 'medium';
        if (daysOverdue > 7) {
          priority = 'high';
        } else if (daysOverdue < 2) {
          priority = 'low';
        }

        dueSurahs.push({
          surahNumber: p.surahNumber,
          reviewDate: p.nextReview,
          priority,
          reason:
            daysOverdue > 0
              ? `${daysOverdue} days overdue`
              : 'Due for review',
        });
      }
    }

    // Sort by priority and date
    dueSurahs.sort((a, b) => {
      const priorityOrder = {high: 0, medium: 1, low: 2};
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.reviewDate.getTime() - b.reviewDate.getTime();
    });

    return dueSurahs;
  } catch (error) {
    console.error('Error getting surahs due for review:', error);
    return [];
  }
}

/**
 * Get memorization statistics
 */
export async function getMemorizationStats(userId: string): Promise<{
  totalSurahs: number;
  learning: number;
  reviewing: number;
  mastered: number;
  totalPracticeSessions: number;
  currentStreak: number;
  longestStreak: number;
}> {
  try {
    const progress = await getMemorizationProgress(userId);

    const learning = progress.filter(p => p.status === 'learning').length;
    const reviewing = progress.filter(p => p.status === 'reviewing').length;
    const mastered = progress.filter(p => p.status === 'mastered').length;
    const totalPracticeSessions = progress.reduce(
      (sum, p) => sum + p.timesPracticed,
      0,
    );

    // Calculate streak (consecutive days with practice)
    const streakKey = `@salah_companion:memorization_streak:${userId}`;
    const streakData = await AsyncStorage.getItem(streakKey);
    const streak = streakData ? JSON.parse(streakData) : {current: 0, longest: 0};

    return {
      totalSurahs: progress.length,
      learning,
      reviewing,
      mastered,
      totalPracticeSessions,
      currentStreak: streak.current || 0,
      longestStreak: streak.longest || 0,
    };
  } catch (error) {
    console.error('Error getting memorization stats:', error);
    return {
      totalSurahs: 0,
      learning: 0,
      reviewing: 0,
      mastered: 0,
      totalPracticeSessions: 0,
      currentStreak: 0,
      longestStreak: 0,
    };
  }
}

/**
 * Save memorization progress
 */
async function saveMemorizationProgress(
  userId: string,
  progress: MemorizationProgress[],
): Promise<void> {
  const progressKey = `@salah_companion:memorization_progress:${userId}`;
  await AsyncStorage.setItem(progressKey, JSON.stringify(progress));
}

/**
 * Update memorization streak
 */
export async function updateMemorizationStreak(userId: string): Promise<void> {
  try {
    const streakKey = `@salah_companion:memorization_streak:${userId}`;
    const lastPracticeKey = `@salah_companion:memorization_last_practice:${userId}`;

    const streakData = await AsyncStorage.getItem(streakKey);
    const lastPracticeData = await AsyncStorage.getItem(lastPracticeKey);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastPractice = lastPracticeData
      ? new Date(lastPracticeData)
      : null;
    const lastPracticeDate = lastPractice
      ? new Date(
          lastPractice.getFullYear(),
          lastPractice.getMonth(),
          lastPractice.getDate(),
        )
      : null;

    const streak = streakData ? JSON.parse(streakData) : {current: 0, longest: 0};

    if (!lastPracticeDate || lastPracticeDate.getTime() === today.getTime()) {
      // Same day - don't update streak
      return;
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (
      lastPracticeDate &&
      lastPracticeDate.getTime() === yesterday.getTime()
    ) {
      // Consecutive day - increment streak
      streak.current = (streak.current || 0) + 1;
      streak.longest = Math.max(streak.longest || 0, streak.current);
    } else {
      // Streak broken
      streak.current = 1;
    }

    await AsyncStorage.setItem(streakKey, JSON.stringify(streak));
    await AsyncStorage.setItem(lastPracticeKey, today.toISOString());
  } catch (error) {
    console.error('Error updating memorization streak:', error);
  }
}

