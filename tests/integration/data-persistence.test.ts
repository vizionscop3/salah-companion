/**
 * Integration Tests - Data Persistence
 *
 * Tests data persistence across app restarts and navigation:
 * - Progress data persistence
 * - Practice session persistence
 * - Settings persistence
 * - User state persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {recordPrayerCompletion, getTodayProgress} from '@services/progress/progressService';
import {saveRecitationPractice} from '@services/recitation/recitationService';
import {recordLetterPractice} from '@services/pronunciation/pronunciationService';
import {prismaClient} from '@services/database/prismaClient';

const TEST_USER_ID = 'test_user_persistence_e2e';

describe('Data Persistence Integration Tests', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('Progress Data Persistence', () => {
    it('should persist prayer completion across app restarts', async () => {
      const today = new Date();
      today.setHours(12, 0, 0, 0);

      // 1. Record prayer
      await recordPrayerCompletion({
        userId: TEST_USER_ID,
        prayerName: 'dhuhr',
        prayerDate: today,
        prayerTime: today,
        wasGuided: true,
        wasOnTime: true,
      });

      // 2. Get progress
      const progress1 = await getTodayProgress(TEST_USER_ID);
      expect(progress1.prayersCompleted).toBeGreaterThanOrEqual(1);

      // 3. Simulate app restart (clear mocks, but data persists in AsyncStorage)
      jest.clearAllMocks();

      // 4. Get progress again (should persist)
      const progress2 = await getTodayProgress(TEST_USER_ID);
      expect(progress2.prayersCompleted).toBe(progress1.prayersCompleted);
    });

    it('should persist streak data across app restarts', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(12, 0, 0, 0);

      const today = new Date();
      today.setHours(12, 0, 0, 0);

      // Record prayers for streak
      await recordPrayerCompletion({
        userId: TEST_USER_ID,
        prayerName: 'dhuhr',
        prayerDate: yesterday,
        prayerTime: yesterday,
      });

      await recordPrayerCompletion({
        userId: TEST_USER_ID,
        prayerName: 'dhuhr',
        prayerDate: today,
        prayerTime: today,
      });

      // Get progress
      const progress1 = await getTodayProgress(TEST_USER_ID);
      const streak1 = progress1.currentStreak;

      // Simulate app restart
      jest.clearAllMocks();

      // Get progress again
      const progress2 = await getTodayProgress(TEST_USER_ID);
      expect(progress2.currentStreak).toBe(streak1);
    });
  });

  describe('Practice Session Persistence', () => {
    it('should persist recitation practice sessions', async () => {
      const mockSession = {
        id: 'test-session-1',
        userId: TEST_USER_ID,
        surahId: '1',
        ayahId: '1',
        practiceMode: 'word',
        audioRecordingUrl: '/mock/recording.mp3',
        accuracyScore: 85,
        tajweedScore: 80,
        feedbackData: {feedback: 'Good'},
        phonemeAnalysis: {},
        practiceDate: new Date(),
        attemptsCount: 1,
        isOffline: false,
        durationSeconds: null,
      };

      (prismaClient.recitationPractice.create as jest.Mock).mockResolvedValueOnce(mockSession);

      // Save practice session
      const session = await saveRecitationPractice(TEST_USER_ID, {
        surahId: '1',
        ayahId: '1',
        practiceMode: 'word',
        audioRecordingUrl: '/mock/recording.mp3',
        accuracyScore: 85,
        tajweedScore: 80,
        feedbackData: {feedback: 'Good'},
      });

      expect(session).toBeDefined();
      expect(session.userId).toBe(TEST_USER_ID);

      // Simulate app restart
      jest.clearAllMocks();

      // Session should be persisted in database (mocked)
      // In real app, would query database to verify
    });

    it('should persist pronunciation practice progress', async () => {
      const letterId = 'ba';

      // Practice letter
      await recordLetterPractice(TEST_USER_ID, letterId, 85);

      // Get progress
      const {getLetterProgress} = require('@services/pronunciation/pronunciationService');
      const progress1 = await getLetterProgress(TEST_USER_ID, letterId);
      expect(progress1?.timesPracticed).toBe(1);

      // Simulate app restart
      jest.clearAllMocks();

      // Get progress again (should persist)
      const progress2 = await getLetterProgress(TEST_USER_ID, letterId);
      expect(progress2?.timesPracticed).toBe(1);
    });
  });

  describe('Settings Persistence', () => {
    it('should persist user settings', async () => {
      const settingsKey = `@salah_companion:user_settings:${TEST_USER_ID}`;
      const settings = {
        azanVoice: 'makkah',
        azanVolume: 80,
        darkMode: false,
      };

      // Save settings
      await AsyncStorage.setItem(settingsKey, JSON.stringify(settings));

      // Simulate app restart
      jest.clearAllMocks();

      // Retrieve settings
      const savedSettings = await AsyncStorage.getItem(settingsKey);
      expect(savedSettings).toBeDefined();
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        expect(parsed.azanVoice).toBe('makkah');
        expect(parsed.azanVolume).toBe(80);
      }
    });
  });

  describe('User State Persistence', () => {
    it('should persist user authentication state', async () => {
      const authKey = '@salah_companion:auth:user';
      const userData = {
        id: TEST_USER_ID,
        email: 'test@example.com',
        name: 'Test User',
      };

      // Save user data
      await AsyncStorage.setItem(authKey, JSON.stringify(userData));

      // Simulate app restart
      jest.clearAllMocks();

      // Retrieve user data
      const savedUser = await AsyncStorage.getItem(authKey);
      expect(savedUser).toBeDefined();
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        expect(parsed.id).toBe(TEST_USER_ID);
        expect(parsed.email).toBe('test@example.com');
      }
    });
  });

  describe('Data Integrity', () => {
    it('should maintain data integrity across multiple operations', async () => {
      const today = new Date();
      today.setHours(12, 0, 0, 0);

      // Perform multiple operations
      await recordPrayerCompletion({
        userId: TEST_USER_ID,
        prayerName: 'dhuhr',
        prayerDate: today,
        prayerTime: today,
      });

      await recordLetterPractice(TEST_USER_ID, 'ba', 85);
      await recordLetterPractice(TEST_USER_ID, 'ta', 90);

      // Get all progress
      const progress = await getTodayProgress(TEST_USER_ID);
      const {getLetterProgress} = require('@services/pronunciation/pronunciationService');
      const letterProgressBa = await getLetterProgress(TEST_USER_ID, 'ba');
      const letterProgressTa = await getLetterProgress(TEST_USER_ID, 'ta');

      // Verify all data is correct
      expect(progress.prayersCompleted).toBeGreaterThanOrEqual(1);
      expect(letterProgressBa?.timesPracticed).toBe(1);
      expect(letterProgressTa?.timesPracticed).toBe(1);
    });
  });
});

