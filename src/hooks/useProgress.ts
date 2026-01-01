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
import {
  getGuestProgress,
  recordGuestPrayer,
  GuestProgress,
} from '@services/guest/guestProgressService';
import {useAuth} from '@context/AuthContext';

export interface UseProgressReturn {
  progress: ProgressStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markPrayerComplete: (data: Omit<PrayerCompletionData, 'userId'>) => Promise<void>;
}

/**
 * Hook to get and manage user progress
 * Supports both authenticated users and guest mode
 */
export function useProgress(userId: string | null): UseProgressReturn {
  const {isGuest} = useAuth();
  const [progress, setProgress] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProgress = useCallback(async () => {
    // If guest mode, load guest progress
    if (isGuest || !userId) {
      try {
        setLoading(true);
        setError(null);
        
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Progress loading timeout')), 5000);
        });
        
        const guestProgressData = await Promise.race([
          getGuestProgress(),
          timeoutPromise,
        ]);
        
        if (guestProgressData) {
          // Convert guest progress to ProgressStats format
          setProgress({
            prayersCompleted: guestProgressData.prayersCompleted,
            totalPrayers: 5,
            currentStreak: guestProgressData.currentStreak,
            longestStreak: guestProgressData.longestStreak,
            achievements: guestProgressData.achievements.length,
            todayProgress: guestProgressData.prayersCompleted,
          });
        } else {
          setProgress({
            prayersCompleted: 0,
            totalPrayers: 5,
            currentStreak: 0,
            longestStreak: 0,
            achievements: 0,
            todayProgress: 0,
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load guest progress';
        setError(errorMessage);
        console.error('Error loading guest progress:', err);
        setProgress({
          prayersCompleted: 0,
          totalPrayers: 5,
          currentStreak: 0,
          longestStreak: 0,
          achievements: 0,
          todayProgress: 0,
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    // Authenticated user - load from progress service
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Add timeout protection for progress loading
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Progress loading timeout')), 5000);
      });
      
      const progressData = await Promise.race([
        getTodayProgress(userId),
        timeoutPromise,
      ]);
      
      setProgress(progressData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load progress';
      setError(errorMessage);
      console.error('Error loading progress:', err);
      
      // Set default progress on error to prevent infinite loading
      setProgress({
        prayersCompleted: 0,
        totalPrayers: 5,
        currentStreak: 0,
        longestStreak: 0,
        achievements: 0,
        todayProgress: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const markPrayerComplete = useCallback(
    async (data: Omit<PrayerCompletionData, 'userId'>) => {
      // If guest mode, record to guest progress
      if (isGuest || !userId) {
        try {
          await recordGuestPrayer(data.prayerName, true);
          // Refresh progress after marking complete
          await loadProgress();
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : 'Failed to record guest prayer';
          console.error('Error recording guest prayer:', err);
          throw new Error(errorMessage);
        }
        return;
      }

      // Authenticated user - record to progress service
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
    [userId, isGuest, loadProgress],
  );

  return {
    progress,
    loading,
    error,
    refresh: loadProgress,
    markPrayerComplete,
  };
}

