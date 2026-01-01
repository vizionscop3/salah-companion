/**
 * useAchievements Hook
 *
 * React hook for managing user achievements.
 */

import {useState, useEffect, useCallback} from 'react';
import {
  getUserAchievementsWithProgress,
  checkAndUnlockAchievements,
  getUnlockedAchievements,
  type AchievementProgress,
  type UnlockedAchievement,
} from '@services/achievements/achievementService';

export interface UseAchievementsReturn {
  achievements: AchievementProgress[];
  unlockedAchievements: UnlockedAchievement[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  checkForNewAchievements: () => Promise<UnlockedAchievement[]>;
}

/**
 * Hook to get and manage user achievements
 */
export function useAchievements(userId: string | null): UseAchievementsReturn {
  const [achievements, setAchievements] = useState<AchievementProgress[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<
    UnlockedAchievement[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAchievements = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [allAchievements, unlocked] = await Promise.all([
        getUserAchievementsWithProgress(userId),
        getUnlockedAchievements(userId),
      ]);
      setAchievements(allAchievements);
      setUnlockedAchievements(unlocked);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load achievements';
      setError(errorMessage);
      console.error('Error loading achievements:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const checkForNewAchievements = useCallback(async (): Promise<
    UnlockedAchievement[]
  > => {
    if (!userId) {
      return [];
    }

    try {
      const newlyUnlocked = await checkAndUnlockAchievements(userId);
      if (newlyUnlocked.length > 0) {
        // Refresh achievements list
        await loadAchievements();
      }
      return newlyUnlocked;
    } catch (err) {
      console.error('Error checking achievements:', err);
      return [];
    }
  }, [userId, loadAchievements]);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  return {
    achievements,
    unlockedAchievements,
    loading,
    error,
    refresh: loadAchievements,
    checkForNewAchievements,
  };
}
