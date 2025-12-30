/**
 * Sharing Service
 *
 * Handles sharing achievements, progress, and milestones.
 */

import {Share, Platform} from 'react-native';
import {Linking} from 'react-native';

export interface ShareableContent {
  type: 'achievement' | 'progress' | 'streak' | 'practice' | 'memorization';
  title: string;
  message: string;
  imageUrl?: string;
  deepLink?: string;
}

/**
 * Share content using native sharing
 */
export async function shareContent(content: ShareableContent): Promise<boolean> {
  try {
    const shareOptions = {
      title: content.title,
      message: content.message,
      url: content.deepLink,
    };

    const result = await Share.share(shareOptions);

    if (result.action === Share.sharedAction) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error sharing content:', error);
    return false;
  }
}

/**
 * Share achievement
 */
export async function shareAchievement(
  achievementTitle: string,
  achievementDescription: string,
): Promise<boolean> {
  const content: ShareableContent = {
    type: 'achievement',
    title: '🎉 Achievement Unlocked!',
    message: `I just unlocked "${achievementTitle}" in Salah Companion!\n\n${achievementDescription}\n\n#SalahCompanion #IslamicApp`,
  };

  return shareContent(content);
}

/**
 * Share prayer streak
 */
export async function sharePrayerStreak(streak: number): Promise<boolean> {
  const content: ShareableContent = {
    type: 'streak',
    title: '🔥 Prayer Streak!',
    message: `I've maintained a ${streak}-day prayer streak! 🎉\n\nKeep me in your duas!\n\n#SalahCompanion #PrayerStreak #IslamicApp`,
  };

  return shareContent(content);
}

/**
 * Share practice session
 */
export async function sharePracticeSession(
  surahName: string,
  accuracy: number,
): Promise<boolean> {
  const content: ShareableContent = {
    type: 'practice',
    title: '📖 Practice Session',
    message: `Just practiced ${surahName} with ${accuracy}% accuracy! 📚\n\n#SalahCompanion #QuranPractice #IslamicApp`,
  };

  return shareContent(content);
}

/**
 * Share memorization milestone
 */
export async function shareMemorizationMilestone(
  surahName: string,
  status: 'learning' | 'reviewing' | 'mastered',
): Promise<boolean> {
  const statusEmoji = {
    learning: '📚',
    reviewing: '🔄',
    mastered: '✅',
  };

  const statusText = {
    learning: 'learning',
    reviewing: 'reviewing',
    mastered: 'mastered',
  };

  const content: ShareableContent = {
    type: 'memorization',
    title: `${statusEmoji[status]} Memorization Progress`,
    message: `I'm ${statusText[status]} ${surahName}! ${statusEmoji[status]}\n\n#SalahCompanion #QuranMemorization #IslamicApp`,
  };

  return shareContent(content);
}

/**
 * Share overall progress
 */
export async function shareProgress(
  prayersCompleted: number,
  streak: number,
  achievements: number,
): Promise<boolean> {
  const content: ShareableContent = {
    type: 'progress',
    title: '📊 My Progress',
    message: `My Salah Companion Progress:\n\n✅ ${prayersCompleted} prayers completed\n🔥 ${streak}-day streak\n🏆 ${achievements} achievements unlocked\n\n#SalahCompanion #IslamicApp`,
  };

  return shareContent(content);
}

/**
 * Generate shareable image URL (placeholder)
 * In production, this would generate an actual image
 */
export function generateShareableImageUrl(
  content: ShareableContent,
): string | undefined {
  // In production, this would call an API to generate a shareable image
  // For now, return undefined
  return undefined;
}

