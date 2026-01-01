/**
 * Pronunciation Service
 *
 * Manages Arabic letter pronunciation data, progress, and practice.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Sound from 'react-native-sound';

/**
 * Check achievements asynchronously (non-blocking)
 */
async function checkAchievementsAsync(userId: string): Promise<void> {
  try {
    const {checkAndUnlockAchievements} = await import(
      '@services/achievements/achievementService'
    );
    await checkAndUnlockAchievements(userId);
  } catch (error) {
    // Silently fail - achievements are not critical
    console.warn('Failed to check achievements:', error);
  }
}

export type LetterCategory = 'familiar' | 'modified' | 'unique' | 'emphatic';

export interface ArabicLetter {
  id: string;
  arabic: string;
  name: string;
  transliteration: string;
  category: LetterCategory;
  description: string;
  tonguePlacement?: string;
  lipShape?: string;
  airflow?: string;
  similarSound?: string;
  audioUrl?: string;
  order: number;
}

/**
 * Complete Arabic alphabet with pronunciation details
 */
export const ARABIC_LETTERS: ArabicLetter[] = [
  // Familiar Sounds (similar to English)
  {
    id: 'ba',
    arabic: 'ب',
    name: 'Ba',
    transliteration: 'b',
    category: 'familiar',
    description: 'Similar to English "b" as in "book"',
    similarSound: 'English "b"',
    order: 1,
  },
  {
    id: 'ta',
    arabic: 'ت',
    name: 'Ta',
    transliteration: 't',
    category: 'familiar',
    description: 'Similar to English "t" as in "table"',
    similarSound: 'English "t"',
    order: 2,
  },
  {
    id: 'tha',
    arabic: 'ث',
    name: 'Tha',
    transliteration: 'th',
    category: 'familiar',
    description: 'Similar to English "th" as in "think"',
    similarSound: 'English "th"',
    order: 3,
  },
  {
    id: 'jeem',
    arabic: 'ج',
    name: 'Jeem',
    transliteration: 'j',
    category: 'familiar',
    description: 'Similar to English "j" as in "jump"',
    similarSound: 'English "j"',
    order: 4,
  },
  {
    id: 'ha',
    arabic: 'ه',
    name: 'Ha',
    transliteration: 'h',
    category: 'familiar',
    description: 'Similar to English "h" as in "house"',
    similarSound: 'English "h"',
    order: 5,
  },
  {
    id: 'dal',
    arabic: 'د',
    name: 'Dal',
    transliteration: 'd',
    category: 'familiar',
    description: 'Similar to English "d" as in "door"',
    similarSound: 'English "d"',
    order: 6,
  },
  {
    id: 'ra',
    arabic: 'ر',
    name: 'Ra',
    transliteration: 'r',
    category: 'familiar',
    description: 'Rolled "r" sound',
    similarSound: 'Spanish "r"',
    order: 7,
  },
  {
    id: 'zay',
    arabic: 'ز',
    name: 'Zay',
    transliteration: 'z',
    category: 'familiar',
    description: 'Similar to English "z" as in "zoo"',
    similarSound: 'English "z"',
    order: 8,
  },
  {
    id: 'seen',
    arabic: 'س',
    name: 'Seen',
    transliteration: 's',
    category: 'familiar',
    description: 'Similar to English "s" as in "sun"',
    similarSound: 'English "s"',
    order: 9,
  },
  {
    id: 'sheen',
    arabic: 'ش',
    name: 'Sheen',
    transliteration: 'sh',
    category: 'familiar',
    description: 'Similar to English "sh" as in "ship"',
    similarSound: 'English "sh"',
    order: 10,
  },
  {
    id: 'faa',
    arabic: 'ف',
    name: 'Faa',
    transliteration: 'f',
    category: 'familiar',
    description: 'Similar to English "f" as in "fish"',
    similarSound: 'English "f"',
    order: 11,
  },
  {
    id: 'qaf',
    arabic: 'ق',
    name: 'Qaf',
    transliteration: 'q',
    category: 'familiar',
    description: 'Deep "k" sound from back of throat',
    tonguePlacement: 'Back of throat',
    order: 12,
  },
  {
    id: 'kaf',
    arabic: 'ك',
    name: 'Kaf',
    transliteration: 'k',
    category: 'familiar',
    description: 'Similar to English "k" as in "key"',
    similarSound: 'English "k"',
    order: 13,
  },
  {
    id: 'lam',
    arabic: 'ل',
    name: 'Lam',
    transliteration: 'l',
    category: 'familiar',
    description: 'Similar to English "l" as in "love"',
    similarSound: 'English "l"',
    order: 14,
  },
  {
    id: 'meem',
    arabic: 'م',
    name: 'Meem',
    transliteration: 'm',
    category: 'familiar',
    description: 'Similar to English "m" as in "mother"',
    similarSound: 'English "m"',
    order: 15,
  },
  {
    id: 'noon',
    arabic: 'ن',
    name: 'Noon',
    transliteration: 'n',
    category: 'familiar',
    description: 'Similar to English "n" as in "noon"',
    similarSound: 'English "n"',
    order: 16,
  },
  {
    id: 'waw',
    arabic: 'و',
    name: 'Waw',
    transliteration: 'w',
    category: 'familiar',
    description: 'Similar to English "w" as in "water"',
    similarSound: 'English "w"',
    order: 17,
  },
  {
    id: 'ya',
    arabic: 'ي',
    name: 'Ya',
    transliteration: 'y',
    category: 'familiar',
    description: 'Similar to English "y" as in "yes"',
    similarSound: 'English "y"',
    order: 18,
  },

  // Modified Sounds (require adjustment)
  {
    id: 'ha_modified',
    arabic: 'ح',
    name: 'Ha (Modified)',
    transliteration: 'ḥ',
    category: 'modified',
    description: 'Deeper "h" sound, more constricted than English "h"',
    tonguePlacement: 'Middle of throat',
    order: 19,
  },
  {
    id: 'kha',
    arabic: 'خ',
    name: 'Kha',
    transliteration: 'kh',
    category: 'modified',
    description: 'Like "ch" in Scottish "loch" or German "Bach"',
    tonguePlacement: 'Back of throat',
    order: 20,
  },
  {
    id: 'ayn',
    arabic: 'ع',
    name: 'Ayn',
    transliteration: 'ʿ',
    category: 'unique',
    description: 'Deep guttural sound, no English equivalent. Constrict throat.',
    tonguePlacement: 'Deep in throat',
    order: 21,
  },
  {
    id: 'ghayn',
    arabic: 'غ',
    name: 'Ghayn',
    transliteration: 'gh',
    category: 'unique',
    description: 'Like French "r" or gargling sound',
    tonguePlacement: 'Back of throat',
    order: 22,
  },

  // Emphatic Letters (affect surrounding vowels)
  {
    id: 'sad',
    arabic: 'ص',
    name: 'Sad',
    transliteration: 'ṣ',
    category: 'emphatic',
    description: 'Emphatic "s" - tongue raised, affects vowel quality',
    tonguePlacement: 'Tongue raised, back pressed',
    order: 23,
  },
  {
    id: 'dad',
    arabic: 'ض',
    name: 'Dad',
    transliteration: 'ḍ',
    category: 'emphatic',
    description: 'Emphatic "d" - heaviest Arabic letter',
    tonguePlacement: 'Tongue raised, side contact',
    order: 24,
  },
  {
    id: 'ta_emphatic',
    arabic: 'ط',
    name: 'Ta (Emphatic)',
    transliteration: 'ṭ',
    category: 'emphatic',
    description: 'Emphatic "t" - tongue raised',
    tonguePlacement: 'Tongue raised, back pressed',
    order: 25,
  },
  {
    id: 'za_emphatic',
    arabic: 'ظ',
    name: 'Za (Emphatic)',
    transliteration: 'ẓ',
    category: 'emphatic',
    description: 'Emphatic "th" - tongue raised',
    tonguePlacement: 'Tongue raised, back pressed',
    order: 26,
  },
];

