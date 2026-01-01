/**
 * Qibla Service
 *
 * Calculates Qibla direction (bearing to Kaaba in Mecca)
 * from user's current location.
 */

import {Location} from '@services/location/locationService';

// Kaaba coordinates in Mecca
const KAABA_LATITUDE = 21.4225;
const KAABA_LONGITUDE = 39.8262;

/**
 * Calculate Qibla bearing (direction) from user's location to Kaaba
 * @param latitude User's latitude
 * @param longitude User's longitude
 * @returns Bearing in degrees (0-360, where 0 is North, 90 is East, etc.)
 */
export function calculateQiblaBearing(
  latitude: number,
  longitude: number,
): number {
  const lat1 = (latitude * Math.PI) / 180;
  const lat2 = (KAABA_LATITUDE * Math.PI) / 180;
  const deltaLon = ((KAABA_LONGITUDE - longitude) * Math.PI) / 180;

  const y = Math.sin(deltaLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);

  let bearing = Math.atan2(y, x);
  bearing = (bearing * 180) / Math.PI;
  bearing = (bearing + 360) % 360; // Normalize to 0-360

  return bearing;
}

/**
 * Calculate Qibla bearing from Location object
 */
export function calculateQiblaFromLocation(location: Location): number {
  return calculateQiblaBearing(location.latitude, location.longitude);
}

/**
 * Get compass direction name from bearing
 */
export function getCompassDirection(bearing: number): string {
  const directions = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ];
  const index = Math.round(bearing / 22.5) % 16;
  return directions[index];
}

/**
 * Calculate distance to Kaaba in kilometers
 */
export function calculateDistanceToKaaba(
  latitude: number,
  longitude: number,
): number {
  const R = 6371; // Earth's radius in kilometers
  const lat1 = (latitude * Math.PI) / 180;
  const lat2 = (KAABA_LATITUDE * Math.PI) / 180;
  const deltaLat = ((KAABA_LATITUDE - latitude) * Math.PI) / 180;
  const deltaLon = ((KAABA_LONGITUDE - longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

