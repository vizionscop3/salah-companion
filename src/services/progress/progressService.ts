/**
 * Progress Service
 *
 * Manages user prayer progress, streaks, and achievements.
 */

import {prisma} from '@services/database/prismaClient';
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

/**
 * Record a prayer completion
 */
export async function recordPrayerCompletion(
  data: PrayerCompletionData,
): Promise<void> {
  try {
    // Create prayer record
    await prisma.prayerRecord.create({
      data: {
        userId: data.userId,
        prayerName: data.prayerName,
        prayerDate: data.prayerDate,
        prayerTime: data.prayerTime,
        wasGuided: data.wasGuided ?? true,
        wasOnTime: data.wasOnTime,
        rakAhsCompleted: data.rakAhsCompleted ?? 0,
        sunnahBefore: data.sunnahBefore ?? false,
        sunnahAfter: data.sunnahAfter ?? false,
        notes: data.notes,
      },
    });

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
    const {checkAndUnlockAchievements} = await import(
      '@services/achievements/achievementService'
    );
    await checkAndUnlockAchievements(userId);
  } catch (error) {
    // Silently fail - achievements are not critical
    console.warn('Failed to check achievements:', error);
  }
}

/**
 * Get today's prayer progress for a user
 */
export async function getTodayProgress(userId: string): Promise<ProgressStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get today's prayer records
  const todayRecords = await prisma.prayerRecord.findMany({
    where: {
      userId,
      prayerDate: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  // Get user progress
  const userProgress = await prisma.userProgress.findFirst({
    where: {
      userId,
      progressDate: today,
    },
  });

  // Get achievement count
  const achievementCount = await prisma.userAchievement.count({
    where: {
      userId,
    },
  });

  // Calculate today's completed prayers (should be 5 for full day)
  const prayersCompleted = todayRecords.length;
  const totalPrayers = 5; // Fajr, Dhuhr, Asr, Maghrib, Isha

  // Get enhanced analytics (non-blocking - don't fail if these fail)
  let recitationStats: ProgressStats['recitationStats'];
  let pronunciationStats: ProgressStats['pronunciationStats'];

  try {
    const {getRecitationSummary} = await import('./recitationAnalyticsService');
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
    const {getPronunciationSummary} = await import('./pronunciationAnalyticsService');
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
    currentStreak: userProgress?.currentStreak ?? 0,
    longestStreak: userProgress?.longestStreak ?? 0,
    achievements: achievementCount,
    todayProgress: prayersCompleted,
    recitationStats,
    pronunciationStats,
  };
}

/**
 * Get user progress for a date range
 */
export async function getUserProgress(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  return await prisma.userProgress.findMany({
    where: {
      userId,
      progressDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      progressDate: 'desc',
    },
  });
}

/**
 * Update user progress after prayer completion
 */
async function updateUserProgress(userId: string, prayerDate: Date): Promise<void> {
  const today = new Date(prayerDate);
  today.setHours(0, 0, 0, 0);

  // Get today's prayer records
  const todayRecords = await prisma.prayerRecord.findMany({
    where: {
      userId,
      prayerDate: today,
    },
  });

  // Get or create today's progress
  const todayProgress = await prisma.userProgress.upsert({
    where: {
      userId_progressDate: {
        userId,
        progressDate: today,
      },
    },
    create: {
      userId,
      progressDate: today,
      prayersCompleted: todayRecords.length,
      currentStreak: 1,
      longestStreak: 1,
    },
    update: {
      prayersCompleted: todayRecords.length,
    },
  });

  // Calculate streak
  const streak = await calculateStreak(userId, today);

  // Update streak in progress
  await prisma.userProgress.update({
    where: {
      id: todayProgress.id,
    },
    data: {
      currentStreak: streak.currentStreak,
      longestStreak: Math.max(todayProgress.longestStreak, streak.currentStreak),
    },
  });
}

/**
 * Calculate current streak for a user
 */
async function calculateStreak(
  userId: string,
  currentDate: Date,
): Promise<{currentStreak: number}> {
  let streak = 0;
  let checkDate = new Date(currentDate);
  checkDate.setHours(0, 0, 0, 0);

  // Check if today has at least one prayer
  const todayRecords = await prisma.prayerRecord.findFirst({
    where: {
      userId,
      prayerDate: checkDate,
    },
  });

  if (!todayRecords) {
    // If today has no prayers, streak is 0
    return {currentStreak: 0};
  }

  // Count consecutive days with at least one prayer
  while (true) {
    const dayRecords = await prisma.prayerRecord.findFirst({
      where: {
        userId,
        prayerDate: checkDate,
      },
    });

    if (dayRecords) {
      streak++;
      // Move to previous day
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {currentStreak: streak};
}

/**
 * Get prayer records for a user
 */
export async function getPrayerRecords(
  userId: string,
  startDate?: Date,
  endDate?: Date,
) {
  const where: any = {userId};

  if (startDate || endDate) {
    where.prayerDate = {};
    if (startDate) {
      where.prayerDate.gte = startDate;
    }
    if (endDate) {
      where.prayerDate.lte = endDate;
    }
  }

  return await prisma.prayerRecord.findMany({
    where,
    orderBy: {
      prayerDate: 'desc',
    },
  });
}

/**
 * Get user's longest streak
 */
export async function getLongestStreak(userId: string): Promise<number> {
  const progress = await prisma.userProgress.findFirst({
    where: {
      userId,
    },
    orderBy: {
      longestStreak: 'desc',
    },
    select: {
      longestStreak: true,
    },
  });

  return progress?.longestStreak ?? 0;
}

