/**
 * Word Building Service
 *
 * Progressive word building from Arabic letters.
 * Builds words syllable by syllable, then full words.
 */

import {ARABIC_LETTERS, ArabicLetter} from './pronunciationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Syllable {
  letters: string[];
  arabic: string;
  transliteration: string;
  audioUrl?: string;
}

export interface Word {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  syllables: Syllable[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'common' | 'prayer' | 'quranic';
}

/**
 * Common Arabic words for practice, organized by difficulty
 */
export const PRACTICE_WORDS: Word[] = [
  // Beginner - 2-3 letter words
  {
    id: 'bismillah',
    arabic: 'بسم',
    transliteration: 'bism',
    translation: 'In the name of',
    syllables: [
      {letters: ['ب'], arabic: 'ب', transliteration: 'b'},
      {letters: ['س'], arabic: 'س', transliteration: 's'},
      {letters: ['م'], arabic: 'م', transliteration: 'm'},
    ],
    difficulty: 'beginner',
    category: 'prayer',
  },
  {
    id: 'allah',
    arabic: 'الله',
    transliteration: 'Allah',
    translation: 'Allah',
    syllables: [
      {letters: ['ا', 'ل'], arabic: 'ال', transliteration: 'al'},
      {letters: ['ل', 'ه'], arabic: 'له', transliteration: 'lah'},
    ],
    difficulty: 'beginner',
    category: 'prayer',
  },
  {
    id: 'rahman',
    arabic: 'الرحمن',
    transliteration: 'ar-Rahman',
    translation: 'The Most Merciful',
    syllables: [
      {letters: ['ا', 'ل'], arabic: 'ال', transliteration: 'al'},
      {letters: ['ر', 'ح'], arabic: 'رح', transliteration: 'rah'},
      {letters: ['م', 'ن'], arabic: 'من', transliteration: 'man'},
    ],
    difficulty: 'intermediate',
    category: 'quranic',
  },
  {
    id: 'rahim',
    arabic: 'الرحيم',
    transliteration: 'ar-Rahim',
    translation: 'The Most Compassionate',
    syllables: [
      {letters: ['ا', 'ل'], arabic: 'ال', transliteration: 'al'},
      {letters: ['ر', 'ح'], arabic: 'رح', transliteration: 'rah'},
      {letters: ['ي', 'م'], arabic: 'يم', transliteration: 'eem'},
    ],
    difficulty: 'intermediate',
    category: 'quranic',
  },
  {
    id: 'hamd',
    arabic: 'الحمد',
    transliteration: 'al-hamd',
    translation: 'Praise',
    syllables: [
      {letters: ['ا', 'ل'], arabic: 'ال', transliteration: 'al'},
      {letters: ['ح', 'م'], arabic: 'حم', transliteration: 'ham'},
      {letters: ['د'], arabic: 'د', transliteration: 'd'},
    ],
    difficulty: 'intermediate',
    category: 'prayer',
  },
  {
    id: 'rabb',
    arabic: 'رب',
    transliteration: 'Rabb',
    translation: 'Lord',
    syllables: [
      {letters: ['ر'], arabic: 'ر', transliteration: 'r'},
      {letters: ['ب'], arabic: 'ب', transliteration: 'b'},
    ],
    difficulty: 'beginner',
    category: 'common',
  },
  {
    id: 'alamin',
    arabic: 'العالمين',
    transliteration: "al-'alameen",
    translation: 'The worlds',
    syllables: [
      {letters: ['ا', 'ل'], arabic: 'ال', transliteration: 'al'},
      {letters: ['ع', 'ا'], arabic: 'عا', transliteration: "'a"},
      {letters: ['ل', 'م'], arabic: 'لم', transliteration: 'lam'},
      {letters: ['ي', 'ن'], arabic: 'ين', transliteration: 'een'},
    ],
    difficulty: 'advanced',
    category: 'quranic',
  },
];

/**
 * Get words by difficulty level
 */
export function getWordsByDifficulty(
  difficulty: 'beginner' | 'intermediate' | 'advanced',
): Word[] {
  return PRACTICE_WORDS.filter(word => word.difficulty === difficulty);
}

/**
 * Get words by category
 */
export function getWordsByCategory(
  category: 'common' | 'prayer' | 'quranic',
): Word[] {
  return PRACTICE_WORDS.filter(word => word.category === category);
}

/**
 * Get user's word building progress
 */
export async function getUserWordProgress(userId: string): Promise<{
  wordsPracticed: number;
  wordsMastered: number;
  totalWords: number;
  difficultyProgress: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}> {
  try {
    const progressKey = `@salah_companion:word_building_progress:${userId}`;
    const progressJson = await AsyncStorage.getItem(progressKey);
    const progress: any = progressJson ? JSON.parse(progressJson) : {};

    const wordsPracticed = progress.wordsPracticed || [];
    const wordsMastered = progress.wordsMastered || [];

    const beginnerWords = getWordsByDifficulty('beginner');
    const intermediateWords = getWordsByDifficulty('intermediate');
    const advancedWords = getWordsByDifficulty('advanced');

    return {
      wordsPracticed: wordsPracticed.length,
      wordsMastered: wordsMastered.length,
      totalWords: PRACTICE_WORDS.length,
      difficultyProgress: {
        beginner:
          wordsMastered.filter((id: string) =>
            beginnerWords.some(w => w.id === id),
          ).length / beginnerWords.length,
        intermediate:
          wordsMastered.filter((id: string) =>
            intermediateWords.some(w => w.id === id),
          ).length / intermediateWords.length,
        advanced:
          wordsMastered.filter((id: string) =>
            advancedWords.some(w => w.id === id),
          ).length / advancedWords.length,
      },
    };
  } catch (error) {
    console.error('Error getting word progress:', error);
    return {
      wordsPracticed: 0,
      wordsMastered: 0,
      totalWords: PRACTICE_WORDS.length,
      difficultyProgress: {
        beginner: 0,
        intermediate: 0,
        advanced: 0,
      },
    };
  }
}

/**
 * Record word practice session
 */
export async function recordWordPractice(
  userId: string,
  wordId: string,
  accuracyScore?: number,
): Promise<void> {
  try {
    const progressKey = `@salah_companion:word_building_progress:${userId}`;
    const progressJson = await AsyncStorage.getItem(progressKey);
    const progress: any = progressJson ? JSON.parse(progressJson) : {
      wordsPracticed: [],
      wordsMastered: [],
      practiceHistory: [],
    };

    // Add to practiced words if not already there
    if (!progress.wordsPracticed.includes(wordId)) {
      progress.wordsPracticed.push(wordId);
    }

    // Record practice session
    progress.practiceHistory.push({
      wordId,
      accuracyScore,
      practicedAt: new Date().toISOString(),
    });

    // Mark as mastered if accuracy is high enough
    if (
      accuracyScore !== undefined &&
      accuracyScore >= 85 &&
      !progress.wordsMastered.includes(wordId)
    ) {
      progress.wordsMastered.push(wordId);
    }

    await AsyncStorage.setItem(progressKey, JSON.stringify(progress));
  } catch (error) {
    console.error('Error recording word practice:', error);
    throw error;
  }
}

/**
 * Get word practice history
 */
export async function getWordPracticeHistory(
  userId: string,
  wordId?: string,
): Promise<any[]> {
  try {
    const progressKey = `@salah_companion:word_building_progress:${userId}`;
    const progressJson = await AsyncStorage.getItem(progressKey);
    const progress: any = progressJson ? JSON.parse(progressJson) : {
      practiceHistory: [],
    };

    if (wordId) {
      return progress.practiceHistory.filter(
        (h: any) => h.wordId === wordId,
      );
    }

    return progress.practiceHistory || [];
  } catch (error) {
    console.error('Error getting word practice history:', error);
    return [];
  }
}

/**
 * Check if user has mastered required letters for a word
 */
export async function canPracticeWord(
  userId: string,
  word: Word,
): Promise<boolean> {
  try {
    const {getUserPronunciationProgress} = await import(
      './pronunciationService'
    );
    const progress = await getUserPronunciationProgress(userId);

    // Get all unique letters in the word
    const wordLetters = new Set<string>();
    word.syllables.forEach(syllable => {
      syllable.letters.forEach(letter => wordLetters.add(letter));
    });

    // Check if user has learned all required letters
    const requiredLetterIds = Array.from(wordLetters)
      .map(letter => {
        const letterData = ARABIC_LETTERS.find(l => l.arabic === letter);
        return letterData?.id;
      })
      .filter(Boolean) as string[];

    // For beginner words, allow practice even if not all letters learned
    if (word.difficulty === 'beginner') {
      return true;
    }

    // For intermediate/advanced, require at least 70% of letters learned
    const learnedCount = requiredLetterIds.filter(id => {
      // This would need to check actual letter progress
      // For now, return true if user has any progress
      return progress.lettersLearned > 0;
    }).length;

    return learnedCount / requiredLetterIds.length >= 0.7;
  } catch (error) {
    console.error('Error checking word practice eligibility:', error);
    return true; // Allow practice on error
  }
}

