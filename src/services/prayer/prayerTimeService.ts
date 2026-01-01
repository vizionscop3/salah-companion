/**
 * Prayer Time Calculation Service
 * 
 * Calculates prayer times using various calculation methods.
 * Supports multiple madhabs and high-latitude adjustments.
 */

import {format, addDays, startOfDay} from 'date-fns';
import * as tz from 'date-fns-tz';

export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type CalculationMethod =
  | 'MWL' // Muslim World League
  | 'ISNA' // Islamic Society of North America
  | 'Egypt' // Egyptian General Authority of Survey
  | 'Makkah' // Umm al-Qura, Makkah
  | 'Karachi' // University of Islamic Sciences, Karachi
  | 'Tehran' // Institute of Geophysics, University of Tehran
  | 'Jafari'; // Shia Ithna-Ashari, Leva Institute, Qum

export type AsrMethod = 'Shafi' | 'Hanafi';

export interface PrayerTimes {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

export interface PrayerTimeConfig {
  latitude: number;
  longitude: number;
  timezone: string;
  calculationMethod: CalculationMethod;
  asrMethod: AsrMethod;
  fajrAngle?: number;
  ishaAngle?: number;
  date?: Date;
}

/**
 * Calculation method parameters
 */
const METHOD_PARAMS: Record<
  CalculationMethod,
  {fajr: number; isha: number}
> = {
  MWL: {fajr: 18.0, isha: 17.0},
  ISNA: {fajr: 15.0, isha: 15.0}, // Standard for North America (used by ICCNY)
  Egypt: {fajr: 19.5, isha: 17.5},
  Makkah: {fajr: 18.5, isha: 19.0}, // Isha is 90 minutes after Maghrib
  Karachi: {fajr: 18.0, isha: 18.0},
  Tehran: {fajr: 17.7, isha: 14.0},
  Jafari: {fajr: 16.0, isha: 14.0},
};

/**
 * Get the recommended calculation method based on location
 * ISNA is standard for North America (used by ICCNY and most US mosques)
 */
export function getRecommendedCalculationMethod(
  latitude: number,
  longitude: number,
  timezone?: string,
): CalculationMethod {
  // Check if location is in North America (USA, Canada, Mexico)
  // North America roughly: latitude 25-70, longitude -170 to -50
  const isNorthAmerica =
    latitude >= 25 &&
    latitude <= 70 &&
    longitude >= -170 &&
    longitude <= -50;

  // Also check timezone for North America
  const isNorthAmericaTimezone =
    timezone &&
    (timezone.startsWith('America/') ||
      timezone.startsWith('US/') ||
      timezone.startsWith('Canada/'));

  if (isNorthAmerica || isNorthAmericaTimezone) {
    return 'ISNA'; // Islamic Society of North America - standard for US/Canada
  }

  // Default to MWL for other regions
  return 'MWL';
}

/**
 * Calculate prayer times for a given date and location
 */
export function calculatePrayerTimes(
  config: PrayerTimeConfig,
): PrayerTimes {
  const {
    latitude,
    longitude,
    timezone,
    calculationMethod,
    asrMethod,
    fajrAngle,
    ishaAngle,
    date = new Date(),
  } = config;

  const methodParams = METHOD_PARAMS[calculationMethod];
  const fajrAngleDeg = fajrAngle ?? methodParams.fajr;
  const ishaAngleDeg = ishaAngle ?? methodParams.isha;

  // Get Julian day
  const julianDay = getJulianDay(date);
  
  // Calculate solar coordinates
  const solarCoords = calculateSolarCoordinates(julianDay);
  
  // Calculate equation of time
  const equationOfTime = calculateEquationOfTime(solarCoords);
  
  // Calculate declination
  const declination = calculateDeclination(solarCoords);

  // Calculate Fajr time
  const fajr = calculateTime(
    latitude,
    longitude,
    timezone,
    -fajrAngleDeg,
    declination,
    equationOfTime,
    julianDay,
  );

  // Calculate Sunrise
  const sunrise = calculateTime(
    latitude,
    longitude,
    timezone,
    -0.833, // Standard sunrise angle
    declination,
    equationOfTime,
    julianDay,
  );

  // Calculate Dhuhr (midday)
  const dhuhr = calculateMidday(longitude, timezone, equationOfTime, julianDay);

  // Calculate Asr
  const asr = calculateAsr(
    latitude,
    longitude,
    timezone,
    declination,
    equationOfTime,
    julianDay,
    asrMethod,
  );

  // Calculate Maghrib (sunset)
  const maghrib = calculateTime(
    latitude,
    longitude,
    timezone,
    -0.833, // Standard sunset angle
    declination,
    equationOfTime,
    julianDay,
  );

  // Calculate Isha
  let isha: Date;
  if (calculationMethod === 'Makkah') {
    // Makkah: Isha is 90 minutes after Maghrib
    isha = new Date(maghrib.getTime() + 90 * 60 * 1000);
  } else {
    isha = calculateTime(
      latitude,
      longitude,
      timezone,
      -ishaAngleDeg,
      declination,
      equationOfTime,
      julianDay,
    );
  }

  return {
    fajr,
    sunrise,
    dhuhr,
    asr,
    maghrib,
    isha,
  };
}

/**
 * Get Julian day number
 */
function getJulianDay(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (month <= 2) {
    const yearAdj = year - 1;
    const monthAdj = month + 12;
    const a = Math.floor(yearAdj / 100);
    const b = 2 - a + Math.floor(a / 4);
    return (
      Math.floor(365.25 * (yearAdj + 4716)) +
      Math.floor(30.6001 * (monthAdj + 1)) +
      day +
      b -
      1524.5
    );
  }

  const a = Math.floor(year / 100);
  const b = 2 - a + Math.floor(a / 4);
  return (
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day +
    b -
    1524.5
  );
}

/**
 * Calculate solar coordinates
 */
function calculateSolarCoordinates(julianDay: number) {
  const D = julianDay - 2451545.0;
  const g = (357.529 + 0.98560028 * D) % 360;
  const q = (280.459 + 0.98564736 * D) % 360;
  const L = (q + 1.915 * Math.sin((g * Math.PI) / 180) + 0.02 * Math.sin((2 * g * Math.PI) / 180)) % 360;

  return {
    meanAnomaly: g,
    meanLongitude: q,
    eclipticLongitude: L,
  };
}

/**
 * Calculate equation of time
 */
function calculateEquationOfTime(solarCoords: {
  meanAnomaly: number;
  eclipticLongitude: number;
}): number {
  const g = solarCoords.meanAnomaly;
  const L = solarCoords.eclipticLongitude;
  const delta = 23.44 * Math.sin(((L - 80) * Math.PI) / 180);
  const EQT =
    4 *
    (g -
      0.0057183 -
      L +
      Math.atan(
        (Math.tan((L * Math.PI) / 180) * Math.cos((delta * Math.PI) / 180)) /
          Math.cos((L * Math.PI) / 180),
      ) *
        (180 / Math.PI));
  return EQT;
}

/**
 * Calculate declination
 */
function calculateDeclination(solarCoords: {
  eclipticLongitude: number;
}): number {
  const L = solarCoords.eclipticLongitude;
  return (
    Math.asin(
      Math.sin((23.44 * Math.PI) / 180) *
        Math.sin(((L - 80) * Math.PI) / 180),
    ) *
    (180 / Math.PI)
  );
}

/**
 * Calculate time for a given angle
 */
function calculateTime(
  latitude: number,
  longitude: number,
  timezone: string,
  angle: number,
  declination: number,
  equationOfTime: number,
  julianDay: number,
): Date {
  const latRad = (latitude * Math.PI) / 180;
  const decRad = (declination * Math.PI) / 180;
  const angleRad = (angle * Math.PI) / 180;

  const hourAngle =
    Math.acos(
      (Math.sin(angleRad) - Math.sin(latRad) * Math.sin(decRad)) /
        (Math.cos(latRad) * Math.cos(decRad)),
    ) *
    (180 / Math.PI);

  const time = 12 + (hourAngle / 15) - longitude / 15 - equationOfTime / 60;

  // Convert to Date in the specified timezone
  const baseDate = new Date();
  const hours = Math.floor(time);
  const minutes = Math.floor((time % 1) * 60);
  const seconds = Math.floor((((time % 1) * 60) % 1) * 60);
  baseDate.setUTCHours(hours);
  baseDate.setUTCMinutes(minutes);
  baseDate.setUTCSeconds(seconds);

  return tz.utcToZonedTime(baseDate, timezone);
}

/**
 * Calculate midday (Dhuhr)
 */
function calculateMidday(
  longitude: number,
  timezone: string,
  equationOfTime: number,
  julianDay: number,
): Date {
  const time = 12 - longitude / 15 - equationOfTime / 60;

  const baseDate = new Date();
  const hours = Math.floor(time);
  const minutes = Math.floor((time % 1) * 60);
  const seconds = Math.floor((((time % 1) * 60) % 1) * 60);
  baseDate.setUTCHours(hours);
  baseDate.setUTCMinutes(minutes);
  baseDate.setUTCSeconds(seconds);

  return tz.utcToZonedTime(baseDate, timezone);
}

/**
 * Calculate Asr time
 */
function calculateAsr(
  latitude: number,
  longitude: number,
  timezone: string,
  declination: number,
  equationOfTime: number,
  julianDay: number,
  method: AsrMethod,
): Date {
  const latRad = (latitude * Math.PI) / 180;
  const decRad = (declination * Math.PI) / 180;

  // Shadow factor: 1 for Shafi, 2 for Hanafi
  const shadowFactor = method === 'Hanafi' ? 2 : 1;

  // Calculate the acos argument
  const acosArg = -Math.tan(latRad) * Math.tan(decRad) +
    (1 / shadowFactor) / (Math.cos(latRad) * Math.cos(decRad));

  // Clamp acos argument to valid range [-1, 1] to prevent NaN
  const clampedArg = Math.max(-1, Math.min(1, acosArg));
  
  const hourAngle = Math.acos(clampedArg) * (180 / Math.PI);

  // Validate hourAngle is a valid number
  if (isNaN(hourAngle) || !isFinite(hourAngle)) {
    // Fallback: Asr is typically around 3-4 hours after Dhuhr
    // Use a simple approximation: Dhuhr + 3.5 hours
    const dhuhr = calculateMidday(longitude, timezone, equationOfTime, julianDay);
    const asrTime = new Date(dhuhr.getTime() + 3.5 * 60 * 60 * 1000);
    return tz.utcToZonedTime(asrTime, timezone);
  }

  const time = 12 + (hourAngle / 15) - longitude / 15 - equationOfTime / 60;

  // Validate time is reasonable (between 12 and 18 hours)
  if (isNaN(time) || !isFinite(time) || time < 12 || time > 18) {
    // Fallback: Asr is typically around 3-4 hours after Dhuhr
    const dhuhr = calculateMidday(longitude, timezone, equationOfTime, julianDay);
    const asrTime = new Date(dhuhr.getTime() + 3.5 * 60 * 60 * 1000);
    return tz.utcToZonedTime(asrTime, timezone);
  }

  const baseDate = new Date();
  const hours = Math.floor(time);
  const minutes = Math.floor((time % 1) * 60);
  const seconds = Math.floor((((time % 1) * 60) % 1) * 60);
  baseDate.setUTCHours(hours);
  baseDate.setUTCMinutes(minutes);
  baseDate.setUTCSeconds(seconds);

  const asrDate = tz.utcToZonedTime(baseDate, timezone);
  
  // Final validation: ensure the date is valid
  if (isNaN(asrDate.getTime())) {
    // Last resort fallback
    const dhuhr = calculateMidday(longitude, timezone, equationOfTime, julianDay);
    return new Date(dhuhr.getTime() + 3.5 * 60 * 60 * 1000);
  }

  return asrDate;
}

/**
 * Get next prayer time
 */
export function getNextPrayer(
  prayerTimes: PrayerTimes,
  currentTime: Date = new Date(),
): {prayer: PrayerName; time: Date} | null {
  const prayers: Array<{prayer: PrayerName; time: Date}> = [
    {prayer: 'fajr', time: prayerTimes.fajr},
    {prayer: 'dhuhr', time: prayerTimes.dhuhr},
    {prayer: 'asr', time: prayerTimes.asr},
    {prayer: 'maghrib', time: prayerTimes.maghrib},
    {prayer: 'isha', time: prayerTimes.isha},
  ];

  // Sort by time
  prayers.sort((a, b) => a.time.getTime() - b.time.getTime());

  // Find next prayer
  for (const prayer of prayers) {
    if (prayer.time > currentTime) {
      return prayer;
    }
  }

  // If all prayers have passed, next is tomorrow's Fajr
  const tomorrowFajr = new Date(prayerTimes.fajr);
  tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
  return {prayer: 'fajr', time: tomorrowFajr};
}

/**
 * Format prayer time for display
 */
export function formatPrayerTime(time: Date, formatStr: string = 'h:mm a'): string {
  // Validate date before formatting
  if (!time || !(time instanceof Date) || isNaN(time.getTime())) {
    console.warn('⚠️ Invalid date passed to formatPrayerTime:', time);
    return '--:--';
  }
  try {
    return format(time, formatStr);
  } catch (error) {
    console.error('❌ Error formatting prayer time:', error, time);
    return '--:--';
  }
}

