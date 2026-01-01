/**
 * usePrayerTimes Hook
 * 
 * Custom hook for managing prayer times with location detection.
 */

import {useState, useEffect, useCallback} from 'react';
import {
  calculatePrayerTimes,
  getNextPrayer,
  getRecommendedCalculationMethod,
  PrayerTimes,
  PrayerTimeConfig,
} from '@services/prayer/prayerTimeService';
import {
  fetchPrayerTimesFromAlAdhan,
  isAlAdhanApiAvailable,
} from '@services/prayer/aladhanApiService';
import {
  getCurrentLocation,
  requestLocationPermission,
  getTimezoneFromLocation,
  getUserLocation,
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
  
  // Immediately calculate with default coordinates to prevent loading loop
  // Then try to get user location in the background
  useEffect(() => {
    // Set default prayer times immediately so app doesn't hang
    // Use ISNA for New York (North America standard, matches ICCNY)
    const defaultMethod = config?.calculationMethod ?? 
      getRecommendedCalculationMethod(40.7128, -74.006, 'America/New_York');
    const defaultTimes = calculatePrayerTimes({
      latitude: 40.7128,
      longitude: -74.006,
      timezone: 'America/New_York',
      calculationMethod: defaultMethod,
      asrMethod: config?.asrMethod ?? 'Shafi',
    });
    setPrayerTimes(defaultTimes);
    setNextPrayer(getNextPrayer(defaultTimes));
    setLoading(false);
    console.log('✅ Default prayer times set immediately');
  }, []); // Only run once on mount
  
  // Timeout protection: if loading takes too long, use defaults (3 seconds max)
  useEffect(() => {
    if (!loading || prayerTimes) return; // Don't set timeout if not loading or already have data
    
      const timeout = setTimeout(() => {
        if (__DEV__) {
          console.warn('⏱️ Prayer times loading timeout (3s) - using default location');
        }
        setLoading(false);
        // Calculate with default location immediately
        // Use ISNA for New York (North America standard, matches ICCNY)
        const defaultMethod = config?.calculationMethod ?? 
          getRecommendedCalculationMethod(40.7128, -74.006, 'America/New_York');
        const times = calculatePrayerTimes({
          latitude: 40.7128,
          longitude: -74.006,
          timezone: 'America/New_York',
          calculationMethod: defaultMethod,
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

        // Get location if not provided - Priority: Manual > GPS > Default
        if (!finalLocation) {
          try {
            // Use getUserLocation which checks manual location first, then GPS, then default
            const userLocationResult = await getUserLocation();
            finalLocation = {
              latitude: userLocationResult.latitude,
              longitude: userLocationResult.longitude,
            };
            setLocation(finalLocation);
            
            if (__DEV__) {
              console.log(`📍 Location source: ${userLocationResult.source}`);
              if (userLocationResult.source === 'manual') {
                console.log('✅ Using manual location selection');
              } else if (userLocationResult.source === 'gps') {
                console.log('✅ Using GPS location');
              } else {
                console.log('ℹ️ Using default location (New York)');
              }
            }
          } catch (locationError) {
            // Only log in dev mode
            if (__DEV__) {
              console.warn('⚠️ Error getting location - using default coordinates:', locationError);
            }
            // Use default location on any error
            finalLocation = undefined;
          }
        }

        // Always use default coordinates if location unavailable (privacy-friendly)
        const latitude = finalLocation?.latitude ?? 40.7128;
        const longitude = finalLocation?.longitude ?? -74.006;
        
        // Get timezone - try to get from manual location or calculate from coordinates
        let timezone = 'America/New_York';
        try {
          const userLocationResult = await getUserLocation();
          timezone = userLocationResult.timezone;
        } catch {
          // Fallback to calculating from coordinates
          timezone = getTimezoneFromLocation(latitude, longitude);
        }

        // Determine calculation method: use config if provided, otherwise recommend based on location
        const calculationMethod = config?.calculationMethod ?? 
          getRecommendedCalculationMethod(latitude, longitude, timezone);

        console.log(`🕌 Calculating prayer times for: ${finalLocation ? 'User location' : 'Default location (New York)'}`);
        if (__DEV__) {
          console.log(`📐 Using calculation method: ${calculationMethod}`);
        }

        // Try AlAdhan API first (more accurate, matches local mosque timings)
        let times: PrayerTimes;
        try {
          const apiAvailable = await isAlAdhanApiAvailable();
          if (apiAvailable) {
            if (__DEV__) {
              console.log('📡 Fetching prayer times from AlAdhan API...');
            }
            times = await fetchPrayerTimesFromAlAdhan(
              latitude,
              longitude,
              calculationMethod,
              config?.asrMethod ?? 'Shafi',
              config?.date,
            );
            if (__DEV__) {
              console.log('✅ Prayer times fetched from AlAdhan API');
            }
          } else {
            throw new Error('AlAdhan API not available');
          }
        } catch (apiError) {
          // Fallback to local calculation if API fails
          if (__DEV__) {
            console.warn('⚠️ AlAdhan API failed, using local calculation:', apiError);
          }
          times = calculatePrayerTimes({
            latitude,
            longitude,
            timezone,
            calculationMethod,
            asrMethod: config?.asrMethod ?? 'Shafi',
            fajrAngle: config?.fajrAngle,
            ishaAngle: config?.ishaAngle,
            date: config?.date,
          });
          if (__DEV__) {
            console.log('✅ Prayer times calculated locally');
          }
        }

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
          // Use ISNA for New York (North America standard, matches ICCNY)
          const defaultMethod = config?.calculationMethod ?? 
            getRecommendedCalculationMethod(40.7128, -74.006, 'America/New_York');
          const defaultTimes = calculatePrayerTimes({
            latitude: 40.7128,
            longitude: -74.006,
            timezone: 'America/New_York',
            calculationMethod: defaultMethod,
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

  // Try to get user location in the background after default times are set
  useEffect(() => {
    // Only try to get location if we have default times already set
    // This prevents blocking the initial render
    if (prayerTimes && !location) {
      // Get location in background and update if successful (non-blocking)
      setTimeout(() => {
        calculateTimes().catch((err) => {
          if (__DEV__) {
            console.warn('Background location update failed, keeping defaults:', err);
          }
          // Keep default times if location fails - app still works
        });
      }, 100); // Small delay to ensure UI renders first
    }
  }, [prayerTimes, location, calculateTimes]);

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