/**
 * Get all letters by category
 */
export function getLettersByCategory(category: LetterCategory): ArabicLetter[] {
  return ARABIC_LETTERS.filter(letter => letter.category === category);
}

/**
 * Get letter by ID
 */
export function getLetterById(id: string): ArabicLetter | undefined {
  return ARABIC_LETTERS.find(letter => letter.id === id);
}

/**
 * Get user's pronunciation progress
 */
export async function getUserPronunciationProgress(userId: string) {
  try {
    const progressKey = `@salah_companion:pronunciation_progress:${userId}`;
    const progressJson = await AsyncStorage.getItem(progressKey);
    const progressRecords: any[] = progressJson ? JSON.parse(progressJson) : [];

    const lettersLearned = progressRecords.filter((p: any) => p.isLearned).length;
    const categoryProgress: Record<LetterCategory, number> = {
      familiar: 0,
      modified: 0,
      unique: 0,
      emphatic: 0,
    };

    // Count learned letters by category
    progressRecords.forEach((record: any) => {
      if (record.isLearned) {
        const letter = getLetterById(record.letterId);
        if (letter) {
          categoryProgress[letter.category]++;
        }
      }
    });

    return {
      lettersLearned,
      totalLetters: ARABIC_LETTERS.length,
      categoryProgress,
    };
  } catch (error) {
    console.error('Error fetching pronunciation progress:', error);
    // Return default progress on error
    return {
      lettersLearned: 0,
      totalLetters: ARABIC_LETTERS.length,
      categoryProgress: {
        familiar: 0,
        modified: 0,
        unique: 0,
        emphatic: 0,
      },
    };
  }
}

