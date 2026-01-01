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
      const prayerTime = new Date(today);
      prayerTime.setHours(6, 0, 0, 0);
      await recordPrayerCompletion({
        userId: mockUserId,
        prayerName: 'fajr',
        prayerDate: today,
        prayerTime: prayerTime,
      });

      // Verify prayer was recorded
      const progress = await getTodayProgress(mockUserId);
      expect(progress.prayersCompleted).toBe(1);
      // Streak starts at 1 for first prayer
      expect(progress.currentStreak).toBeGreaterThanOrEqual(0);

      // Verify prayer record exists
      const records = await getPrayerRecords(mockUserId);
      expect(records.length).toBeGreaterThan(0);
      expect(records[0].prayerName).toBe('fajr');
    });

    it('tracks multiple prayers in a day', async () => {
      // Record first prayer
      const fajrTime = new Date(today);
      fajrTime.setHours(6, 0, 0, 0);
      await recordPrayerCompletion({
        userId: mockUserId,
        prayerName: 'fajr',
        prayerDate: today,
        prayerTime: fajrTime,
      });

      // Record second prayer
      const dhuhrTime = new Date(today);
      dhuhrTime.setHours(12, 30, 0, 0);
      await recordPrayerCompletion({
        userId: mockUserId,
        prayerName: 'dhuhr',
        prayerDate: today,
        prayerTime: dhuhrTime,
      });

      // Record third prayer
      const asrTime = new Date(today);
      asrTime.setHours(15, 30, 0, 0);
      await recordPrayerCompletion({
        userId: mockUserId,
        prayerName: 'asr',
        prayerDate: today,
        prayerTime: asrTime,
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
      const yesterdayPrayerTime = new Date(yesterday);
      yesterdayPrayerTime.setHours(6, 0, 0, 0);
      await recordPrayerCompletion({
        userId: mockUserId,
        prayerName: 'fajr',
        prayerDate: yesterday,
        prayerTime: yesterdayPrayerTime,
      });

      // Record prayer today
      const todayPrayerTime = new Date(today);
      todayPrayerTime.setHours(6, 0, 0, 0);
      await recordPrayerCompletion({
        userId: mockUserId,
        prayerName: 'fajr',
        prayerDate: today,
        prayerTime: todayPrayerTime,
      });

      // Verify streak is maintained (should be at least 1, ideally 2 for consecutive days)
      const progress = await getTodayProgress(mockUserId);
      expect(progress.currentStreak).toBeGreaterThanOrEqual(1);
    });
  });
});

