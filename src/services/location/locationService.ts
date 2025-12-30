/**
 * Location Service
 * 
 * Handles device location detection and permission management.
 */

import Geolocation from '@react-native-community/geolocation';
import {Platform, PermissionsAndroid} from 'react-native';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}

export interface LocationError {
  code: number;
  message: string;
}

/**
 * Request location permissions
 */
export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Salah Companion needs access to your location to calculate accurate prayer times.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('Error requesting location permission:', err);
      return false;
    }
  }
  // iOS permissions are handled via Info.plist
  return true;
}

/**
 * Get current location
 */
export function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    // Use faster, less accurate location first for better UX
    // If high accuracy is needed, it can be requested separately
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy ?? undefined,
          altitude: position.coords.altitude ?? undefined,
          heading: position.coords.heading ?? undefined,
          speed: position.coords.speed ?? undefined,
        });
      },
      (error) => {
        reject({
          code: error.code,
          message: error.message,
        } as LocationError);
      },
      {
        enableHighAccuracy: false, // Changed to false for faster response
        timeout: 3000, // Maximum 3 seconds timeout
        maximumAge: 60000, // Accept cached location up to 1 minute old
      },
    );
  });
}

/**
 * Watch location changes
 */
export function watchLocation(
  onLocationUpdate: (location: Location) => void,
  onError?: (error: LocationError) => void,
): number {
  return Geolocation.watchPosition(
    (position) => {
      onLocationUpdate({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy ?? undefined,
        altitude: position.coords.altitude ?? undefined,
        heading: position.coords.heading ?? undefined,
        speed: position.coords.speed ?? undefined,
      });
    },
    (error) => {
      if (onError) {
        onError({
          code: error.code,
          message: error.message,
        } as LocationError);
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
      distanceFilter: 100, // Update every 100 meters
    },
  );
}

/**
 * Stop watching location
 */
export function clearLocationWatch(watchId: number) {
  Geolocation.clearWatch(watchId);
}

/**
 * Get timezone from coordinates (simplified - uses device timezone)
 */
export function getTimezoneFromLocation(
  latitude: number,
  longitude: number,
): string {
  // For now, use device timezone
  // In production, you might want to use a timezone lookup service
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Reverse geocode location to get city/country
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<{city?: string; country?: string}> {
  // This is a placeholder - in production, use a geocoding service
  // like Google Maps Geocoding API or OpenStreetMap Nominatim
  try {
    // Example using a free service (you'll need to implement this)
    // const response = await fetch(
    //   `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    // );
    // const data = await response.json();
    // return {
    //   city: data.address?.city || data.address?.town,
    //   country: data.address?.country,
    // };
    return {
      city: undefined,
      country: undefined,
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      city: undefined,
      country: undefined,
    };
  }
}

