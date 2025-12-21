/**
 * useRecitationAnalytics Hook
 *
 * React hook for fetching recitation practice analytics.
 */

import {useState, useEffect, useCallback} from 'react';
import {getRecitationSummary, type RecitationSummary} from '@services/progress/recitationAnalyticsService';

export interface UseRecitationAnalyticsReturn {
  summary: RecitationSummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to get recitation analytics
 */
export function useRecitationAnalytics(userId: string | null): UseRecitationAnalyticsReturn {
  const [summary, setSummary] = useState<RecitationSummary | null>(null);
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
      const analytics = await getRecitationSummary(userId);
      setSummary(analytics);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load recitation analytics';
      setError(errorMessage);
      console.error('Error loading recitation analytics:', err);
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
