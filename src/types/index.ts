/**
 * TypeScript Type Definitions
 *
 * Central location for shared type definitions.
 */

// User Types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  subscriptionTier: 'free' | 'premium';
  learningLevel: number;
  preferredLanguage: string;
  timezone?: string;
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
}

// Prayer Types
export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerTime {
  name: PrayerName;
  time: Date;
  endTime: Date;
  rakahs: number;
}

export interface PrayerRecord {
  id: string;
  prayerName: PrayerName;
  prayerDate: Date;
  completedAt: Date;
  wasGuided: boolean;
  wasOnTime: boolean;
}

// Recitation Types
export interface RecitationPractice {
  id: string;
  surahId?: string;
  ayahId?: string;
  practiceMode: 'word' | 'ayah' | 'surah';
  accuracyScore?: number;
  tajweedScore?: number;
  feedbackData?: Record<string, unknown>;
}

// Achievement Types
export interface Achievement {
  id: string;
  achievementKey: string;
  title: string;
  description: string;
  category: 'prayer' | 'learning' | 'recitation' | 'consistency';
  pointsAwarded: number;
  isPremium: boolean;
}

// Navigation Types
export type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
  PrayerTimes: undefined;
  Learning: undefined;
  Quran: undefined;
  Profile: undefined;
};

export type TabParamList = {
  Home: undefined;
  PrayerTimes: undefined;
  Learning: undefined;
  Quran: undefined;
  Profile: undefined;
};

