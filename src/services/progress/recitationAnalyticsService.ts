/**
 * Recitation Analytics Service
 *
 * Provides analytics and insights for recitation practice sessions.
 * Tracks per-surah/ayah statistics, practice frequency, and accuracy trends.
 * 
 * NOTE: Prisma cannot run in React Native (Node.js only).
 * This service uses AsyncStorage for local storage.
 * TODO: Replace with proper backend API integration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SurahAnalytics {
  surahNumber: number;
  surahName: string;
  timesPracticed: number;
  averageAccuracy: number;
  bestAccuracy: number;
  lastPracticedAt: Date | null;
  improvementTrend: number; // Percentage change in accuracy over time
  totalPracticeMinutes: number;
}

export interface AyahAnalytics {
  surahNumber: number;
  ayahNumber: number;
  timesPracticed: number;
  averageAccuracy: number;
  bestAccuracy: number;
  lastPracticedAt: Date | null;
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

export interface RecitationSummary {
  totalPractices: number;
  totalPracticeMinutes: number;
  averageAccuracy: number;
  mostPracticedSurah: SurahAnalytics | null;
  practiceFrequency: PracticeFrequency;
  accuracyTrend: AccuracyTrend[];
  surahsPracticed: number; // Unique surahs practiced
  ayahsPracticed: number; // Unique ayahs practiced
}

/**
 * Get analytics for a specific surah
 */
export async function getSurahAnalytics(
  userId: string,
  surahNumber: number,
): Promise<SurahAnalytics | null> {
  try {
    // Get all practices from AsyncStorage
    const practicesKey = `@salah_companion:recitation_practices:${userId}`;
    const practicesJson = await AsyncStorage.getItem(practicesKey);
    const allPractices: any[] = practicesJson ? JSON.parse(practicesJson) : [];

    // Filter practices for this surah
    const practices = allPractices.filter(p => {
      if (p.practiceMode && !['ayah', 'surah'].includes(p.practiceMode)) {
        return false;
      }
      if (p.feedbackData && typeof p.feedbackData === 'object') {
        const feedback = p.feedbackData as any;
        return feedback.surahNumber === surahNumber;
      }
      return false;
    }).sort((a, b) => {
      const dateA = new Date(a.practiceDate || 0).getTime();
      const dateB = new Date(b.practiceDate || 0).getTime();
      return dateB - dateA;
    });

    // Filter practices for this surah
    const surahPractices = practices;

  if (surahPractices.length === 0) {
    return null;
  }

  const accuracies = surahPractices
    .map(p => p.accuracyScore)
    .filter((score): score is number => score !== null && score !== undefined)
    .map(score => Number(score));

  const averageAccuracy =
    accuracies.length > 0
      ? accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length
      : 0;

  const bestAccuracy = accuracies.length > 0 ? Math.max(...accuracies) : 0;

  // Calculate improvement trend (compare first half vs second half)
    const sortedPractices = [...surahPractices].sort(
      (a, b) => new Date(a.practiceDate || 0).getTime() - new Date(b.practiceDate || 0).getTime(),
    );
  const midpoint = Math.floor(sortedPractices.length / 2);
  const firstHalf = sortedPractices.slice(0, midpoint);
  const secondHalf = sortedPractices.slice(midpoint);

  const firstHalfAvg =
    firstHalf
      .map(p => p.accuracyScore)
      .filter((score): score is number => score !== null && score !== undefined)
      .map(score => Number(score))
      .reduce((sum, acc, _, arr) => sum + acc / arr.length, 0) || 0;

  const secondHalfAvg =
    secondHalf
      .map(p => p.accuracyScore)
      .filter((score): score is number => score !== null && score !== undefined)
      .map(score => Number(score))
      .reduce((sum, acc, _, arr) => sum + acc / arr.length, 0) || 0;

  const improvementTrend =
    firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;

  const totalMinutes = surahPractices.reduce(
    (sum, p) => sum + (p.durationSeconds || 0) / 60,
    0,
  );

    return {
      surahNumber,
      surahName: `Surah ${surahNumber}`, // You'd fetch actual name from surah table
      timesPracticed: surahPractices.length,
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      bestAccuracy: Math.round(bestAccuracy * 100) / 100,
      lastPracticedAt: surahPractices[0]?.practiceDate ? new Date(surahPractices[0].practiceDate) : null,
      improvementTrend: Math.round(improvementTrend * 100) / 100,
      totalPracticeMinutes: Math.round(totalMinutes * 10) / 10,
    };
  } catch (error) {
    console.error('Error getting surah analytics:', error);
    return null;
  }
}

