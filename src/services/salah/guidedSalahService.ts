/**
 * Guided Salah Service
 * 
 * Provides step-by-step guidance through prayer with audio and visual cues.
 */

import {PrayerName} from '@services/prayer/prayerTimeService';

export type SalahStepType =
  | 'intention'
  | 'takbir'
  | 'recitation'
  | 'ruku'
  | 'sujud'
  | 'sitting'
  | 'tashahhud'
  | 'salam';

export interface SalahStep {
  id: string;
  type: SalahStepType;
  order: number;
  arabic?: string;
  transliteration?: string;
  translation?: string;
  audioUrl?: string;
  instruction: string;
  position?: 'standing' | 'ruku' | 'sujud' | 'sitting';
  duration?: number; // in seconds
}

export interface PrayerGuide {
  prayerName: PrayerName;
  rakAhs: number;
  steps: SalahStep[];
}

/**
 * Get guided prayer steps for a prayer
 */
export function getPrayerGuide(prayerName: PrayerName): PrayerGuide {
  const baseSteps = getBasePrayerSteps();
  const rakAhSteps = getRakAhSteps();

  // Fajr: 2 rak'ahs
  // Dhuhr: 4 rak'ahs
  // Asr: 4 rak'ahs
  // Maghrib: 3 rak'ahs
  // Isha: 4 rak'ahs

  const rakAhCount: Record<PrayerName, number> = {
    fajr: 2,
    dhuhr: 4,
    asr: 4,
    maghrib: 3,
    isha: 4,
  };

  const rakAhs = rakAhCount[prayerName];
  const steps: SalahStep[] = [];

  // Add intention step
  steps.push(...baseSteps.intention);

  // Add rak'ahs
  for (let i = 1; i <= rakAhs; i++) {
    const isFirstRakAh = i === 1;
    const isLastRakAh = i === rakAhs;

    // First rak'ah: Takbir + Fatiha + Surah
    if (isFirstRakAh) {
      steps.push(...baseSteps.takbir);
      steps.push(...baseSteps.fatiha);
      steps.push(...baseSteps.shortSurah);
    } else {
      // Subsequent rak'ahs: Takbir + Fatiha only
      steps.push(...baseSteps.takbir);
      steps.push(...baseSteps.fatiha);
    }

    // Ruku
    steps.push(...rakAhSteps.ruku);

    // Stand up
    steps.push(...rakAhSteps.standFromRuku);

    // First Sujud
    steps.push(...rakAhSteps.sujud);

    // Sit between sujuds
    steps.push(...rakAhSteps.sitBetweenSujud);

    // Second Sujud
    steps.push(...rakAhSteps.sujud);

    // After second sujud
    if (isLastRakAh) {
      // Final rak'ah: Tashahhud + Salam
      steps.push(...baseSteps.tashahhud);
      steps.push(...baseSteps.salam);
    } else {
      // Stand for next rak'ah
      steps.push(...rakAhSteps.standForNextRakAh);
    }
  }

  return {
    prayerName,
    rakAhs,
    steps: steps.map((step, index) => ({
      ...step,
      order: index + 1,
    })),
  };
}

/**
 * Get base prayer steps
 */
