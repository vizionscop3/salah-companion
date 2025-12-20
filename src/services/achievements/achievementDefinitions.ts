/**
 * Achievement Definitions
 *
 * Defines all available achievements with their requirements and metadata.
 * Achievements are organized by category: prayer, recitation, pronunciation, consistency.
 */

export interface AchievementDefinition {
  achievementKey: string;
  title: string;
  description: string;
  category: 'prayer' | 'recitation' | 'pronunciation' | 'consistency';
  iconName: string;
  pointsAwarded: number;
  requirementType:
    | 'prayer_streak'
    | 'prayer_count'
    | 'recitation_practices'
    | 'recitation_surahs'
    | 'recitation_accuracy'
    | 'pronunciation_letters'
    | 'pronunciation_sessions'
    | 'practice_streak';
  requirementValue: number;
  isPremium: boolean;
}

/**
 * All available achievements
 */
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // Prayer Achievements - Streaks
  {
    achievementKey: 'prayer_streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day prayer streak',
    category: 'prayer',
    iconName: 'fire',
    pointsAwarded: 50,
    requirementType: 'prayer_streak',
    requirementValue: 7,
    isPremium: false,
  },
  {
    achievementKey: 'prayer_streak_30',
    title: 'Month Master',
    description: 'Maintain a 30-day prayer streak',
    category: 'prayer',
    iconName: 'star',
    pointsAwarded: 200,
    requirementType: 'prayer_streak',
    requirementValue: 30,
    isPremium: false,
  },
  {
    achievementKey: 'prayer_streak_100',
    title: 'Century Champion',
    description: 'Maintain a 100-day prayer streak',
    category: 'prayer',
    iconName: 'trophy',
    pointsAwarded: 500,
    requirementType: 'prayer_streak',
    requirementValue: 100,
    isPremium: false,
  },
  {
    achievementKey: 'prayer_streak_365',
    title: 'Year of Devotion',
    description: 'Maintain a 365-day prayer streak',
    category: 'prayer',
    iconName: 'crown',
    pointsAwarded: 1000,
    requirementType: 'prayer_streak',
    requirementValue: 365,
    isPremium: false,
  },

  // Prayer Achievements - Count
  {
    achievementKey: 'prayer_count_100',
    title: 'Hundred Prayers',
    description: 'Complete 100 prayers',
    category: 'prayer',
    iconName: 'check-circle',
    pointsAwarded: 100,
    requirementType: 'prayer_count',
    requirementValue: 100,
    isPremium: false,
  },
  {
    achievementKey: 'prayer_count_500',
    title: 'Five Hundred',
    description: 'Complete 500 prayers',
    category: 'prayer',
    iconName: 'medal',
    pointsAwarded: 300,
    requirementType: 'prayer_count',
    requirementValue: 500,
    isPremium: false,
  },
  {
    achievementKey: 'prayer_count_1000',
    title: 'Thousand Prayers',
    description: 'Complete 1,000 prayers',
    category: 'prayer',
    iconName: 'award',
    pointsAwarded: 750,
    requirementType: 'prayer_count',
    requirementValue: 1000,
    isPremium: false,
  },

  // Recitation Achievements - Practice Count
  {
    achievementKey: 'recitation_practices_10',
    title: 'Getting Started',
    description: 'Complete 10 recitation practices',
    category: 'recitation',
    iconName: 'book-open',
    pointsAwarded: 25,
    requirementType: 'recitation_practices',
    requirementValue: 10,
    isPremium: false,
  },
  {
    achievementKey: 'recitation_practices_50',
    title: 'Dedicated Learner',
    description: 'Complete 50 recitation practices',
    category: 'recitation',
    iconName: 'book',
    pointsAwarded: 100,
    requirementType: 'recitation_practices',
    requirementValue: 50,
    isPremium: false,
  },
  {
    achievementKey: 'recitation_practices_100',
    title: 'Century of Practice',
    description: 'Complete 100 recitation practices',
    category: 'recitation',
    iconName: 'library',
    pointsAwarded: 250,
    requirementType: 'recitation_practices',
    requirementValue: 100,
    isPremium: false,
  },
  {
    achievementKey: 'recitation_practices_500',
    title: 'Master Reciter',
    description: 'Complete 500 recitation practices',
    category: 'recitation',
    iconName: 'graduation-cap',
    pointsAwarded: 500,
    requirementType: 'recitation_practices',
    requirementValue: 500,
    isPremium: false,
  },

  // Recitation Achievements - Surahs
  {
    achievementKey: 'recitation_surahs_5',
    title: 'Five Surahs',
    description: 'Practice 5 different surahs',
    category: 'recitation',
    iconName: 'layers',
    pointsAwarded: 50,
    requirementType: 'recitation_surahs',
    requirementValue: 5,
    isPremium: false,
  },
  {
    achievementKey: 'recitation_surahs_10',
    title: 'Ten Surahs',
    description: 'Practice 10 different surahs',
    category: 'recitation',
    iconName: 'bookmark',
    pointsAwarded: 150,
    requirementType: 'recitation_surahs',
    requirementValue: 10,
    isPremium: false,
  },
  {
    achievementKey: 'recitation_surahs_30',
    title: 'Thirty Surahs',
    description: 'Practice 30 different surahs',
    category: 'recitation',
    iconName: 'star',
    pointsAwarded: 400,
    requirementType: 'recitation_surahs',
    requirementValue: 30,
    isPremium: false,
  },

  // Recitation Achievements - Accuracy
  {
    achievementKey: 'recitation_accuracy_80',
    title: 'Excellent Reciter',
    description: 'Achieve 80% average accuracy',
    category: 'recitation',
    iconName: 'target',
    pointsAwarded: 100,
    requirementType: 'recitation_accuracy',
    requirementValue: 80,
    isPremium: false,
  },
  {
    achievementKey: 'recitation_accuracy_90',
    title: 'Master Reciter',
    description: 'Achieve 90% average accuracy',
    category: 'recitation',
    iconName: 'award',
    pointsAwarded: 250,
    requirementType: 'recitation_accuracy',
    requirementValue: 90,
    isPremium: false,
  },
  {
    achievementKey: 'recitation_accuracy_95',
    title: 'Perfect Reciter',
    description: 'Achieve 95% average accuracy',
    category: 'recitation',
    iconName: 'trophy',
    pointsAwarded: 500,
    requirementType: 'recitation_accuracy',
    requirementValue: 95,
    isPremium: false,
  },

  // Pronunciation Achievements - Letters
  {
    achievementKey: 'pronunciation_letters_5',
    title: 'First Five',
    description: 'Master 5 Arabic letters',
    category: 'pronunciation',
    iconName: 'alphabet',
    pointsAwarded: 50,
    requirementType: 'pronunciation_letters',
    requirementValue: 5,
    isPremium: false,
  },
  {
    achievementKey: 'pronunciation_letters_10',
    title: 'Ten Letters',
    description: 'Master 10 Arabic letters',
    category: 'pronunciation',
    iconName: 'type',
    pointsAwarded: 100,
    requirementType: 'pronunciation_letters',
    requirementValue: 10,
    isPremium: false,
  },
  {
    achievementKey: 'pronunciation_letters_20',
    title: 'Twenty Letters',
    description: 'Master 20 Arabic letters',
    category: 'pronunciation',
    iconName: 'book-open',
    pointsAwarded: 250,
    requirementType: 'pronunciation_letters',
    requirementValue: 20,
    isPremium: false,
  },
  {
    achievementKey: 'pronunciation_letters_28',
    title: 'Complete Mastery',
    description: 'Master all 28 Arabic letters',
    category: 'pronunciation',
    iconName: 'crown',
    pointsAwarded: 500,
    requirementType: 'pronunciation_letters',
    requirementValue: 28,
    isPremium: false,
  },

  // Pronunciation Achievements - Sessions
  {
    achievementKey: 'pronunciation_sessions_50',
    title: 'Fifty Sessions',
    description: 'Complete 50 pronunciation practice sessions',
    category: 'pronunciation',
    iconName: 'mic',
    pointsAwarded: 100,
    requirementType: 'pronunciation_sessions',
    requirementValue: 50,
    isPremium: false,
  },
  {
    achievementKey: 'pronunciation_sessions_100',
    title: 'Hundred Sessions',
    description: 'Complete 100 pronunciation practice sessions',
    category: 'pronunciation',
    iconName: 'headphones',
    pointsAwarded: 250,
    requirementType: 'pronunciation_sessions',
    requirementValue: 100,
    isPremium: false,
  },

  // Consistency Achievements - Practice Streak
  {
    achievementKey: 'practice_streak_7',
    title: 'Week of Practice',
    description: 'Practice recitation or pronunciation for 7 consecutive days',
    category: 'consistency',
    iconName: 'calendar',
    pointsAwarded: 75,
    requirementType: 'practice_streak',
    requirementValue: 7,
    isPremium: false,
  },
  {
    achievementKey: 'practice_streak_30',
    title: 'Month of Practice',
    description: 'Practice recitation or pronunciation for 30 consecutive days',
    category: 'consistency',
    iconName: 'calendar-check',
    pointsAwarded: 300,
    requirementType: 'practice_streak',
    requirementValue: 30,
    isPremium: false,
  },
];

/**
 * Get achievement definition by key
 */
export function getAchievementDefinition(
  achievementKey: string,
): AchievementDefinition | undefined {
  return ACHIEVEMENT_DEFINITIONS.find(a => a.achievementKey === achievementKey);
}

/**
 * Get all achievements by category
 */
export function getAchievementsByCategory(
  category: AchievementDefinition['category'],
): AchievementDefinition[] {
  return ACHIEVEMENT_DEFINITIONS.filter(a => a.category === category);
}
