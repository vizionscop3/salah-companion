/**
 * Magnetometer Service
 *
 * Handles device magnetometer/compass readings for accurate heading detection.
 */

import {Platform} from 'react-native';

export interface MagnetometerData {
  x: number;
  y: number;
  z: number;
  heading: number; // Calculated heading in degrees (0-360)
  accuracy: number; // Accuracy level (0-3, where 3 is best)
}

export interface MagnetometerSubscription {
  unsubscribe: () => void;
}

/**
 * Calculate heading from magnetometer data
 */
export function calculateHeading(x: number, y: number): number {
  let heading = Math.atan2(y, x) * (180 / Math.PI);
  heading = (heading + 360) % 360; // Normalize to 0-360
  return heading;
}

/**
 * Check if magnetometer is available on device
 */
export async function isMagnetometerAvailable(): Promise<boolean> {
  try {
    // In a real implementation, this would check device capabilities
    // For now, assume available on most modern devices
    return Platform.OS === 'ios' || Platform.OS === 'android';
  } catch {
    return false;
  }
}

/**
 * Request magnetometer permission (if needed)
 */
export async function requestMagnetometerPermission(): Promise<boolean> {
  // Most platforms don't require explicit permission for magnetometer
  // But we check availability
  return await isMagnetometerAvailable();
}

/**
 * Subscribe to magnetometer updates
 * Returns a subscription object with unsubscribe method
 */
export function subscribeToMagnetometer(
  callback: (data: MagnetometerData) => void,
): MagnetometerSubscription {
  // Mock implementation - in production, use react-native-sensors
  // This will be replaced with actual sensor integration
  let isActive = true;
  let lastHeading = 0;

  const mockUpdate = () => {
    if (!isActive) return;

    // Simulate magnetometer data
    const now = Date.now();
    const variation = Math.sin(now / 1000) * 5; // Small variation
    const heading = (lastHeading + variation + 360) % 360;

    callback({
      x: Math.cos((heading * Math.PI) / 180),
      y: Math.sin((heading * Math.PI) / 180),
      z: 0,
      heading,
      accuracy: 2, // Medium accuracy
    });

    lastHeading = heading;
    setTimeout(mockUpdate, 100); // Update every 100ms
  };

  mockUpdate();

  return {
    unsubscribe: () => {
      isActive = false;
    },
  };
}

/**
 * Calibrate magnetometer (for better accuracy)
 */
export async function calibrateMagnetometer(): Promise<boolean> {
  // In production, this would trigger device calibration
  // For now, return success
  return true;
}

