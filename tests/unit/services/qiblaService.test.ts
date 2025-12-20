/**
 * Qibla Service Tests
 */

import {
  calculateQiblaBearing,
  calculateQiblaFromLocation,
  calculateDistanceToKaaba,
  getCompassDirection,
} from '@services/qibla/qiblaService';
import {Location} from '@services/location/locationService';

describe('Qibla Service', () => {
  describe('calculateQiblaBearing', () => {
    it('calculates correct bearing from New York', () => {
      // New York coordinates
      const latitude = 40.7128;
      const longitude = -74.006;
      const bearing = calculateQiblaBearing(latitude, longitude);

      // Bearing should be approximately 58-60 degrees (Northeast)
      expect(bearing).toBeGreaterThan(55);
      expect(bearing).toBeLessThan(65);
    });

    it('calculates correct bearing from London', () => {
      // London coordinates
      const latitude = 51.5074;
      const longitude = -0.1278;
      const bearing = calculateQiblaBearing(latitude, longitude);

      // Bearing should be approximately 120-125 degrees (Southeast)
      expect(bearing).toBeGreaterThan(115);
      expect(bearing).toBeLessThan(130);
    });

    it('calculates correct bearing from Mecca (should be 0 or 360)', () => {
      // Mecca coordinates (very close to Kaaba)
      const latitude = 21.4225;
      const longitude = 39.8262;
      const bearing = calculateQiblaBearing(latitude, longitude);

      // Bearing should be very close to 0 or 360
      expect(bearing).toBeLessThan(5);
    });

    it('returns bearing in 0-360 range', () => {
      const latitude = 0;
      const longitude = 0;
      const bearing = calculateQiblaBearing(latitude, longitude);

      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThan(360);
    });
  });

  describe('calculateQiblaFromLocation', () => {
    it('calculates bearing from Location object', () => {
      const location: Location = {
        latitude: 40.7128,
        longitude: -74.006,
      };

      const bearing = calculateQiblaFromLocation(location);
      expect(bearing).toBeGreaterThan(0);
      expect(bearing).toBeLessThan(360);
    });
  });

  describe('calculateDistanceToKaaba', () => {
    it('calculates distance correctly', () => {
      // New York to Mecca should be approximately 10,000 km
      const latitude = 40.7128;
      const longitude = -74.006;
      const distance = calculateDistanceToKaaba(latitude, longitude);

      expect(distance).toBeGreaterThan(9000);
      expect(distance).toBeLessThan(11000);
    });

    it('returns 0 for Mecca location', () => {
      const latitude = 21.4225;
      const longitude = 39.8262;
      const distance = calculateDistanceToKaaba(latitude, longitude);

      expect(distance).toBeLessThan(100); // Very close to 0
    });
  });

  describe('getCompassDirection', () => {
    it('returns correct direction for North', () => {
      expect(getCompassDirection(0)).toBe('N');
      expect(getCompassDirection(360)).toBe('N');
    });

    it('returns correct direction for East', () => {
      expect(getCompassDirection(90)).toBe('E');
    });

    it('returns correct direction for South', () => {
      expect(getCompassDirection(180)).toBe('S');
    });

    it('returns correct direction for West', () => {
      expect(getCompassDirection(270)).toBe('W');
    });

    it('returns correct direction for Northeast', () => {
      expect(getCompassDirection(45)).toBe('NE');
    });

    it('handles all 16 directions', () => {
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

      directions.forEach((direction, index) => {
        const bearing = index * 22.5;
        expect(getCompassDirection(bearing)).toBe(direction);
      });
    });
  });
});

