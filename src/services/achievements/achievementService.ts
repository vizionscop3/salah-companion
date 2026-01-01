/**
 * Achievement Service
 *
 * Manages achievement checking, unlocking, and progress tracking.
 * Integrates with analytics services to determine achievement eligibility.
 * 
 * NOTE: Prisma cannot run in React Native (Node.js only).
 * This service uses AsyncStorage for local storage.
 * TODO: Replace with proper backend API integration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ACHIEVEMENT_DEFINITIONS,
  type AchievementDefinition,
} from './achievementDefinitions';
import {getRecitationSummary} from '@services/progress/recitationAnalyticsService';
import {getPronunciationSummary} from '@services/progress/pronunciationAnalyticsService';
import {getTodayProgress} from '@services/progress/progressService';
import {getPrayerRecords} from '@services/progress/progressService';

export interface AchievementProgress {
  achievementKey: string;
  title: string;
  description: string;
  category: string;
  iconName: string;
  pointsAwarded: number;
  isUnlocked: boolean;
  progress: number; // 0-100
  requirementValue: number;
  currentValue: number;
  unlockedAt?: Date;
}

export interface UnlockedAchievement {
  achievementKey: string;
  title: string;
  description: string;
  category: string;
  iconName: string;
  pointsAwarded: number;
  unlockedAt: Date;
}

/**
 * Check and unlock achievements for a user
 * Returns list of newly unlocked achievements
 */
export async function checkAndUnlockAchievements(
  userId: string,
): Promise<UnlockedAchievement[]> {
  const newlyUnlocked: UnlockedAchievement[] = [];

  // Get user's current progress
  const [progress, recitationSummary, pronunciationSummary, prayerRecords] =
    await Promise.all([
      getTodayProgress(userId).catch(() => null),
      getRecitationSummary(userId).catch(() => null),
      getPronunciationSummary(userId).catch(() => null),
      getPrayerRecords(userId).catch(() => []),
    ]);

  // Get user's already unlocked achievements from AsyncStorage
  const achievementsKey = `@salah_companion:achievements:${userId}`;
  const achievementsJson = await AsyncStorage.getItem(achievementsKey);
  const unlockedAchievementKeys: string[] = achievementsJson
    ? JSON.parse(achievementsJson)
    : [];

  const unlockedKeys = new Set(unlockedAchievementKeys);

  // Check each achievement definition
  for (const definition of ACHIEVEMENT_DEFINITIONS) {
    if (unlockedKeys.has(definition.achievementKey)) {
      continue; // Already unlocked
    }

    const isEligible = await checkAchievementEligibility(
      definition,
      progress,
      recitationSummary,
      pronunciationSummary,
      prayerRecords,
    );

    if (isEligible) {
      // Unlock the achievement
      await unlockAchievement(userId, definition);
      newlyUnlocked.push({
        achievementKey: definition.achievementKey,
        title: definition.title,
        description: definition.description,
        category: definition.category,
        iconName: definition.iconName,
        pointsAwarded: definition.pointsAwarded,
        unlockedAt: new Date(),
      });
    }
  }

  return newlyUnlocked;
}

/**
 * Check if user is eligible for an achievement
 */
