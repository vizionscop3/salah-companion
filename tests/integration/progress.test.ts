/**
 * Progress Integration Tests
 *
 * Tests the integration between progress service and AsyncStorage
 * NOTE: Updated to use AsyncStorage instead of Prisma
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  recordPrayerCompletion,
  getTodayProgress,
  getPrayerRecords,
} from '@services/progress/progressService';

describe('Progress Integration', () => {
  const mockUserId = 'test-user-123';
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  beforeEach(async () => {
    // Clear AsyncStorage before each test
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('Complete prayer flow', () => {
    it('records prayer and updates progress in sequence', async () => {
      // Record prayer
      await recordPrayerCompletion({
        userId: mockUserId,
        prayerName: 'fajr',
        prayerDate: today,
        prayerTime: new Date(today.setHours(6, 0, 0, 0)),
      });

      // Verify prayer was recorded
      const progress = await getTodayProgress(mockUserId);
      expect(progress.prayersCompleted).toBe(1);
      expect(progress.currentStreak).toBeGreaterThanOrEqual(1);

      // Verify prayer record exists
      const records = await getPrayerRecords(mockUserId);
      expect(records.length).toBeGreaterThan(0);
      expect(records[0].prayerName).toBe('fajr');
    });

    it('tracks multiple prayers in a day', async () => {
      // Record first prayer
      await recordPrayerCompletion({
        userId: mockUserId,
        prayerName: 'fajr',
        prayerDate: today,
        prayerTime: new Date(today.setHours(6, 0, 0, 0)),
      });

      // Record second prayer
      await recordPrayerCompletion({
        userId: mockUserId,
        prayerName: 'dhuhr',
        prayerDate: today,
        prayerTime: new Date(today.setHours(12, 30, 0, 0)),
      });

      // Record third prayer
      await recordPrayerCompletion({
        userId: mockUserId,
        prayerName: 'asr',
        prayerDate: today,
        prayerTime: new Date(today.setHours(15, 30, 0, 0)),
      });

      // Verify progress shows 3 prayers
      const progress = await getTodayProgress(mockUserId);
      expect(progress.prayersCompleted).toBe(3);
    });
  });

  describe('Streak calculation', () => {
    it('maintains streak for consecutive days', async () => {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Record prayer yesterday
      await recordPrayerCompletion({
        userId: mockUserId,
        prayerName: 'fajr',
        prayerDate: yesterday,
        prayerTime: new Date(yesterday.setHours(6, 0, 0, 0)),
      });

      // Record prayer today
      await recordPrayerCompletion({
        userId: mockUserId,
        prayerName: 'fajr',
        prayerDate: today,
        prayerTime: new Date(today.setHours(6, 0, 0, 0)),
      });

      // Verify streak is maintained
      const progress = await getTodayProgress(mockUserId);
      expect(progress.currentStreak).toBeGreaterThanOrEqual(2);
    });
  });
});

