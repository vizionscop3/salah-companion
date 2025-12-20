/**
 * Audio Mapping Service
 *
 * Maps prayer steps and recitations to Quranic surah/ayah numbers
 * for API-based audio fetching.
 */

// Surah numbers
export const SURAH_NUMBERS = {
  FATIHA: 1,
  IKHLAS: 112,
  FALAQ: 113,
  NAS: 114,
} as const;

/**
 * Get audio mapping for guided salah steps
 */
export interface AudioMapping {
  surah: number;
  ayah: number;
  type: 'full_surah' | 'single_ayah' | 'phrase';
}

/**
 * Map prayer step to audio source
 */
export function getAudioMapping(stepId: string): AudioMapping | null {
  const mappings: Record<string, AudioMapping> = {
    // Al-Fatiha (full surah)
    fatiha: {
      surah: SURAH_NUMBERS.FATIHA,
      ayah: 1, // Start from first ayah, will play full surah
      type: 'full_surah',
    },
    // Short surah (Al-Ikhlas)
    short_surah: {
      surah: SURAH_NUMBERS.IKHLAS,
      ayah: 1,
      type: 'full_surah',
    },
    // Takbir - not from Quran, will need separate handling
    takbir: {
      surah: 0,
      ayah: 0,
      type: 'phrase',
    },
    // Ruku - not from Quran, will need separate handling
    ruku: {
      surah: 0,
      ayah: 0,
      type: 'phrase',
    },
    // Sujud - not from Quran, will need separate handling
    sujud: {
      surah: 0,
      ayah: 0,
      type: 'phrase',
    },
    // Tashahhud - not from Quran, will need separate handling
    tashahhud: {
      surah: 0,
      ayah: 0,
      type: 'phrase',
    },
    // Salam - not from Quran, will need separate handling
    salam: {
      surah: 0,
      ayah: 0,
      type: 'phrase',
    },
  };

  return mappings[stepId] || null;
}

/**
 * Check if step requires Quranic recitation
 */
export function isQuranicRecitation(stepId: string): boolean {
  const mapping = getAudioMapping(stepId);
  return mapping !== null && mapping.type !== 'phrase' && mapping.surah > 0;
}

/**
 * Check if step is a prayer phrase (non-Quranic)
 */
export function isPrayerPhrase(stepId: string): boolean {
  const phrases = [
    'takbir',
    'ruku',
    'sujud',
    'tashahhud',
    'salam',
    'subhan_rabbial_ala',
    'subhan_rabbial_azeem',
    'sami_allahu_liman_hamidah',
    'rabbana_lakal_hamd',
  ];
  return phrases.includes(stepId);
}

/**
 * Get all surahs needed for guided salah
 */
export function getRequiredSurahs(): number[] {
  return [
    SURAH_NUMBERS.FATIHA,
    SURAH_NUMBERS.IKHLAS,
    // Add more as needed
  ];
}