async function checkAchievementEligibility(
  definition: AchievementDefinition,
  progress: any,
  recitationSummary: any,
  pronunciationSummary: any,
  prayerRecords: any[],
): Promise<boolean> {
  const {requirementType, requirementValue} = definition;

  switch (requirementType) {
    case 'prayer_streak':
      return progress?.currentStreak >= requirementValue;

    case 'prayer_count':
      return prayerRecords.length >= requirementValue;

    case 'recitation_practices':
      return (recitationSummary?.totalPractices || 0) >= requirementValue;

    case 'recitation_surahs':
      return (recitationSummary?.surahsPracticed || 0) >= requirementValue;

    case 'recitation_accuracy':
      return (recitationSummary?.averageAccuracy || 0) >= requirementValue;

    case 'pronunciation_letters':
      return (pronunciationSummary?.lettersLearned || 0) >= requirementValue;

    case 'pronunciation_sessions':
      return (pronunciationSummary?.totalPracticeSessions || 0) >= requirementValue;

    case 'practice_streak':
      // Check for consecutive days with either recitation or pronunciation practice
      // This is simplified - in production, you'd track practice dates more precisely
      const practiceFrequency = recitationSummary?.practiceFrequency || {
        daily: 0,
        weekly: 0,
        monthly: 0,
      };
      const pronunciationFrequency = pronunciationSummary?.practiceFrequency || {
        daily: 0,
        weekly: 0,
        monthly: 0,
      };
      // For now, use weekly practice as a proxy for streak
      // In production, you'd track actual consecutive days
      if (requirementValue === 7) {
        return practiceFrequency.daily >= 7 || pronunciationFrequency.daily >= 7;
      }
      if (requirementValue === 30) {
        return practiceFrequency.weekly >= 4 || pronunciationFrequency.weekly >= 4;
      }
      return false;

    default:
      return false;
  }
}

/**
 * Unlock an achievement for a user
 */
async function unlockAchievement(
  userId: string,
  definition: AchievementDefinition,
): Promise<void> {
  try {
    // Get existing unlocked achievements
    const achievementsKey = `@salah_companion:achievements:${userId}`;
    const achievementsJson = await AsyncStorage.getItem(achievementsKey);
    const unlockedAchievementKeys: string[] = achievementsJson
      ? JSON.parse(achievementsJson)
      : [];

    // Check if user already has this achievement
    if (unlockedAchievementKeys.includes(definition.achievementKey)) {
      return; // Already unlocked
    }

    // Unlock the achievement
    unlockedAchievementKeys.push(definition.achievementKey);
    await AsyncStorage.setItem(achievementsKey, JSON.stringify(unlockedAchievementKeys));

    // Update user's experience points
    await updateUserExperiencePoints(userId, definition.pointsAwarded);
  } catch (error) {
    console.error('Error unlocking achievement:', error);
  }
}

/**
 * Update user's experience points
 */
async function updateUserExperiencePoints(
  userId: string,
  points: number,
): Promise<void> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Get existing progress
    const progressKey = `@salah_companion:user_progress:${userId}`;
    const progressJson = await AsyncStorage.getItem(progressKey);
    const allProgress: any[] = progressJson ? JSON.parse(progressJson) : [];

    let todayProgress = allProgress.find((p: any) => p.progressDate === todayStr);

    if (!todayProgress) {
      todayProgress = {
        userId,
        progressDate: todayStr,
        prayersCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        experiencePoints: points,
      };
      allProgress.push(todayProgress);
    } else {
      todayProgress.experiencePoints = (todayProgress.experiencePoints || 0) + points;
    }

    await AsyncStorage.setItem(progressKey, JSON.stringify(allProgress));
  } catch (error) {
    console.error('Error updating experience points:', error);
  }
}

/**
 * Get all achievements with progress for a user
 */
export async function getUserAchievementsWithProgress(
  userId: string,
): Promise<AchievementProgress[]> {
  const [progress, recitationSummary, pronunciationSummary, prayerRecords] =
    await Promise.all([
      getTodayProgress(userId).catch(() => null),
      getRecitationSummary(userId).catch(() => null),
      getPronunciationSummary(userId).catch(() => null),
      getPrayerRecords(userId).catch(() => []),
    ]);
  
  const unlockedAchievements = await getUnlockedAchievements(userId);

  // Get unlocked achievements from AsyncStorage
  const achievementsKey = `@salah_companion:achievements:${userId}`;
  const achievementsJson = await AsyncStorage.getItem(achievementsKey);
  const unlockedAchievementKeys: string[] = achievementsJson
    ? JSON.parse(achievementsJson)
    : [];

  const unlockedMap = new Map(
    unlockedAchievementKeys.map(key => [
      key,
      {
        achievement: {achievementKey: key},
        unlockedAt: new Date(), // We don't store exact unlock time in AsyncStorage
      },
    ]),
  );

  const achievements: AchievementProgress[] = [];

  for (const definition of ACHIEVEMENT_DEFINITIONS) {
    const unlocked = unlockedMap.get(definition.achievementKey);
    const {currentValue, progress: progressPercent} = calculateAchievementProgress(
      definition,
      progress,
      recitationSummary,
      pronunciationSummary,
      prayerRecords,
    );

    achievements.push({
      achievementKey: definition.achievementKey,
      title: definition.title,
      description: definition.description,
      category: definition.category,
      iconName: definition.iconName,
      pointsAwarded: definition.pointsAwarded,
      isUnlocked: !!unlocked,
      progress: progressPercent,
      requirementValue: definition.requirementValue,
      currentValue,
      unlockedAt: unlocked ? (unlocked.unlockedAt as Date) : undefined,
    });
  }

  return achievements;
}

