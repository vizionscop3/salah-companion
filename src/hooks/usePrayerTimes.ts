/**
 * usePrayerTimes Hook
 * 
 * Custom hook for managing prayer times with location detection.
 */

import {useState, useEffect, useCallback} from 'react';
import {
  calculatePrayerTimes,
  getNextPrayer,
  PrayerTimes,
  PrayerTimeConfig,
} from '@services/prayer/prayerTimeService';
import {
  getCurrentLocation,
  requestLocationPermission,
  getTimezoneFromLocation,
  Location,
} from '@services/location/locationService';

export interface UsePrayerTimesReturn {
  prayerTimes: PrayerTimes | null;
  nextPrayer: {prayer: string; time: Date} | null;
  location: Location | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function usePrayerTimes(
  config?: Partial<PrayerTimeConfig>,
): UsePrayerTimesReturn {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{
    prayer: string;
    time: Date;
  } | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateTimes = useCallback(
    async (userLocation?: Location) => {
      try {
        setLoading(true);
        setError(null);

        let finalLocation = userLocation;

        // Get location if not provided
        if (!finalLocation) {
          const hasPermission = await requestLocationPermission();
          if (!hasPermission) {
            throw new Error('Location permission denied');
          }

          finalLocation = await getCurrentLocation();
          setLocation(finalLocation);
        }

        // Default to New York if location unavailable
        const latitude = finalLocation?.latitude ?? 40.7128;
        const longitude = finalLocation?.longitude ?? -74.006;
        const timezone =
          finalLocation
            ? getTimezoneFromLocation(latitude, longitude)
            : 'America/New_York';

        // Calculate prayer times
        const times = calculatePrayerTimes({
          latitude,
          longitude,
          timezone,
          calculationMethod: config?.calculationMethod ?? 'MWL',
          asrMethod: config?.asrMethod ?? 'Shafi',
          fajrAngle: config?.fajrAngle,
          ishaAngle: config?.ishaAngle,
          date: config?.date,
        });

        setPrayerTimes(times);
        setNextPrayer(getNextPrayer(times));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to calculate prayer times';
        setError(errorMessage);
        console.error('Error calculating prayer times:', err);
      } finally {
        setLoading(false);
      }
    },
    [config],
  );

  useEffect(() => {
    calculateTimes();
  }, [calculateTimes]);

  const refresh = useCallback(async () => {
    await calculateTimes();
  }, [calculateTimes]);

  return {
    prayerTimes,
    nextPrayer,
    location,
    loading,
    error,
    refresh,
  };
}

