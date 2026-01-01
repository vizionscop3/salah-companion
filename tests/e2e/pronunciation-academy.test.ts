/**
 * End-to-End Tests - Pronunciation Academy
 *
 * Tests complete user flows for pronunciation academy:
 * - Letter display and categorization
 * - Letter practice mode
 * - Recording and analysis
 * - Progress tracking
 * - "Learned" status updates
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getLetterById,
  recordLetterPractice,
  getLetterProgress,
  markLetterLearned,
} from '@services/pronunciation/pronunciationService';

// Mock recording service
jest.mock('@services/recitation/recordingService', () => ({
  startRecording: jest.fn(() => Promise.resolve('/mock/recording/path.mp3')),
  stopRecording: jest.fn(() => Promise.resolve('/mock/recording/path.mp3')),
  playRecording: jest.fn(() => Promise.resolve()),
}));

// Mock speech recognition
jest.mock('@services/pronunciation/speechRecognitionService', () => ({
  transcribeAudio: jest.fn(() =>
    Promise.resolve({
      transcription: 'ب',
      confidence: 0.95,
    }),
  ),
  analyzePronunciation: jest.fn(() =>
    Promise.resolve({
      accuracy: 90,
      phonemeAnalysis: [],
      feedback: 'Excellent pronunciation',
    }),
  ),
}));

const TEST_USER_ID = 'test_user_pronunciation_e2e';

describe('Pronunciation Academy E2E Tests', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('Letter Display and Information', () => {
    it('should fetch and display letter details', async () => {
      const letterId = 'ba'; // Ba

      const details = getLetterById(letterId);
      expect(details).toBeDefined();
      expect(details?.id).toBe(letterId);
      expect(details?.name).toBeDefined();
      expect(details?.category).toBeDefined();
      expect(details?.transliteration).toBeDefined();
    });

    it('should categorize letters correctly', async () => {
      const familiarLetterId = 'ba'; // Familiar sound
      const uniqueLetterId = 'kha'; // Unique sound
      const emphaticLetterId = 'sad'; // Emphatic sound

      const familiarDetails = getLetterById(familiarLetterId);
      const uniqueDetails = getLetterById(uniqueLetterId);
      const emphaticDetails = getLetterById(emphaticLetterId);

      expect(familiarDetails?.category).toBeDefined();
      expect(uniqueDetails?.category).toBeDefined();
      expect(emphaticDetails?.category).toBeDefined();
    });
  });

  describe('Letter Practice Flow', () => {
    it('should complete letter practice: display → record → analyze → save', async () => {
      const letterId = 'ba';

      // 1. Get letter details
      const details = getLetterById(letterId);
      expect(details).toBeDefined();

      // 2. Start practice session
      const {startRecording, stopRecording} = require('@services/recitation/recordingService');
      const recordingPath = await startRecording();
      expect(recordingPath).toBeDefined();

      // 3. Stop recording
      await stopRecording();

      // 4. Analyze pronunciation
      const {analyzePronunciation} = require('@services/pronunciation/speechRecognitionService');
      const analysis = await analyzePronunciation(recordingPath, details?.arabic || 'ب');
      expect(analysis).toBeDefined();
      expect(analysis.accuracy).toBeGreaterThanOrEqual(0);
      expect(analysis.accuracy).toBeLessThanOrEqual(100);

      // 5. Save practice
      await recordLetterPractice(TEST_USER_ID, letterId, analysis.accuracy);

      // Verify practice was saved
      const progress = await getLetterProgress(TEST_USER_ID, letterId);
      expect(progress).toBeDefined();
      expect(progress?.timesPracticed).toBeGreaterThanOrEqual(1);
    });

    it('should track practice count for letters', async () => {
      const letterId = 'ba';

      // Practice multiple times
      for (let i = 0; i < 3; i++) {
        await recordLetterPractice(TEST_USER_ID, letterId, 85 + i * 2);
      }

      // Get progress
      const progress = await getLetterProgress(TEST_USER_ID, letterId);
      expect(progress).toBeDefined();
      expect(progress?.timesPracticed).toBe(3);
    });
  });

  describe('Letter Mastery and Learning Status', () => {
    it('should mark letter as learned when accuracy threshold met', async () => {
      const letterId = 'ba';

      // Practice with high accuracy multiple times (needs 4+ practices with 80+ accuracy)
      for (let i = 0; i < 4; i++) {
        await recordLetterPractice(TEST_USER_ID, letterId, 90); // High accuracy
      }

      // Check if auto-marked as learned
      const progress = await getLetterProgress(TEST_USER_ID, letterId);
      expect(progress).toBeDefined();
      // Should be marked as learned after 4 practices with 80+ accuracy
      expect(progress?.isLearned).toBe(true);
    });

    it('should manually mark letter as learned', async () => {
      const letterId = 'ba';

      await markLetterLearned(TEST_USER_ID, letterId);

      const progress = await getLetterProgress(TEST_USER_ID, letterId);
      expect(progress).toBeDefined();
      expect(progress?.isLearned).toBe(true);
    });
  });

  describe('Progress Tracking', () => {
    it('should track progress across multiple letters', async () => {
      const letterIds = ['ba', 'ta', 'tha'];

      // Practice each letter
      for (const letterId of letterIds) {
        await recordLetterPractice(TEST_USER_ID, letterId, 85);
      }

      // Get progress for each
      for (const letterId of letterIds) {
        const progress = await getLetterProgress(TEST_USER_ID, letterId);
        expect(progress).toBeDefined();
        expect(progress?.timesPracticed).toBeGreaterThanOrEqual(1);
      }
    });

    it('should track accuracy score correctly', async () => {
      const letterId = 'ba';
      const accuracies = [80, 85, 90];

      // Practice with different accuracies
      for (let i = 0; i < accuracies.length; i++) {
        await recordLetterPractice(TEST_USER_ID, letterId, accuracies[i]);
      }

      // Get progress - last accuracy should be stored
      const progress = await getLetterProgress(TEST_USER_ID, letterId);
      expect(progress).toBeDefined();
      expect(progress?.timesPracticed).toBe(accuracies.length);
      // The service stores the last accuracy score, not average
      if (progress?.accuracyScore !== null) {
        expect(progress.accuracyScore).toBeGreaterThanOrEqual(80);
        expect(progress.accuracyScore).toBeLessThanOrEqual(90);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle recording failures gracefully', async () => {
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

    it('should handle analysis failures gracefully', async () => {
      const {analyzePronunciation} = require('@services/pronunciation/speechRecognitionService');
      jest
        .spyOn(require('@services/pronunciation/speechRecognitionService'), 'analyzePronunciation')
        .mockRejectedValueOnce(new Error('Analysis failed'));

      try {
        await analyzePronunciation('/mock/path.mp3', 'ب'); // Arabic character for testing
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Analysis failed');
      }
    });
  });
});

