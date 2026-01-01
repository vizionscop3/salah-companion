/**
 * Pronunciation Analytics Service
 *
 * Provides analytics and insights for pronunciation practice sessions.
 * Tracks letter mastery, accuracy trends, and practice frequency.
 * 
 * NOTE: Prisma cannot run in React Native (Node.js only).
 * This service uses AsyncStorage for local storage.
 * TODO: Replace with proper backend API integration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LetterAnalytics {
  letterId: string;
  letterName: string;
  isLearned: boolean;
  timesPracticed: number;
  averageAccuracy: number;
  bestAccuracy: number;
  lastPracticedAt: Date | null;
  masteredAt: Date | null;
  improvementTrend: number; // Percentage change in accuracy over time
}

export interface PronunciationSummary {
  totalLetters: number;
  lettersLearned: number;
  lettersInProgress: number;
  averageAccuracy: number;
  totalPracticeSessions: number;
  practiceFrequency: PracticeFrequency;
  accuracyTrend: AccuracyTrend[];
  masteryProgress: number; // Percentage of letters mastered
}

export interface PracticeFrequency {
  daily: number; // Practices in last 7 days
  weekly: number; // Practices in last 4 weeks
  monthly: number; // Practices in last 12 months
}

export interface AccuracyTrend {
  date: Date;
  averageAccuracy: number;
  practiceCount: number;
}

/**
 * Get analytics for all letters
 */
export async function getAllLetterAnalytics(
  userId: string,
): Promise<LetterAnalytics[]> {
  try {
    const progressKey = `@salah_companion:pronunciation_progress:${userId}`;
    const progressJson = await AsyncStorage.getItem(progressKey);
    const progressRecords: any[] = progressJson ? JSON.parse(progressJson) : [];

    // Sort by lastPracticedAt descending
    progressRecords.sort((a, b) => {
      const dateA = new Date(a.lastPracticedAt || 0).getTime();
      const dateB = new Date(b.lastPracticedAt || 0).getTime();
      return dateB - dateA;
    });

  const analytics: LetterAnalytics[] = [];

  for (const record of progressRecords) {
    const recordTyped = record as any;
    // Calculate improvement trend from practice history
    // For now, we'll use the accuracy score as a proxy
    // In a full implementation, you'd track historical accuracy per practice
    const improvementTrend = recordTyped.accuracyScore
      ? Number(recordTyped.accuracyScore) > 0
        ? Number(recordTyped.accuracyScore) // Simplified - would calculate from history
        : 0
      : 0;

    analytics.push({
      letterId: recordTyped.letterId,
      letterName: recordTyped.letterId, // You'd fetch actual name from letters table
      isLearned: recordTyped.isLearned,
      timesPracticed: recordTyped.timesPracticed,
      averageAccuracy: recordTyped.accuracyScore
        ? Math.round(Number(recordTyped.accuracyScore) * 100) / 100
        : 0,
      bestAccuracy: recordTyped.accuracyScore
        ? Math.round(Number(recordTyped.accuracyScore) * 100) / 100
        : 0, // Would track best separately in full implementation
      lastPracticedAt: recordTyped.lastPracticedAt,
      masteredAt: recordTyped.masteredAt,
      improvementTrend: Math.round(improvementTrend * 100) / 100,
    });
  }

  return analytics.sort((a, b) => {
    // Sort by learned status, then by times practiced
    if (a.isLearned !== b.isLearned) {
      return a.isLearned ? -1 : 1;
    }
    return b.timesPracticed - a.timesPracticed;
  });
  } catch (error) {
    console.error('Error getting all letter analytics:', error);
    return [];
  }
}

/**
 * Get analytics for a specific letter
 */
export async function getLetterAnalytics(
  userId: string,
  letterId: string,
): Promise<LetterAnalytics | null> {
  try {
    const progressKey = `@salah_companion:pronunciation_progress:${userId}`;
    const progressJson = await AsyncStorage.getItem(progressKey);
    const progressRecords: any[] = progressJson ? JSON.parse(progressJson) : [];

    const record = progressRecords.find((r: any) => r.letterId === letterId);

    if (!record) {
      return null;
    }

  const improvementTrend = record.accuracyScore
    ? Number(record.accuracyScore) > 0
      ? Number(record.accuracyScore)
      : 0
    : 0;

  return {
    letterId: record.letterId,
    letterName: record.letterId,
    isLearned: record.isLearned,
    timesPracticed: record.timesPracticed,
    averageAccuracy: record.accuracyScore
      ? Math.round(Number(record.accuracyScore) * 100) / 100
      : 0,
    bestAccuracy: record.accuracyScore
      ? Math.round(Number(record.accuracyScore) * 100) / 100
      : 0,
    lastPracticedAt: record.lastPracticedAt,
    masteredAt: record.masteredAt,
    improvementTrend: Math.round(improvementTrend * 100) / 100,
  };
  } catch (error) {
    console.error('Error getting letter analytics:', error);
    return null;
  }
}

/**
 * Get practice frequency statistics
 */
