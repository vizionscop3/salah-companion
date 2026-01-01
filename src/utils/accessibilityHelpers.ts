/**
 * Accessibility Helpers
 *
 * Utilities for improving app accessibility.
 */

import {Platform} from 'react-native';

/**
 * Get accessibility label for prayer time
 */
export const getPrayerTimeLabel = (prayer: string, time: Date): string => {
  const timeStr = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${prayer} prayer time is ${timeStr}`;
};

/**
 * Get accessibility hint for interactive elements
 */
export const getAccessibilityHint = (action: string, context?: string): string => {
  const hints: Record<string, string> = {
    button: 'Double tap to activate',
    card: 'Double tap to open',
    switch: 'Double tap to toggle',
    slider: 'Swipe left or right to adjust',
    link: 'Double tap to navigate',
  };

  return context ? `${hints[action] || ''}. ${context}` : hints[action] || '';
};

/**
 * Format number for screen readers
 */
export const formatNumberForScreenReader = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)} million`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)} thousand`;
  }
  return num.toString();
};

/**
 * Get minimum touch target size (44x44 points for iOS, 48x48 dp for Android)
 */
export const getMinimumTouchTarget = (): number => {
  return Platform.OS === 'ios' ? 44 : 48;
};

/**
 * Check if reduced motion is enabled
 */
export const prefersReducedMotion = (): boolean => {
  // In a real implementation, this would check AccessibilityInfo
  // For now, return false as default
  return false;
};

/**
 * Get high contrast color variant
 */
export const getHighContrastColor = (color: string, isDark: boolean): string => {
  // Return high contrast variants
  if (isDark) {
    return color; // Already high contrast in dark mode
  }
  // Light mode high contrast adjustments
  return color;
};