function getBasePrayerSteps() {
  return {
    intention: [
      {
        id: 'intention',
        type: 'intention' as SalahStepType,
        order: 0,
        instruction: 'Make your intention (niyyah) in your heart',
        position: 'standing' as const,
      },
    ],
    takbir: [
      {
        id: 'takbir',
        type: 'takbir' as SalahStepType,
        order: 0,
        arabic: 'اللهُ أَكْبَر',
        transliteration: 'Allahu Akbar',
        translation: 'Allah is the Greatest',
        instruction: 'Raise your hands and say "Allahu Akbar"',
        position: 'standing' as const,
      },
    ],
    fatiha: [
      {
        id: 'fatiha',
        type: 'recitation' as SalahStepType,
        order: 0,
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        transliteration: 'Bismillahi ar-Rahman ar-Rahim',
        translation: 'In the name of Allah, the Most Gracious, the Most Merciful',
        instruction: 'Recite Al-Fatiha',
        position: 'standing' as const,
        duration: 30,
      },
    ],
    shortSurah: [
      {
        id: 'short_surah',
        type: 'recitation' as SalahStepType,
        order: 0,
        arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
        transliteration: 'Qul huwa Allahu ahad',
        translation: 'Say: He is Allah, the One',
        instruction: 'Recite a short surah (e.g., Al-Ikhlas)',
        position: 'standing' as const,
        duration: 20,
      },
    ],
    tashahhud: [
      {
        id: 'tashahhud',
        type: 'tashahhud' as SalahStepType,
        order: 0,
        arabic: 'التَّحِيَّاتُ لِلَّهِ',
        transliteration: 'At-tahiyyatu lillahi',
        translation: 'All greetings are due to Allah',
        instruction: 'Recite Tashahhud',
        position: 'sitting' as const,
        duration: 15,
      },
    ],
    salam: [
      {
        id: 'salam_right',
        type: 'salam' as SalahStepType,
        order: 0,
        arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ',
        transliteration: 'As-salamu alaykum wa rahmatullah',
        translation: 'Peace and mercy of Allah be upon you',
        instruction: 'Turn your head to the right and say "As-salamu alaykum"',
        position: 'sitting' as const,
      },
      {
        id: 'salam_left',
        type: 'salam' as SalahStepType,
        order: 0,
        arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ',
        transliteration: 'As-salamu alaykum wa rahmatullah',
        translation: 'Peace and mercy of Allah be upon you',
        instruction: 'Turn your head to the left and say "As-salamu alaykum"',
        position: 'sitting' as const,
      },
    ],
  };
}

/**
 * Get rak'ah-specific steps
 */
function getRakAhSteps() {
  return {
    ruku: [
      {
        id: 'ruku',
        type: 'ruku' as SalahStepType,
        order: 0,
        arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ',
        transliteration: 'Subhana Rabbi al-Azeem',
        translation: 'Glory to my Lord, the Great',
        instruction: 'Bow down (Ruku) and say "Subhana Rabbi al-Azeem" three times',
        position: 'ruku' as const,
        duration: 5,
      },
    ],
    standFromRuku: [
      {
        id: 'stand_from_ruku',
        type: 'takbir' as SalahStepType,
        order: 0,
        arabic: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ',
        transliteration: 'Sami Allahu liman hamidah',
        translation: 'Allah hears those who praise Him',
        instruction: 'Stand up from Ruku and say "Sami Allahu liman hamidah"',
        position: 'standing' as const,
      },
    ],
    sujud: [
      {
        id: 'sujud',
        type: 'sujud' as SalahStepType,
        order: 0,
        arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَى',
        transliteration: 'Subhana Rabbi al-Aala',
        translation: 'Glory to my Lord, the Most High',
        instruction: 'Prostrate (Sujud) and say "Subhana Rabbi al-Aala" three times',
        position: 'sujud' as const,
        duration: 5,
      },
    ],
    sitBetweenSujud: [
      {
        id: 'sit_between_sujud',
        type: 'sitting' as SalahStepType,
        order: 0,
        instruction: 'Sit briefly between the two sujuds',
        position: 'sitting' as const,
        duration: 2,
      },
    ],
    standForNextRakAh: [
      {
        id: 'stand_next',
        type: 'takbir' as SalahStepType,
        order: 0,
        arabic: 'اللهُ أَكْبَر',
        transliteration: 'Allahu Akbar',
        translation: 'Allah is the Greatest',
        instruction: 'Stand up for the next rak\'ah',
        position: 'standing' as const,
      },
    ],
  };
}

/**
 * Get current step in prayer
 */
export function getCurrentStep(
  guide: PrayerGuide,
  currentStepIndex: number,
): SalahStep | null {
  if (currentStepIndex < 0 || currentStepIndex >= guide.steps.length) {
    return null;
  }
  return guide.steps[currentStepIndex];
}

/**
 * Get next step in prayer
 */
export function getNextStep(
  guide: PrayerGuide,
  currentStepIndex: number,
): SalahStep | null {
  const nextIndex = currentStepIndex + 1;
  return getCurrentStep(guide, nextIndex);
}

/**
 * Check if step is the last step
 */
export function isLastStep(guide: PrayerGuide, stepIndex: number): boolean {
  return stepIndex >= guide.steps.length - 1;
}