/**
 * Get analytics for all practiced surahs
 */
export async function getAllSurahAnalytics(
  userId: string,
): Promise<SurahAnalytics[]> {
  try {
    const practicesKey = `@salah_companion:recitation_practices:${userId}`;
    const practicesJson = await AsyncStorage.getItem(practicesKey);
    const allPractices: any[] = practicesJson ? JSON.parse(practicesJson) : [];

    // Filter practices for ayah/surah mode
    const practices = allPractices
      .filter(p => p.practiceMode && ['ayah', 'surah'].includes(p.practiceMode))
      .sort((a, b) => {
        const dateA = new Date(a.practiceDate || 0).getTime();
        const dateB = new Date(b.practiceDate || 0).getTime();
        return dateB - dateA;
      });

  // Group by surah number
  const surahMap = new Map<number, typeof practices>();

  practices.forEach(practice => {
    if (practice.feedbackData && typeof practice.feedbackData === 'object') {
      const feedback = practice.feedbackData as any;
      const surahNum = feedback.surahNumber;
      if (surahNum) {
        if (!surahMap.has(surahNum)) {
          surahMap.set(surahNum, []);
        }
        surahMap.get(surahNum)!.push(practice);
      }
    }
  });

  const analytics: SurahAnalytics[] = [];

  for (const [surahNumber, surahPractices] of surahMap.entries()) {
    const accuracies = surahPractices
      .map(p => p.accuracyScore)
      .filter((score): score is number => score !== null && score !== undefined)
      .map(score => Number(score));

    const averageAccuracy =
      accuracies.length > 0
        ? accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length
        : 0;

    const bestAccuracy = accuracies.length > 0 ? Math.max(...accuracies) : 0;

    const sortedPractices = [...surahPractices].sort(
      (a, b) => new Date(a.practiceDate || 0).getTime() - new Date(b.practiceDate || 0).getTime(),
    );
    const midpoint = Math.floor(sortedPractices.length / 2);
    const firstHalf = sortedPractices.slice(0, midpoint);
    const secondHalf = sortedPractices.slice(midpoint);

    const firstHalfAvg =
      firstHalf
        .map(p => p.accuracyScore)
        .filter((score): score is number => score !== null && score !== undefined)
        .map(score => Number(score))
        .reduce((sum, acc, _, arr) => sum + acc / arr.length, 0) || 0;

    const secondHalfAvg =
      secondHalf
        .map(p => p.accuracyScore)
        .filter((score): score is number => score !== null && score !== undefined)
        .map(score => Number(score))
        .reduce((sum, acc, _, arr) => sum + acc / arr.length, 0) || 0;

    const improvementTrend =
      firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;

    const totalMinutes = surahPractices.reduce(
      (sum, p) => sum + (p.durationSeconds || 0) / 60,
      0,
    );

    analytics.push({
      surahNumber,
      surahName: `Surah ${surahNumber}`,
      timesPracticed: surahPractices.length,
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      bestAccuracy: Math.round(bestAccuracy * 100) / 100,
      lastPracticedAt: surahPractices[0]?.practiceDate || null,
      improvementTrend: Math.round(improvementTrend * 100) / 100,
      totalPracticeMinutes: Math.round(totalMinutes * 10) / 10,
    });
  }

  return analytics.sort((a, b) => b.timesPracticed - a.timesPracticed);
  } catch (error) {
    console.error('Error getting all surah analytics:', error);
    return [];
  }
}

/**
 * Get practice frequency statistics
 */
export async function getPracticeFrequency(
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

    const practicesKey = `@salah_companion:recitation_practices:${userId}`;
    const practicesJson = await AsyncStorage.getItem(practicesKey);
    const practices: any[] = practicesJson ? JSON.parse(practicesJson) : [];

    const daily = practices.filter(p => {
      const practiceDate = new Date(p.practiceDate || 0);
      return practiceDate >= sevenDaysAgo;
    }).length;

    const weekly = practices.filter(p => {
      const practiceDate = new Date(p.practiceDate || 0);
      return practiceDate >= fourWeeksAgo;
    }).length;

    const monthly = practices.filter(p => {
      const practiceDate = new Date(p.practiceDate || 0);
      return practiceDate >= twelveMonthsAgo;
    }).length;

    return {
      daily,
      weekly,
      monthly,
    };
  } catch (error) {
    console.error('Error getting practice frequency:', error);
    return {
      daily: 0,
      weekly: 0,
      monthly: 0,
    };
  }
}