export async function getPronunciationPracticeFrequency(
  userId: string,
): Promise<PracticeFrequency> {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourWeeksAgo = new Date(now);
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const progressKey = `@salah_companion:pronunciation_progress:${userId}`;
    const progressJson = await AsyncStorage.getItem(progressKey);
    const progressRecords: any[] = progressJson ? JSON.parse(progressJson) : [];

    const daily = progressRecords.filter((r: any) => {
      if (!r.lastPracticedAt || !r.timesPracticed || r.timesPracticed === 0) return false;
      const lastPracticed = new Date(r.lastPracticedAt);
      return lastPracticed >= sevenDaysAgo;
    }).length;

    const weekly = progressRecords.filter((r: any) => {
      if (!r.lastPracticedAt || !r.timesPracticed || r.timesPracticed === 0) return false;
      const lastPracticed = new Date(r.lastPracticedAt);
      return lastPracticed >= fourWeeksAgo;
    }).length;

    const monthly = progressRecords.filter((r: any) => {
      if (!r.lastPracticedAt || !r.timesPracticed || r.timesPracticed === 0) return false;
      const lastPracticed = new Date(r.lastPracticedAt);
      return lastPracticed >= twelveMonthsAgo;
    }).length;

    return {
      daily,
      weekly,
      monthly,
    };
  } catch (error) {
    console.error('Error getting pronunciation practice frequency:', error);
    return {
      daily: 0,
      weekly: 0,
      monthly: 0,
    };
  }
}

/**
 * Get accuracy trend over time
 * Note: This is simplified - in production, you'd track historical accuracy per practice session
 */
export async function getPronunciationAccuracyTrend(
  userId: string,
  days: number = 30,
): Promise<AccuracyTrend[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const progressKey = `@salah_companion:pronunciation_progress:${userId}`;
    const progressJson = await AsyncStorage.getItem(progressKey);
    const allRecords: any[] = progressJson ? JSON.parse(progressJson) : [];

    const progressRecords = allRecords
      .filter((r: any) => {
        if (!r.lastPracticedAt || r.accuracyScore == null) return false;
        const lastPracticed = new Date(r.lastPracticedAt);
        return lastPracticed >= startDate;
      })
      .sort((a: any, b: any) => {
        const dateA = new Date(a.lastPracticedAt || 0).getTime();
        const dateB = new Date(b.lastPracticedAt || 0).getTime();
        return dateA - dateB;
      });

  // Group by date
  const dateMap = new Map<string, {accuracies: number[]; count: number}>();

  progressRecords.forEach((record: any) => {
    if (record.lastPracticedAt && record.accuracyScore !== null) {
      const dateKey = new Date(record.lastPracticedAt).toISOString().split('T')[0];
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {accuracies: [], count: 0});
      }
      const entry = dateMap.get(dateKey)!;
      entry.accuracies.push(Number(record.accuracyScore));
      entry.count++;
    }
  });

  const trends: AccuracyTrend[] = [];

  for (const [dateKey, data] of dateMap.entries()) {
    const averageAccuracy =
      data.accuracies.length > 0
        ? data.accuracies.reduce((sum, acc) => sum + acc, 0) / data.accuracies.length
        : 0;

    trends.push({
      date: new Date(dateKey),
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      practiceCount: data.count,
    });
  }

  return trends.sort((a, b) => a.date.getTime() - b.date.getTime());
  } catch (error) {
    console.error('Error getting pronunciation accuracy trend:', error);
    return [];
  }
}

/**
 * Get comprehensive pronunciation summary
 */
export async function getPronunciationSummary(
  userId: string,
): Promise<PronunciationSummary> {
  try {
    // Get pronunciation progress from AsyncStorage
    const progressKey = `@salah_companion:pronunciation_progress:${userId}`;
    const progressJson = await AsyncStorage.getItem(progressKey);
    const progressRecords: any[] = progressJson ? JSON.parse(progressJson) : [];

    const learnedCount = progressRecords.filter((r: any) => r.isLearned).length;
    const inProgressCount = progressRecords.filter(
      (r: any) => !r.isLearned && r.timesPracticed > 0,
    ).length;

    const accuracies = progressRecords
      .map((r: any) => r.accuracyScore)
      .filter((score: any): score is number => score !== null && score !== undefined)
      .map((score: any) => Number(score));

    const averageAccuracy =
      accuracies.length > 0
        ? accuracies.reduce((sum: number, acc: number) => sum + acc, 0) / accuracies.length
        : 0;

    const totalSessions = progressRecords.reduce(
      (sum: number, r: any) => sum + (r.timesPracticed || 0),
      0,
    );

    // Assuming 28 letters total (standard Arabic alphabet)
    const totalLetters = 28;
    const masteryProgress = totalLetters > 0 ? (learnedCount / totalLetters) * 100 : 0;

    const [practiceFrequency, accuracyTrend] = await Promise.all([
      getPronunciationPracticeFrequency(userId).catch(() => ({
        daily: 0,
        weekly: 0,
        monthly: 0,
      })),
      getPronunciationAccuracyTrend(userId, 30).catch(() => []),
    ]);

    return {
      totalLetters,
      lettersLearned: learnedCount,
      lettersInProgress: inProgressCount,
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      totalPracticeSessions: totalSessions,
      practiceFrequency,
      accuracyTrend,
      masteryProgress: Math.round(masteryProgress * 100) / 100,
    };
  } catch (error) {
    console.error('Error getting pronunciation summary:', error);
    // Return default values on error
    return {
      totalLetters: 28,
      lettersLearned: 0,
      lettersInProgress: 0,
      averageAccuracy: 0,
      totalPracticeSessions: 0,
      practiceFrequency: {
        daily: 0,
        weekly: 0,
        monthly: 0,
      },
      accuracyTrend: [],
      masteryProgress: 0,
    };
  }
}
