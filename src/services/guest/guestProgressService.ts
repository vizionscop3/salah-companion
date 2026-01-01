/**
 * Guest Progress Service
 *
 * Handles progress saving for guest/anonymous users.
 * Progress is saved locally and can be migrated to premium account later.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_STORAGE_KEYS = {
  GUEST_ID: '@salah_companion:guest_id',
  GUEST_PROGRESS: '@salah_companion:guest_progress',
  GUEST_PRAYER_RECORDS: '@salah_companion:guest_prayer_records',
  GUEST_ACHIEVEMENTS: '@salah_companion:guest_achievements',
};

export interface GuestProgress {
  guestId: string;
  prayersCompleted: number;
  currentStreak: number;
  longestStreak: number;
  achievements: string[];
  lastPrayerDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GuestPrayerRecord {
  id: string;
  prayer: string;
  prayerDate: Date;
  completed: boolean;
  notes?: string;
}

/**
 * Get or create guest ID
 */
export async function getGuestId(): Promise<string> {
  try {
    let guestId = await AsyncStorage.getItem(GUEST_STORAGE_KEYS.GUEST_ID);
    if (!guestId) {
      guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(GUEST_STORAGE_KEYS.GUEST_ID, guestId);
    }
    return guestId;
  } catch (error) {
    console.error('Error getting guest ID:', error);
    // Fallback guest ID
    return `guest_fallback_${Date.now()}`;
  }
}

/**
 * Get guest progress
 */
export async function getGuestProgress(): Promise<GuestProgress | null> {
  try {
    const guestId = await getGuestId();
    const progressJson = await AsyncStorage.getItem(GUEST_STORAGE_KEYS.GUEST_PROGRESS);
    
    if (progressJson) {
      return JSON.parse(progressJson);
    }

    // Create initial progress
    const initialProgress: GuestProgress = {
      guestId,
      prayersCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      achievements: [],
      lastPrayerDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveGuestProgress(initialProgress);
    return initialProgress;
  } catch (error) {
    console.error('Error getting guest progress:', error);
    return null;
  }
}

/**
 * Save guest progress
 */
export async function saveGuestProgress(progress: GuestProgress): Promise<void> {
  try {
    const updatedProgress = {
      ...progress,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(
      GUEST_STORAGE_KEYS.GUEST_PROGRESS,
      JSON.stringify(updatedProgress),
    );
  } catch (error) {
    console.error('Error saving guest progress:', error);
  }
}

/**
 * Record guest prayer completion
 */
export async function recordGuestPrayer(
  prayer: string,
  completed: boolean = true,
): Promise<void> {
  try {
    const progress = await getGuestProgress();
    if (!progress) return;

    // Update prayer records
    const recordsJson = await AsyncStorage.getItem(GUEST_STORAGE_KEYS.GUEST_PRAYER_RECORDS);
    const records: GuestPrayerRecord[] = recordsJson ? JSON.parse(recordsJson) : [];

    if (completed) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if already recorded today
      const todayRecord = records.find(
        (r) =>
          r.prayer === prayer &&
          new Date(r.prayerDate).setHours(0, 0, 0, 0) === today.getTime(),
      );

      if (!todayRecord) {
        records.push({
          id: `record_${Date.now()}`,
          prayer,
          prayerDate: today,
          completed: true,
        });

        // Update progress
        progress.prayersCompleted += 1;
        progress.lastPrayerDate = today.toISOString();

        // Calculate streak
        if (progress.lastPrayerDate) {
          const lastDate = new Date(progress.lastPrayerDate);
          const todayDate = new Date();
          todayDate.setHours(0, 0, 0, 0);
          lastDate.setHours(0, 0, 0, 0);

          const daysDiff = Math.floor(
            (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
          );

          if (daysDiff === 1) {
            progress.currentStreak += 1;
          } else if (daysDiff > 1) {
            progress.currentStreak = 1;
          } else if (daysDiff === 0 && progress.currentStreak === 0) {
            progress.currentStreak = 1;
          }

          progress.longestStreak = Math.max(progress.longestStreak, progress.currentStreak);
        }

        await AsyncStorage.setItem(
          GUEST_STORAGE_KEYS.GUEST_PRAYER_RECORDS,
          JSON.stringify(records),
        );
        await saveGuestProgress(progress);
      }
    }
  } catch (error) {
    console.error('Error recording guest prayer:', error);
  }
}

/**
 * Get guest prayer records
 */
export async function getGuestPrayerRecords(): Promise<GuestPrayerRecord[]> {
  try {
    const recordsJson = await AsyncStorage.getItem(GUEST_STORAGE_KEYS.GUEST_PRAYER_RECORDS);
    return recordsJson ? JSON.parse(recordsJson) : [];
  } catch (error) {
    console.error('Error getting guest prayer records:', error);
    return [];
  }
}

/**
 * Migrate guest progress to user account
 */
export async function migrateGuestProgressToUser(userId: string): Promise<boolean> {
  try {
    const progress = await getGuestProgress();
    const records = await getGuestPrayerRecords();
    const achievementsJson = await AsyncStorage.getItem(GUEST_STORAGE_KEYS.GUEST_ACHIEVEMENTS);
    const achievements: string[] = achievementsJson ? JSON.parse(achievementsJson) : [];

    if (!progress) {
      return false;
    }

    // TODO: Migrate to user account via API
    // For now, we'll keep guest data and mark it for migration
    await AsyncStorage.setItem(`@salah_companion:migrate_${userId}`, JSON.stringify({
      progress,
      records,
      achievements,
      migrated: false,
    }));

    return true;
  } catch (error) {
    console.error('Error migrating guest progress:', error);
    return false;
  }
}

/**
 * Clear guest data (after migration or logout)
 */
export async function clearGuestData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      GUEST_STORAGE_KEYS.GUEST_ID,
      GUEST_STORAGE_KEYS.GUEST_PROGRESS,
      GUEST_STORAGE_KEYS.GUEST_PRAYER_RECORDS,
      GUEST_STORAGE_KEYS.GUEST_ACHIEVEMENTS,
    ]);
  } catch (error) {
    console.error('Error clearing guest data:', error);
  }
}

