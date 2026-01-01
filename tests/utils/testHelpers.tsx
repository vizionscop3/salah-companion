/**
 * Test Helpers
 *
 * Utility functions and components for testing
 */

import React from 'react';
import {ThemeProvider} from '@context/ThemeContext';
import {PaperProvider} from 'react-native-paper';
import {theme} from '@constants/theme';

/**
 * Test wrapper component with all providers
 */
export const TestWrapper: React.FC<{children: React.ReactNode}> = ({children}) => {
  return (
    <PaperProvider theme={theme.light}>
      <ThemeProvider>{children}</ThemeProvider>
    </PaperProvider>
  );
};

/**
 * Mock date helper
 */
export function mockDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Create mock prayer times
 */
export function createMockPrayerTimes(date: Date = new Date()) {
  return {
    fajr: new Date(date.setHours(6, 0, 0, 0)),
    sunrise: new Date(date.setHours(7, 0, 0, 0)),
    dhuhr: new Date(date.setHours(12, 30, 0, 0)),
    asr: new Date(date.setHours(15, 30, 0, 0)),
    maghrib: new Date(date.setHours(18, 0, 0, 0)),
    isha: new Date(date.setHours(19, 30, 0, 0)),
  };
}

/**
 * Wait for async operations
 */
export async function waitForAsync(ms: number = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