/**
 * Mark letter as learned
 */
export async function markLetterLearned(
  userId: string,
  letterId: string,
): Promise<void> {
  try {
    const progressKey = `@salah_companion:pronunciation_progress:${userId}`;
    const progressJson = await AsyncStorage.getItem(progressKey);
    const progressRecords: any[] = progressJson ? JSON.parse(progressJson) : [];

    const existingIndex = progressRecords.findIndex((r: any) => r.letterId === letterId);
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      progressRecords[existingIndex] = {
        ...progressRecords[existingIndex],
        isLearned: true,
        masteredAt: now,
        updatedAt: now,
      };
    } else {
      progressRecords.push({
        userId,
        letterId,
        isLearned: true,
        masteredAt: now,
        timesPracticed: 0,
        lastPracticedAt: null,
        accuracyScore: null,
      });
    }

    await AsyncStorage.setItem(progressKey, JSON.stringify(progressRecords));
  } catch (error) {
    console.error('Error marking letter as learned:', error);
    throw error;
  }
}

/**
 * Record practice session for a letter
 */
export async function recordLetterPractice(
  userId: string,
  letterId: string,
  accuracyScore?: number,
): Promise<void> {
  try {
    const progressKey = `@salah_companion:pronunciation_progress:${userId}`;
    const progressJson = await AsyncStorage.getItem(progressKey);
    const progressRecords: any[] = progressJson ? JSON.parse(progressJson) : [];

    const existingIndex = progressRecords.findIndex((r: any) => r.letterId === letterId);
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      const existing = progressRecords[existingIndex];
      const newTimesPracticed = (existing.timesPracticed || 0) + 1;
      const shouldMarkLearned = accuracyScore !== undefined && 
                                accuracyScore >= 80 && 
                                newTimesPracticed >= 4 && 
                                !existing.isLearned;

      progressRecords[existingIndex] = {
        ...existing,
        timesPracticed: newTimesPracticed,
        lastPracticedAt: now,
        ...(accuracyScore !== undefined && {accuracyScore}),
        ...(shouldMarkLearned ? {
          isLearned: true,
          masteredAt: now,
        } : {}),
      };

      // Check for new achievements (non-blocking)
      checkAchievementsAsync(userId);
    } else {
      progressRecords.push({
        userId,
        letterId,
        timesPracticed: 1,
        lastPracticedAt: now,
        isLearned: false,
        ...(accuracyScore !== undefined && {accuracyScore}),
      });
    }

    await AsyncStorage.setItem(progressKey, JSON.stringify(progressRecords));
  } catch (error) {
    console.error('Error recording letter practice:', error);
    throw error;
  }
}

/**
 * Get letter progress for user
 */
export async function getLetterProgress(
  userId: string,
  letterId: string,
): Promise<{
  isLearned: boolean;
  timesPracticed: number;
  accuracyScore: number | null;
  lastPracticedAt: Date | null;
} | null> {
  try {
    const progressKey = `@salah_companion:pronunciation_progress:${userId}`;
    const progressJson = await AsyncStorage.getItem(progressKey);
    const progressRecords: any[] = progressJson ? JSON.parse(progressJson) : [];

    const progress = progressRecords.find((r: any) => r.letterId === letterId);

    if (!progress) {
      return {
        isLearned: false,
        timesPracticed: 0,
        accuracyScore: null,
        lastPracticedAt: null,
      };
    }

    return {
      isLearned: progress.isLearned || false,
      timesPracticed: progress.timesPracticed || 0,
      accuracyScore: progress.accuracyScore !== undefined && progress.accuracyScore !== null 
        ? Number(progress.accuracyScore) 
        : null,
      lastPracticedAt: progress.lastPracticedAt ? new Date(progress.lastPracticedAt) : null,
    };
  } catch (error) {
    console.error('Error fetching letter progress:', error);
    return null;
  }
}

/**
 * Play letter pronunciation audio
 * Uses TTS service with fallback to local files
 */
import {playLetterAudioTTS} from './letterAudioService';

export async function playLetterAudio(
  letterId: string,
  volume: number = 80,
): Promise<void> {
  try {
    // Try TTS service first
    await playLetterAudioTTS(letterId, volume);
  } catch (error) {
    console.warn(`TTS failed for letter ${letterId}, trying local file:`, error);
    
    // Fallback to local file
    return new Promise((resolve, reject) => {
      const audioFile = `letter_${letterId}.mp3`;
      const sound = new Sound(audioFile, Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.warn(`Audio file not found for letter ${letterId}. Add ${audioFile} to res/raw or main bundle.`);
          // Silent failure - user can still practice without audio
          resolve();
          return;
        }

        sound.setVolume(volume / 100);
        sound.play((success) => {
          if (success) {
            console.log(`Played audio for letter ${letterId}`);
          }
          sound.release();
          resolve();
        });
      });
    });
  }
}

