/**
 * Ramadan Service
 *
 * Manages Ramadan-specific features including Tarawih tracking and special UI.
 */

import {isIslamicHoliday, gregorianToHijri} from '@services/calendar/islamicCalendarService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TarawihSession {
  id: string;
  date: Date;
  rakats: number; // Usually 8 or 20
  surahsRecited: number[];
  completed: boolean;
  notes?: string;
}

export interface RamadanProgress {
  day: number;
  totalDays: number;
  fastsCompleted: number;
  tarawihSessions: number;
  quranRead: number; // Pages or juz
  charityGiven: number; // Amount or count
  lastUpdated: Date;
}

/**
 * Check if current date is during Ramadan
 */
export function isRamadan(date: Date = new Date()): boolean {
  const hijriDate = gregorianToHijri(date);
  return hijriDate.month === 9; // Ramadan is the 9th month
}

/**
 * Get current Ramadan day
 */
export function getRamadanDay(date: Date = new Date()): number | null {
  if (!isRamadan(date)) {
    return null;
  }

  const hijriDate = gregorianToHijri(date);
  return hijriDate.day;
}

/**
 * Get total Ramadan days (29 or 30)
 */
export function getRamadanTotalDays(year?: number): number {
  // In production, this would calculate based on actual lunar calendar
  // For now, return 30 as default
  return 30;
}

/**
 * Get user's Ramadan progress
 */
export async function getRamadanProgress(
  userId: string,
): Promise<RamadanProgress | null> {
  try {
    if (!isRamadan()) {
      return null;
    }

    const progressKey = `@salah_companion:ramadan_progress:${userId}`;
    const progressData = await AsyncStorage.getItem(progressKey);

    if (progressData) {
      const parsed = JSON.parse(progressData);
      return {
        ...parsed,
        lastUpdated: new Date(parsed.lastUpdated),
      };
    }

    // Initialize new progress
    const day = getRamadanDay();
    const progress: RamadanProgress = {
      day: day || 1,
      totalDays: getRamadanTotalDays(),
      fastsCompleted: 0,
      tarawihSessions: 0,
      quranRead: 0,
      charityGiven: 0,
      lastUpdated: new Date(),
    };

    await saveRamadanProgress(userId, progress);
    return progress;
  } catch (error) {
    console.error('Error getting Ramadan progress:', error);
    return null;
  }
}

/**
 * Record a fast
 */
export async function recordFast(userId: string, date: Date = new Date()): Promise<void> {
  try {
    if (!isRamadan(date)) {
      throw new Error('Not during Ramadan');
    }

    const progress = await getRamadanProgress(userId);
    if (!progress) {
      throw new Error('Failed to get Ramadan progress');
    }

    progress.fastsCompleted += 1;
    progress.lastUpdated = new Date();
    await saveRamadanProgress(userId, progress);
  } catch (error) {
    console.error('Error recording fast:', error);
    throw error;
  }
}

/**
 * Record a Tarawih session
 */
export async function recordTarawihSession(
  userId: string,
  rakats: number = 8,
  surahsRecited: number[] = [],
  notes?: string,
): Promise<string> {
  try {
    if (!isRamadan()) {
      throw new Error('Not during Ramadan');
    }

    const sessionId = `tarawih_${Date.now()}`;
    const session: TarawihSession = {
      id: sessionId,
      date: new Date(),
      rakats,
      surahsRecited,
      completed: true,
      notes,
    };

    // Save session
    const sessionsKey = `@salah_companion:tarawih_sessions:${userId}`;
    const sessionsData = await AsyncStorage.getItem(sessionsKey);
    const sessions: TarawihSession[] = sessionsData
      ? JSON.parse(sessionsData).map((s: any) => ({
          ...s,
          date: new Date(s.date),
        }))
      : [];

    sessions.push(session);
    await AsyncStorage.setItem(
      sessionsKey,
      JSON.stringify(sessions.map(s => ({...s, date: s.date.toISOString()}))),
    );

    // Update progress
    const progress = await getRamadanProgress(userId);
    if (progress) {
      progress.tarawihSessions += 1;
      progress.lastUpdated = new Date();
      await saveRamadanProgress(userId, progress);
    }

    return sessionId;
  } catch (error) {
    console.error('Error recording Tarawih session:', error);
    throw error;
  }
}

/**
 * Get Tarawih sessions
 */
export async function getTarawihSessions(
  userId: string,
): Promise<TarawihSession[]> {
  try {
    const sessionsKey = `@salah_companion:tarawih_sessions:${userId}`;
    const sessionsData = await AsyncStorage.getItem(sessionsKey);

    if (sessionsData) {
      const parsed = JSON.parse(sessionsData);
      return parsed.map((s: any) => ({
        ...s,
        date: new Date(s.date),
      }));
    }

    return [];
  } catch (error) {
    console.error('Error getting Tarawih sessions:', error);
    return [];
  }
}

/**
 * Update Quran reading progress
 */
export async function updateQuranReading(
  userId: string,
  pages: number,
): Promise<void> {
  try {
    const progress = await getRamadanProgress(userId);
    if (progress) {
      progress.quranRead += pages;
      progress.lastUpdated = new Date();
      await saveRamadanProgress(userId, progress);
    }
  } catch (error) {
    console.error('Error updating Quran reading:', error);
    throw error;
  }
}

/**
 * Save Ramadan progress
 */
async function saveRamadanProgress(
  userId: string,
  progress: RamadanProgress,
): Promise<void> {
  try {
    const progressKey = `@salah_companion:ramadan_progress:${userId}`;
    await AsyncStorage.setItem(
      progressKey,
      JSON.stringify({
        ...progress,
        lastUpdated: progress.lastUpdated.toISOString(),
      }),
    );
  } catch (error) {
    console.error('Error saving Ramadan progress:', error);
    throw error;
  }
}

/**
 * Get Ramadan statistics
 */
export async function getRamadanStats(userId: string): Promise<{
  fastsCompleted: number;
  tarawihSessions: number;
  quranRead: number;
  charityGiven: number;
  completionPercentage: number;
}> {
  try {
    const progress = await getRamadanProgress(userId);
    if (!progress) {
      return {
        fastsCompleted: 0,
        tarawihSessions: 0,
        quranRead: 0,
        charityGiven: 0,
        completionPercentage: 0,
      };
    }

    const completionPercentage = Math.round(
      (progress.fastsCompleted / progress.totalDays) * 100,
    );

    return {
      fastsCompleted: progress.fastsCompleted,
      tarawihSessions: progress.tarawihSessions,
      quranRead: progress.quranRead,
      charityGiven: progress.charityGiven,
      completionPercentage,
    };
  } catch (error) {
    console.error('Error getting Ramadan stats:', error);
    return {
      fastsCompleted: 0,
      tarawihSessions: 0,
      quranRead: 0,
      charityGiven: 0,
      completionPercentage: 0,
    };
  }
}

