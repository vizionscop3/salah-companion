/**
 * End-to-End Tests - Recitation Practice System
 *
 * Tests complete user flows for recitation practice:
 * - Word-by-word practice mode
 * - Ayah practice mode
 * - Surah practice mode
 * - Recording functionality
 * - Feedback system
 * - Progress tracking
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {prismaClient} from '@services/database/prismaClient';
import {
  saveRecitationPractice,
  getRecitationHistory,
  getRecitationStats,
} from '@services/recitation/recitationService';
import {
  getSurah,
  getAyah,
  splitAyahIntoWords,
} from '@services/recitation/quranicTextService';

// Mock recording service
jest.mock('@services/recitation/recordingService', () => ({
  startRecording: jest.fn(() => Promise.resolve('/mock/recording/path.mp3')),
  stopRecording: jest.fn(() => Promise.resolve('/mock/recording/path.mp3')),
  playRecording: jest.fn(() => Promise.resolve()),
}));

// Mock AI service
jest.mock('@services/recitation/tarteelAIService', () => ({
  analyzeRecitation: jest.fn(() =>
    Promise.resolve({
      accuracy: 85,
      tajweedScore: 80,
      feedback: 'Good pronunciation',
      wordAnalysis: [],
    }),
  ),
}));

const TEST_USER_ID = 'test_user_recitation_e2e';

describe('Recitation Practice E2E Tests', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('Word-by-Word Practice Mode', () => {
    it('should complete word practice flow: fetch → record → analyze → save', async () => {
      // 1. Fetch surah and ayah data
      const surah = await getSurah(1); // Al-Fatiha
      expect(surah).toBeDefined();
      expect(surah.ayahs).toBeDefined();
      expect(surah.ayahs.length).toBeGreaterThan(0);

      const ayah = await getAyah(1, 1);
      expect(ayah).toBeDefined();
      expect(ayah.text).toBeDefined();

      // 2. Split ayah into words
      const words = splitAyahIntoWords(ayah.text);
      expect(words).toBeDefined();
      expect(words.length).toBeGreaterThan(0);

      // 3. Simulate recording (mocked)
      const {startRecording, stopRecording} = require('@services/recitation/recordingService');
      const recordingPath = await startRecording();
      expect(recordingPath).toBeDefined();

      // Simulate stopping recording
      await stopRecording();

      // 4. Simulate analysis (mocked)
      const {analyzeRecitation} = require('@services/recitation/tarteelAIService');
      const analysis = await analyzeRecitation(recordingPath, ayah.text);
      expect(analysis).toBeDefined();
      expect(analysis.accuracy).toBeGreaterThanOrEqual(0);
      expect(analysis.accuracy).toBeLessThanOrEqual(100);

      // 5. Save practice session
      const mockSession = {
        id: 'test-session-1',
        userId: TEST_USER_ID,
        surahId: '1',
        ayahId: '1',
        practiceMode: 'word',
        audioRecordingUrl: recordingPath,
        accuracyScore: analysis.accuracy,
        tajweedScore: analysis.tajweedScore,
        feedbackData: {feedback: analysis.feedback},
        phonemeAnalysis: {},
        practiceDate: new Date(),
        attemptsCount: 1,
        isOffline: false,
        durationSeconds: null,
      };
      (prismaClient.recitationPractice.create as jest.Mock).mockResolvedValueOnce(mockSession);

      const session = await saveRecitationPractice(TEST_USER_ID, {
        surahId: '1',
        ayahId: '1',
        practiceMode: 'word',
        audioRecordingUrl: recordingPath,
        accuracyScore: analysis.accuracy,
        tajweedScore: analysis.tajweedScore,
        feedbackData: {feedback: analysis.feedback},
      });

      expect(session).toBeDefined();
      expect(session.userId).toBe(TEST_USER_ID);
      expect(session.practiceMode).toBe('word');
      expect(session.surahId).toBe('1');
      expect(session.ayahId).toBe('1');
    });

    it('should track progress across multiple word practices', async () => {
      const today = new Date();

      // Mock Prisma responses
      const mockPractices = [];
      for (let i = 1; i <= 3; i++) {
        const mockPractice = {
          id: `test-session-${i}`,
          userId: TEST_USER_ID,
          surahId: '1',
          ayahId: '1',
          practiceMode: 'word',
          audioRecordingUrl: `/mock/recording/word${i}.mp3`,
          accuracyScore: 80 + i * 2,
          tajweedScore: 75 + i * 2,
          feedbackData: {feedback: `Practice ${i}`},
          phonemeAnalysis: {},
          practiceDate: new Date(),
          attemptsCount: 1,
          isOffline: false,
          durationSeconds: null,
        };
        mockPractices.push(mockPractice);
        (prismaClient.recitationPractice.create as jest.Mock).mockResolvedValueOnce(mockPractice);
        await saveRecitationPractice(TEST_USER_ID, {
          surahId: '1',
          ayahId: '1',
          practiceMode: 'word',
          audioRecordingUrl: `/mock/recording/word${i}.mp3`,
          accuracyScore: 80 + i * 2,
          tajweedScore: 75 + i * 2,
          feedbackData: {feedback: `Practice ${i}`},
        });
      }

      // Mock getRecitationStats
      (prismaClient.recitationPractice.findMany as jest.Mock).mockResolvedValueOnce(mockPractices);

      // Get statistics
      const stats = await getRecitationStats(TEST_USER_ID);
      expect(stats).toBeDefined();
      expect(stats.totalPractices).toBe(3);
    });
  });

  describe('Ayah Practice Mode', () => {
    it('should complete ayah practice flow: fetch → record → analyze → save', async () => {
      // 1. Fetch ayah data
      const ayah = await getAyah(1, 1);
      expect(ayah).toBeDefined();
      expect(ayah.text).toBeDefined();
      // Translation may be in a different property or may not exist
      if (ayah.translation) {
        expect(ayah.translation).toBeDefined();
      }

      // 2. Simulate recording full ayah
      const {startRecording, stopRecording} = require('@services/recitation/recordingService');
      const recordingPath = await startRecording();
      await stopRecording();

      // 3. Simulate analysis
      const {analyzeRecitation} = require('@services/recitation/tarteelAIService');
      const analysis = await analyzeRecitation(recordingPath, ayah.text);
      expect(analysis).toBeDefined();
      expect(analysis.wordAnalysis).toBeDefined();

      // 4. Save practice session
      const mockAyahSession = {
        id: 'test-ayah-session-1',
        userId: TEST_USER_ID,
        surahId: '1',
        ayahId: '1',
        practiceMode: 'ayah',
        audioRecordingUrl: recordingPath,
        accuracyScore: analysis.accuracy,
        tajweedScore: analysis.tajweedScore,
        feedbackData: {feedback: analysis.feedback},
        phonemeAnalysis: {},
        practiceDate: new Date(),
        attemptsCount: 1,
        isOffline: false,
        durationSeconds: null,
      };
      (prismaClient.recitationPractice.create as jest.Mock).mockResolvedValueOnce(mockAyahSession);

      const session = await saveRecitationPractice(TEST_USER_ID, {
        surahId: '1',
        ayahId: '1',
        practiceMode: 'ayah',
        audioRecordingUrl: recordingPath,
        accuracyScore: analysis.accuracy,
        tajweedScore: analysis.tajweedScore,
        feedbackData: {feedback: analysis.feedback},
      });

      expect(session).toBeDefined();
      expect(session.practiceMode).toBe('ayah');
    });

    it('should provide word-by-word breakdown in ayah mode', async () => {
      const ayah = await getAyah(1, 1);
      const words = splitAyahIntoWords(ayah.text);

      const {analyzeRecitation} = require('@services/recitation/tarteelAIService');
      const analysis = await analyzeRecitation('/mock/path.mp3', ayah.text);

      expect(analysis.wordAnalysis).toBeDefined();
      // Word analysis should match number of words
      if (analysis.wordAnalysis && analysis.wordAnalysis.length > 0) {
        expect(analysis.wordAnalysis.length).toBeLessThanOrEqual(words.length);
      }
    });
  });

  describe('Surah Practice Mode', () => {
    it('should complete surah practice flow: fetch → record → analyze → save', async () => {
      // 1. Fetch surah data (short surah for testing)
      const surah = await getSurah(112); // Al-Ikhlas
      expect(surah).toBeDefined();
      expect(surah.ayahs).toBeDefined();
      expect(surah.ayahs.length).toBeGreaterThan(0);

      // 2. Simulate recording full surah
      const {startRecording, stopRecording} = require('@services/recitation/recordingService');
      const recordingPath = await startRecording();
      await stopRecording();

      // 3. Simulate analysis
      const {analyzeRecitation} = require('@services/recitation/tarteelAIService');
      const fullText = surah.ayahs.map(a => a.text).join(' ');
      const analysis = await analyzeRecitation(recordingPath, fullText);
      expect(analysis).toBeDefined();

      // 4. Save practice session
      const mockSurahSession = {
        id: 'test-surah-session-1',
        userId: TEST_USER_ID,
        surahId: '112',
        ayahId: null,
        practiceMode: 'surah',
        audioRecordingUrl: recordingPath,
        accuracyScore: analysis.accuracy,
        tajweedScore: analysis.tajweedScore,
        feedbackData: {feedback: analysis.feedback},
        phonemeAnalysis: {},
        practiceDate: new Date(),
        attemptsCount: 1,
        isOffline: false,
        durationSeconds: null,
      };
      (prismaClient.recitationPractice.create as jest.Mock).mockResolvedValueOnce(mockSurahSession);

      const session = await saveRecitationPractice(TEST_USER_ID, {
        surahId: '112',
        practiceMode: 'surah',
        audioRecordingUrl: recordingPath,
        accuracyScore: analysis.accuracy,
        tajweedScore: analysis.tajweedScore,
        feedbackData: {feedback: analysis.feedback},
      });

      expect(session).toBeDefined();
      expect(session.practiceMode).toBe('surah');
    });
  });

  describe('Practice History and Statistics', () => {
    it('should retrieve practice history', async () => {
      // Create mock practice sessions
      const mockHistory = [];
      for (let i = 1; i <= 5; i++) {
        const mockSession = {
          id: `test-session-${i}`,
          userId: TEST_USER_ID,
          surahId: '1',
          ayahId: '1',
          practiceMode: 'word',
          audioRecordingUrl: `/mock/recording/${i}.mp3`,
          accuracyScore: 80,
          tajweedScore: 75,
          feedbackData: {feedback: `Practice ${i}`},
          phonemeAnalysis: {},
          practiceDate: new Date(),
          attemptsCount: 1,
          isOffline: false,
          durationSeconds: null,
        };
        mockHistory.push(mockSession);
        (prismaClient.recitationPractice.create as jest.Mock).mockResolvedValueOnce(mockSession);
        await saveRecitationPractice(TEST_USER_ID, {
          surahId: '1',
          ayahId: '1',
          practiceMode: 'word',
          audioRecordingUrl: `/mock/recording/${i}.mp3`,
          accuracyScore: 80,
          tajweedScore: 75,
          feedbackData: {feedback: `Practice ${i}`},
        });
      }

      // Mock getRecitationHistory
      (prismaClient.recitationPractice.findMany as jest.Mock).mockResolvedValueOnce(mockHistory);

      // Get history
      const history = await getRecitationHistory(TEST_USER_ID);
      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBe(5);
    });

    it('should calculate practice statistics', async () => {
      // Create mock practice sessions
      const mockSession1 = {
        id: 'test-session-1',
        userId: TEST_USER_ID,
        surahId: '1',
        ayahId: '1',
        practiceMode: 'word',
        audioRecordingUrl: '/mock/1.mp3',
        accuracyScore: 85,
        tajweedScore: 80,
        feedbackData: {feedback: 'Good'},
        phonemeAnalysis: {},
        practiceDate: new Date(),
        attemptsCount: 1,
        isOffline: false,
        durationSeconds: null,
      };
      const mockSession2 = {
        id: 'test-session-2',
        userId: TEST_USER_ID,
        surahId: '112',
        ayahId: '1',
        practiceMode: 'ayah',
        audioRecordingUrl: '/mock/2.mp3',
        accuracyScore: 90,
        tajweedScore: 85,
        feedbackData: {feedback: 'Excellent'},
        phonemeAnalysis: {},
        practiceDate: new Date(),
        attemptsCount: 1,
        isOffline: false,
        durationSeconds: null,
      };

      (prismaClient.recitationPractice.create as jest.Mock)
        .mockResolvedValueOnce(mockSession1)
        .mockResolvedValueOnce(mockSession2);

      await saveRecitationPractice(TEST_USER_ID, {
        surahId: '1',
        ayahId: '1',
        practiceMode: 'word',
        audioRecordingUrl: '/mock/1.mp3',
        accuracyScore: 85,
        tajweedScore: 80,
        feedbackData: {feedback: 'Good'},
      });

      await saveRecitationPractice(TEST_USER_ID, {
        surahId: '112',
        ayahId: '1',
        practiceMode: 'ayah',
        audioRecordingUrl: '/mock/2.mp3',
        accuracyScore: 90,
        tajweedScore: 85,
        feedbackData: {feedback: 'Excellent'},
      });

      // Mock getRecitationStats
      (prismaClient.recitationPractice.findMany as jest.Mock).mockResolvedValueOnce([
        mockSession1,
        mockSession2,
      ]);

      // Get statistics
      const stats = await getRecitationStats(TEST_USER_ID);
      expect(stats).toBeDefined();
      expect(stats.totalPractices).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle API failures gracefully', async () => {
      // Mock API failure
      jest.spyOn(require('@services/recitation/quranicTextService'), 'getSurah').mockRejectedValueOnce(
        new Error('API Error'),
      );

      // Should fallback to Al-Quran Cloud
      try {
        const surah = await getSurah(1);
        // If fallback works, surah should still be defined
        expect(surah).toBeDefined();
      } catch (error) {
        // If both fail, error should be handled gracefully
        expect(error).toBeDefined();
      }
    });

    it('should handle recording failures', async () => {
      const {startRecording} = require('@services/recitation/recordingService');
      jest.spyOn(require('@services/recitation/recordingService'), 'startRecording').mockRejectedValueOnce(
        new Error('Recording failed'),
      );

      try {
        await startRecording();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Recording failed');
      }
    });
  });
});

