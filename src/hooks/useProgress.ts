/**
 * useProgress Hook
 *
 * React hook for managing user prayer progress.
 */

import {useState, useEffect, useCallback} from 'react';
import {
  getTodayProgress,
  recordPrayerCompletion,
  ProgressStats,
  PrayerCompletionData,
} from '@services/progress/progressService';

export interface UseProgressReturn {
  progress: ProgressStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markPrayerComplete: (data: Omit<PrayerCompletionData, 'userId'>) => Promise<void>;
}

/**
 * Hook to get and manage user progress
 */
export function useProgress(userId: string | null): UseProgressReturn {
  const [progress, setProgress] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProgress = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const progressData = await getTodayProgress(userId);
      setProgress(progressData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load progress';
      setError(errorMessage);
      console.error('Error loading progress:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const markPrayerComplete = useCallback(
    async (data: Omit<PrayerCompletionData, 'userId'>) => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      try {
        await recordPrayerCompletion({
          ...data,
          userId,
        });
        // Refresh progress after marking complete
        await loadProgress();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to record prayer completion';
        console.error('Error recording prayer:', err);
        throw new Error(errorMessage);
      }
    },
    [userId, loadProgress],
  );

  return {
    progress,
    loading,
    error,
    refresh: loadProgress,
    markPrayerComplete,
  };
}

