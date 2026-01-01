/**
 * AlAdhan Prayer Times API Service
 * 
 * Integrates with the AlAdhan Prayer Times API (https://aladhan.com/)
 * to fetch accurate prayer times based on location and calculation method.
 * 
 * API Documentation: https://aladhan.com/prayer-times-api
 * Calculation Methods: https://aladhan.com/calculation-methods
 */

import axios from 'axios';
import * as tz from 'date-fns-tz';
import {createSecureAxiosInstance} from '@services/security/apiSecurityService';
import {CalculationMethod, AsrMethod, PrayerTimes} from './prayerTimeService';

const ALADHAN_API_BASE = 'https://api.aladhan.com/v1';

/**
 * AlAdhan API calculation method mapping
 * Reference: https://aladhan.com/calculation-methods
 */
const ALADHAN_METHOD_MAP: Record<CalculationMethod, number> = {
  MWL: 3, // Muslim World League
  ISNA: 2, // Islamic Society of North America
  Egypt: 5, // Egyptian General Authority of Survey
  Makkah: 4, // Umm al-Qura, Makkah
  Karachi: 1, // University of Islamic Sciences, Karachi
  Tehran: 7, // Institute of Geophysics, University of Tehran
  Jafari: 0, // Shia Ithna-Ashari, Leva Institute, Qum
};

/**
 * AlAdhan API Asr method mapping
 * 0 = Shafi, Hanafi, Maliki, Hanbali (Standard)
 * 1 = Hanafi
 */
const ALADHAN_ASR_METHOD_MAP: Record<AsrMethod, number> = {
  Shafi: 0,
  Hanafi: 1,
};

/**
 * AlAdhan API response structure
 */
interface AlAdhanApiResponse {
  code: number;
  status: string;
  data: {
    timings: {
      Fajr: string;
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Maghrib: string;
      Isha: string;
    };
    date: {
      readable: string;
      timestamp: string;
    };
    meta: {
      latitude: number;
      longitude: number;
      timezone: string;
      method: {
        id: number;
        name: string;
        params: {
          Fajr: number;
          Isha: number;
        };
      };
    };
  };
}

/**
 * Cache for prayer times to reduce API calls
 */
interface CachedPrayerTimes {
  times: PrayerTimes;
  timestamp: number;
  locationKey: string;
}

let prayerTimesCache: CachedPrayerTimes | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour cache

/**
 * Generate cache key from location and method
 */
function getCacheKey(
  latitude: number,
  longitude: number,
  method: CalculationMethod,
  asrMethod: AsrMethod,
  date?: Date,
): string {
  const dateStr = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  return `${latitude},${longitude},${method},${asrMethod},${dateStr}`;
}

/**
 * Parse AlAdhan time string (HH:mm format) to Date object in the specified timezone
 * AlAdhan API returns times in the local timezone, so we need to properly convert them
 */
function parseAlAdhanTime(timeString: string, date: Date, timezone: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Create a date string in ISO format (YYYY-MM-DD)
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
  // Create a date string with the time (treating it as if it's in the target timezone)
  const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  const dateTimeString = `${dateStr}T${timeStr}`;
  
  // Parse the date/time as if it's in the specified timezone
  // zonedTimeToUtc converts a time in a specific timezone to UTC
  const zonedDate = tz.zonedTimeToUtc(dateTimeString, timezone);
  
  return zonedDate;
}

/**
 * Fetch prayer times from AlAdhan API
 */
export async function fetchPrayerTimesFromAlAdhan(
  latitude: number,
  longitude: number,
  calculationMethod: CalculationMethod = 'ISNA',
  asrMethod: AsrMethod = 'Shafi',
  date?: Date,
): Promise<PrayerTimes> {
  const targetDate = date || new Date();
  const cacheKey = getCacheKey(latitude, longitude, calculationMethod, asrMethod, targetDate);

  // Check cache first
  if (
    prayerTimesCache &&
    prayerTimesCache.locationKey === cacheKey &&
    Date.now() - prayerTimesCache.timestamp < CACHE_DURATION
  ) {
    if (__DEV__) {
      console.log('✅ Using cached prayer times from AlAdhan API');
    }
    return prayerTimesCache.times;
  }

  try {
    // Format date for API (DD-MM-YYYY)
    const dateStr = `${targetDate.getDate().toString().padStart(2, '0')}-${(
      targetDate.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${targetDate.getFullYear()}`;

    // Map calculation method to AlAdhan method number
    const methodNumber = ALADHAN_METHOD_MAP[calculationMethod];
    const asrMethodNumber = ALADHAN_ASR_METHOD_MAP[asrMethod];

    // Build API URL
    const apiUrl = `${ALADHAN_API_BASE}/timings/${dateStr}`;
    const params = {
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      method: methodNumber.toString(),
      school: asrMethodNumber.toString(), // 0 = Shafi, 1 = Hanafi
    };

    if (__DEV__) {
      console.log('📡 Fetching prayer times from AlAdhan API:', {
        url: apiUrl,
        params,
      });
    }

    // Use secure axios instance
    const secureAxios = createSecureAxiosInstance();
    const response = await secureAxios.get<AlAdhanApiResponse>(apiUrl, {
      params,
      timeout: 10000, // 10 second timeout
    });

    if (response.data.code !== 200) {
      throw new Error(
        `AlAdhan API error: ${response.data.status} (code: ${response.data.code})`,
      );
    }

    const {timings} = response.data.data;
    const timezone = response.data.data.meta.timezone;

    // Parse times to Date objects
    const prayerTimes: PrayerTimes = {
      fajr: parseAlAdhanTime(timings.Fajr, targetDate, timezone),
      sunrise: parseAlAdhanTime(timings.Sunrise, targetDate, timezone),
      dhuhr: parseAlAdhanTime(timings.Dhuhr, targetDate, timezone),
      asr: parseAlAdhanTime(timings.Asr, targetDate, timezone),
      maghrib: parseAlAdhanTime(timings.Maghrib, targetDate, timezone),
      isha: parseAlAdhanTime(timings.Isha, targetDate, timezone),
    };

    // Cache the results
    prayerTimesCache = {
      times: prayerTimes,
      timestamp: Date.now(),
      locationKey: cacheKey,
    };

    if (__DEV__) {
      console.log('✅ Prayer times fetched from AlAdhan API:', {
        method: response.data.data.meta.method.name,
        fajr: timings.Fajr,
        dhuhr: timings.Dhuhr,
        asr: timings.Asr,
        maghrib: timings.Maghrib,
        isha: timings.Isha,
      });
    }

    return prayerTimes;
  } catch (error) {
    if (__DEV__) {
      console.error('❌ Error fetching prayer times from AlAdhan API:', error);
    }
    throw error;
  }
}

/**
 * Clear the prayer times cache
 */
export function clearPrayerTimesCache(): void {
  prayerTimesCache = null;
  if (__DEV__) {
    console.log('🗑️ Prayer times cache cleared');
  }
}

/**
 * Check if AlAdhan API is available (network check)
 */
export async function isAlAdhanApiAvailable(): Promise<boolean> {
  try {
    // Simple connectivity check
    const secureAxios = createSecureAxiosInstance();
    await secureAxios.get(`${ALADHAN_API_BASE}/timings/today`, {
      params: {
        latitude: '40.7128',
        longitude: '-74.006',
        method: '2', // ISNA
      },
      timeout: 5000, // 5 second timeout for availability check
    });
    return true;
  } catch {
    return false;
  }
}

