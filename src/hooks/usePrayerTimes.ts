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
  
  // Timeout protection: if loading takes too long, use defaults (3 seconds max)
  useEffect(() => {
    if (!loading || prayerTimes) return; // Don't set timeout if not loading or already have data
    
    const timeout = setTimeout(() => {
      console.warn('⏱️ Prayer times loading timeout (3s) - using default location');
      setLoading(false);
      // Calculate with default location immediately
      const times = calculatePrayerTimes({
        latitude: 40.7128,
        longitude: -74.006,
        timezone: 'America/New_York',
        calculationMethod: config?.calculationMethod ?? 'MWL',
        asrMethod: config?.asrMethod ?? 'Shafi',
      });
      setPrayerTimes(times);
      setNextPrayer(getNextPrayer(times));
      console.log('✅ Timeout fallback: Default prayer times set');
    }, 3000); // 3 second timeout (maximum)
    
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, prayerTimes]);

  const calculateTimes = useCallback(
    async (userLocation?: Location) => {
      try {
        setLoading(true);
        setError(null);

        let finalLocation = userLocation;

        // Get location if not provided - with fast timeout and graceful fallback
        if (!finalLocation) {
          try {
            // Check permission first (fast check)
            const hasPermission = await requestLocationPermission();
            if (!hasPermission) {
              console.log('📍 Location permission denied - using default coordinates');
              // Immediately use default location - don't wait
              finalLocation = null;
            } else {
              // Try to get location with a short timeout (3 seconds max)
              console.log('📍 Attempting to get current location...');
              const locationPromise = getCurrentLocation();
              const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('Location request timeout')), 3000);
              });
              
              try {
                finalLocation = await Promise.race([locationPromise, timeoutPromise]);
                setLocation(finalLocation);
                console.log('✅ Location obtained successfully');
              } catch (locationError) {
                console.warn('⚠️ Location request failed or timed out - using default coordinates:', locationError);
                // Use default location on any error
                finalLocation = null;
              }
            }
          } catch (locationError) {
            console.warn('⚠️ Error in location flow - using default coordinates:', locationError);
            // Use default location on any error
            finalLocation = null;
          }
        }

        // Always use default coordinates if location unavailable (privacy-friendly)
        const latitude = finalLocation?.latitude ?? 40.7128;
        const longitude = finalLocation?.longitude ?? -74.006;
        const timezone =
          finalLocation
            ? getTimezoneFromLocation(latitude, longitude)
            : 'America/New_York';

        console.log(`🕌 Calculating prayer times for: ${finalLocation ? 'User location' : 'Default location (New York)'}`);

        // Calculate prayer times (this is synchronous and fast)
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
        console.log('✅ Prayer times calculated successfully');
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to calculate prayer times';
        setError(errorMessage);
        console.error('❌ Error calculating prayer times:', err);
        
        // Even on error, try to calculate with defaults to ensure app works
        try {
          const defaultTimes = calculatePrayerTimes({
            latitude: 40.7128,
            longitude: -74.006,
            timezone: 'America/New_York',
            calculationMethod: config?.calculationMethod ?? 'MWL',
            asrMethod: config?.asrMethod ?? 'Shafi',
          });
          setPrayerTimes(defaultTimes);
          setNextPrayer(getNextPrayer(defaultTimes));
          console.log('✅ Fallback: Using default prayer times');
        } catch (fallbackError) {
          console.error('❌ Even fallback calculation failed:', fallbackError);
        }
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

