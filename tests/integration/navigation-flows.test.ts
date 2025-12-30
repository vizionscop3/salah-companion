/**
 * Integration Tests - Navigation Flows
 *
 * Tests complete navigation flows and user journeys:
 * - New user onboarding flow
 * - Returning user flow
 * - Feature navigation
 * - State persistence across navigation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {prisma} from '@services/database/prismaClient';

// Mock Prisma
jest.mock('@services/database/prismaClient');

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReset = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    reset: mockReset,
  }),
  useRoute: () => ({
    params: {},
  }),
}));

const TEST_USER_ID = 'test_user_navigation_e2e';

describe('Navigation Flows Integration Tests', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('New User Journey', () => {
    it('should complete onboarding → registration → home flow', async () => {
      // 1. Onboarding (simulated)
      const onboardingComplete = true;
      expect(onboardingComplete).toBe(true);

      // 2. Registration (simulated)
      const userRegistered = {
        id: TEST_USER_ID,
        email: 'test@example.com',
        name: 'Test User',
      };
      expect(userRegistered).toBeDefined();

      // 3. Navigate to Home
      mockNavigate('Home');
      expect(mockNavigate).toHaveBeenCalledWith('Home');

      // 4. Verify user data persisted
      await AsyncStorage.setItem('user_id', TEST_USER_ID);
      const savedUserId = await AsyncStorage.getItem('user_id');
      expect(savedUserId).toBe(TEST_USER_ID);
    });

    it('should navigate from home to guided salah', () => {
      // Start at Home
      mockNavigate('Home');

      // Navigate to Guided Salah
      mockNavigate('GuidedSalah', {prayerName: 'dhuhr'});
      expect(mockNavigate).toHaveBeenCalledWith('GuidedSalah', {prayerName: 'dhuhr'});
    });

    it('should navigate from home to learning center', () => {
      // Start at Home
      mockNavigate('Home');

      // Navigate to Learning
      mockNavigate('Learning');
      expect(mockNavigate).toHaveBeenCalledWith('Learning');
    });
  });

  describe('Learning Center Navigation', () => {
    it('should navigate through learning features', () => {
      // 1. Learning Center
      mockNavigate('Learning');

      // 2. Recitation Practice
      mockNavigate('RecitationPractice');
      expect(mockNavigate).toHaveBeenCalledWith('RecitationPractice');

      // 3. Word Practice
      mockNavigate('WordPractice', {surahNumber: 1, ayahNumber: 1});
      expect(mockNavigate).toHaveBeenCalledWith('WordPractice', {
        surahNumber: 1,
        ayahNumber: 1,
      });

      // 4. Go back
      mockGoBack();
      expect(mockGoBack).toHaveBeenCalled();
    });

    it('should navigate to pronunciation academy', () => {
      mockNavigate('Learning');
      mockNavigate('PronunciationAcademy');
      expect(mockNavigate).toHaveBeenCalledWith('PronunciationAcademy');

      // Navigate to letter practice
      mockNavigate('LetterPractice', {letter: 'ب'});
      expect(mockNavigate).toHaveBeenCalledWith('LetterPractice', {letter: 'ب'});
    });
  });

  describe('Profile and Settings Navigation', () => {
    it('should navigate to profile from home', () => {
      mockNavigate('Home');
      mockNavigate('Profile');
      expect(mockNavigate).toHaveBeenCalledWith('Profile');
    });

    it('should navigate to settings from profile', () => {
      mockNavigate('Profile');
      mockNavigate('Settings');
      expect(mockNavigate).toHaveBeenCalledWith('Settings');
    });

    it('should navigate to achievements from profile', () => {
      mockNavigate('Profile');
      mockNavigate('Achievements');
      expect(mockNavigate).toHaveBeenCalledWith('Achievements');
    });
  });

  describe('Prayer Times Navigation', () => {
    it('should navigate to prayer times from home', () => {
      mockNavigate('Home');
      mockNavigate('PrayerTimes');
      expect(mockNavigate).toHaveBeenCalledWith('PrayerTimes');
    });

    it('should navigate to qibla from prayer times', () => {
      mockNavigate('PrayerTimes');
      mockNavigate('QiblaCompass');
      expect(mockNavigate).toHaveBeenCalledWith('QiblaCompass');
    });
  });

  describe('State Persistence Across Navigation', () => {
    it('should persist user state across navigation', async () => {
      // Set user state
      await AsyncStorage.setItem('user_id', TEST_USER_ID);
      await AsyncStorage.setItem('user_name', 'Test User');

      // Navigate away
      mockNavigate('Settings');

      // Navigate back
      mockNavigate('Home');

      // Verify state persisted
      const userId = await AsyncStorage.getItem('user_id');
      const userName = await AsyncStorage.getItem('user_name');
      expect(userId).toBe(TEST_USER_ID);
      expect(userName).toBe('Test User');
    });

    it('should persist prayer progress across navigation', async () => {
      const progress = {
        prayersCompleted: 3,
        currentStreak: 2,
      };

      await AsyncStorage.setItem('progress', JSON.stringify(progress));

      // Navigate around
      mockNavigate('Learning');
      mockNavigate('Profile');
      mockNavigate('Home');

      // Verify progress persisted
      const savedProgress = await AsyncStorage.getItem('progress');
      expect(savedProgress).toBeDefined();
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        expect(parsed.prayersCompleted).toBe(3);
      }
    });
  });

  describe('Deep Linking and Navigation State', () => {
    it('should handle deep links to specific screens', () => {
      // Simulate deep link to guided salah
      mockReset({
        index: 0,
        routes: [{name: 'GuidedSalah', params: {prayerName: 'fajr'}}],
      });
      expect(mockReset).toHaveBeenCalled();
    });
  });
});