/**
 * Calculate progress toward an achievement
 */
function calculateAchievementProgress(
  definition: AchievementDefinition,
  progress: any,
  recitationSummary: any,
  pronunciationSummary: any,
  prayerRecords: any[],
): {currentValue: number; progress: number} {
  const {requirementType, requirementValue} = definition;

  let currentValue = 0;

  switch (requirementType) {
    case 'prayer_streak':
      currentValue = progress?.currentStreak || 0;
      break;

    case 'prayer_count':
      currentValue = prayerRecords.length;
      break;

    case 'recitation_practices':
      currentValue = recitationSummary?.totalPractices || 0;
      break;

    case 'recitation_surahs':
      currentValue = recitationSummary?.surahsPracticed || 0;
      break;

    case 'recitation_accuracy':
      currentValue = Math.round(recitationSummary?.averageAccuracy || 0);
      break;

    case 'pronunciation_letters':
      currentValue = pronunciationSummary?.lettersLearned || 0;
      break;

    case 'pronunciation_sessions':
      currentValue = pronunciationSummary?.totalPracticeSessions || 0;
      break;

    case 'practice_streak':
      const practiceFreq = recitationSummary?.practiceFrequency || {
        daily: 0,
        weekly: 0,
      };
      const pronunciationFreq = pronunciationSummary?.practiceFrequency || {
        daily: 0,
        weekly: 0,
      };
      if (requirementValue === 7) {
        currentValue = Math.max(practiceFreq.daily, pronunciationFreq.daily);
      } else if (requirementValue === 30) {
        currentValue = Math.max(practiceFreq.weekly * 7, pronunciationFreq.weekly * 7);
      }
      break;
  }

  const progressPercent = Math.min(
    100,
    Math.max(0, (currentValue / requirementValue) * 100),
  );

  return {currentValue, progress: Math.round(progressPercent)};
}

/**
 * Get unlocked achievements for a user
 */
export async function getUnlockedAchievements(
  userId: string,
): Promise<UnlockedAchievement[]> {
  try {
    // Get unlocked achievement keys from AsyncStorage
    const achievementsKey = `@salah_companion:achievements:${userId}`;
    const achievementsJson = await AsyncStorage.getItem(achievementsKey);
    const unlockedAchievementKeys: string[] = achievementsJson
      ? JSON.parse(achievementsJson)
      : [];

    // Map keys to achievement definitions
    const achievements: UnlockedAchievement[] = [];
    for (const key of unlockedAchievementKeys) {
      const definition = ACHIEVEMENT_DEFINITIONS.find(d => d.achievementKey === key);
      if (definition) {
        achievements.push({
          achievementKey: definition.achievementKey,
          title: definition.title,
          description: definition.description,
          category: definition.category,
          iconName: definition.iconName || 'trophy',
          pointsAwarded: definition.pointsAwarded,
          unlockedAt: new Date(), // We don't store exact unlock time in AsyncStorage
        });
      }
    }
    return achievements;
  } catch (error) {
    console.error('Error getting unlocked achievements:', error);
    return [];
  }
}
