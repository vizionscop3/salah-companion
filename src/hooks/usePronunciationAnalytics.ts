/**
 * usePronunciationAnalytics Hook
 *
 * React hook for fetching pronunciation practice analytics.
 */

import {useState, useEffect, useCallback} from 'react';
import {
  getPronunciationSummary,
  type PronunciationSummary,
} from '@services/progress/pronunciationAnalyticsService';

export interface UsePronunciationAnalyticsReturn {
  summary: PronunciationSummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to get pronunciation analytics
 */
export function usePronunciationAnalytics(
  userId: string | null,
): UsePronunciationAnalyticsReturn {
  const [summary, setSummary] = useState<PronunciationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const analytics = await getPronunciationSummary(userId);
      setSummary(analytics);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load pronunciation analytics';
      setError(errorMessage);
      console.error('Error loading pronunciation analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    summary,
    loading,
    error,
    refresh: loadAnalytics,
  };
}
