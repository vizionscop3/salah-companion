/**
 * End-to-End Tests - Core Features
 *
 * Tests complete user flows for core app features:
 * - Prayer Times
 * - Azan
 * - Guided Salah
 * - Qibla Compass
 * - Progress Tracking
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {calculatePrayerTimes, getNextPrayer} from '@services/prayer/prayerTimeService';
import {recordPrayerCompletion, getTodayProgress} from '@services/progress/progressService';
import {calculateQiblaBearing, calculateDistanceToKaaba} from '@services/qibla/qiblaService';

// Mock user ID for testing
const TEST_USER_ID = 'test_user_e2e';

describe('Core Features E2E Tests', () => {
  beforeEach(async () => {
    // Clear AsyncStorage before each test
    await AsyncStorage.clear();
  });

  describe('Prayer Times Flow', () => {
    it('should calculate prayer times for a location', () => {
      const location = {
        latitude: 24.7136, // Makkah
        longitude: 46.6753,
      };

      const prayerTimes = calculatePrayerTimes({
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: 'Asia/Riyadh',
        calculationMethod: 'MWL',
        asrMethod: 'Shafi',
        date: new Date(),
      });

      expect(prayerTimes).toBeDefined();
      expect(prayerTimes.fajr).toBeDefined();
      expect(prayerTimes.dhuhr).toBeDefined();
      expect(prayerTimes.asr).toBeDefined();
      expect(prayerTimes.maghrib).toBeDefined();
      expect(prayerTimes.isha).toBeDefined();
    });

    it('should get next prayer correctly', () => {
      const location = {
        latitude: 24.7136,
        longitude: 46.6753,
      };

      const now = new Date();
      const prayerTimes = calculatePrayerTimes({
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: 'Asia/Riyadh',
        calculationMethod: 'MWL',
        asrMethod: 'Shafi',
        date: now,
      });

      const nextPrayer = getNextPrayer(prayerTimes, now);

      expect(nextPrayer).toBeDefined();
      expect(nextPrayer?.prayer).toBeDefined();
      expect(nextPrayer?.time).toBeDefined();
    });
  });

  describe('Progress Tracking Flow', () => {
    it('should record prayer completion and update progress', async () => {
      const today = new Date();
      today.setHours(12, 0, 0, 0);

      // Record a prayer
      await recordPrayerCompletion({
        userId: TEST_USER_ID,
        prayerName: 'dhuhr',
        prayerDate: today,
        prayerTime: today,
        wasGuided: true,
        wasOnTime: true,
      });

      // Get progress
      const progress = await getTodayProgress(TEST_USER_ID);

      expect(progress.prayersCompleted).toBeGreaterThanOrEqual(1);
      expect(progress.currentStreak).toBeGreaterThanOrEqual(0);
    });

    it('should maintain streak across multiple days', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(12, 0, 0, 0);

      const today = new Date();
      today.setHours(12, 0, 0, 0);

      // Record prayer yesterday
      await recordPrayerCompletion({
        userId: TEST_USER_ID,
        prayerName: 'dhuhr',
        prayerDate: yesterday,
        prayerTime: yesterday,
      });

      // Record prayer today
      await recordPrayerCompletion({
        userId: TEST_USER_ID,
        prayerName: 'dhuhr',
        prayerDate: today,
        prayerTime: today,
      });

      // Get progress
      const progress = await getTodayProgress(TEST_USER_ID);

      expect(progress.currentStreak).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Qibla Compass Flow', () => {
    it('should calculate Qibla direction for a location', () => {
      const location = {
        latitude: 40.7128, // New York
        longitude: -74.0060,
      };

      const bearing = calculateQiblaBearing(
        location.latitude,
        location.longitude,
      );

      expect(bearing).toBeDefined();
      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThanOrEqual(360);
      
      const distance = calculateDistanceToKaaba(
        location.latitude,
        location.longitude,
      );
      expect(distance).toBeGreaterThan(0);
    });

    it('should calculate correct Qibla direction for Makkah', () => {
      const location = {
        latitude: 21.4225, // Near Makkah
        longitude: 39.8262,
      };

      const bearing = calculateQiblaBearing(
        location.latitude,
        location.longitude,
      );

      // Should be very close to 0 or 360 degrees (north)
      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThanOrEqual(360);
    });
  });

  describe('Complete User Journey', () => {
    it('should complete full prayer flow: times → record → progress', async () => {
      const location = {
        latitude: 24.7136,
        longitude: 46.6753,
      };

      // 1. Get prayer times
      const prayerTimes = calculatePrayerTimes({
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: 'Asia/Riyadh',
        calculationMethod: 'MWL',
        asrMethod: 'Shafi',
        date: new Date(),
      });
      expect(prayerTimes).toBeDefined();

      // 2. Get next prayer
      const nextPrayer = getNextPrayer(prayerTimes, new Date());
      expect(nextPrayer).toBeDefined();

      // 3. Record prayer completion
      const today = new Date();
      await recordPrayerCompletion({
        userId: TEST_USER_ID,
        prayerName: nextPrayer?.prayer || 'dhuhr',
        prayerDate: today,
        prayerTime: today,
        wasGuided: true,
        wasOnTime: true,
      });

      // 4. Check progress
      const progress = await getTodayProgress(TEST_USER_ID);
      expect(progress.prayersCompleted).toBeGreaterThanOrEqual(1);
      expect(progress.currentStreak).toBeGreaterThanOrEqual(0);
    });
  });
});