/**
 * Get accuracy trend over time
 */
export async function getAccuracyTrend(
  userId: string,
  days: number = 30,
): Promise<AccuracyTrend[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const practicesKey = `@salah_companion:recitation_practices:${userId}`;
    const practicesJson = await AsyncStorage.getItem(practicesKey);
    const allPractices: any[] = practicesJson ? JSON.parse(practicesJson) : [];

    const practices = allPractices
      .filter(p => {
        const practiceDate = new Date(p.practiceDate || 0);
        return practiceDate >= startDate && p.accuracyScore != null;
      })
      .sort((a, b) => {
        const dateA = new Date(a.practiceDate || 0).getTime();
        const dateB = new Date(b.practiceDate || 0).getTime();
        return dateA - dateB;
      });

  // Group by date
  const dateMap = new Map<string, {accuracies: number[]; count: number}>();

  practices.forEach(practice => {
    const dateKey = new Date(practice.practiceDate || 0).toISOString().split('T')[0];
    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, {accuracies: [], count: 0});
    }
    const entry = dateMap.get(dateKey)!;
    if (practice.accuracyScore !== null) {
      entry.accuracies.push(Number(practice.accuracyScore));
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
    console.error('Error getting accuracy trend:', error);
    return [];
  }
}

/**
 * Get comprehensive recitation summary
 */
export async function getRecitationSummary(
  userId: string,
): Promise<RecitationSummary> {
  try {
    // Get recitation practices from AsyncStorage
    const practicesKey = `@salah_companion:recitation_practices:${userId}`;
    const practicesJson = await AsyncStorage.getItem(practicesKey);
    const practices: any[] = practicesJson ? JSON.parse(practicesJson) : [];

    const accuracies = practices
      .map(p => p.accuracyScore)
      .filter((score): score is number => score !== null && score !== undefined)
      .map(score => Number(score));

    const averageAccuracy =
      accuracies.length > 0
        ? accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length
        : 0;

    const totalMinutes = practices.reduce(
      (sum, p) => sum + (p.durationSeconds || 0) / 60,
      0,
    );

    // Get unique surahs and ayahs practiced
    const surahSet = new Set<number>();
    const ayahSet = new Set<string>();

    practices.forEach(practice => {
      if (practice.feedbackData && typeof practice.feedbackData === 'object') {
        const feedback = practice.feedbackData as any;
        if (feedback.surahNumber) {
          surahSet.add(feedback.surahNumber);
          if (feedback.ayahNumber) {
            ayahSet.add(`${feedback.surahNumber}:${feedback.ayahNumber}`);
          }
        }
      }
    });

    const [practiceFrequency, accuracyTrend, allSurahAnalytics] = await Promise.all([
      getPracticeFrequency(userId).catch(() => ({
        daily: 0,
        weekly: 0,
        monthly: 0,
      })),
      getAccuracyTrend(userId, 30).catch(() => []),
      getAllSurahAnalytics(userId).catch(() => []),
    ]);

    const mostPracticedSurah =
      allSurahAnalytics.length > 0 ? allSurahAnalytics[0] : null;

    return {
      totalPractices: practices.length,
      totalPracticeMinutes: Math.round(totalMinutes * 10) / 10,
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      mostPracticedSurah,
      practiceFrequency,
      accuracyTrend,
      surahsPracticed: surahSet.size,
      ayahsPracticed: ayahSet.size,
    };
  } catch (error) {
    console.error('Error getting recitation summary:', error);
    // Return default values on error
    return {
      totalPractices: 0,
      totalPracticeMinutes: 0,
      averageAccuracy: 0,
      mostPracticedSurah: null,
      practiceFrequency: {
        daily: 0,
        weekly: 0,
        monthly: 0,
      },
      accuracyTrend: [],
      surahsPracticed: 0,
      ayahsPracticed: 0,
    };
  }
}
