/**
 * Accessibility Enhancements
 *
 * Utilities for enhanced accessibility features.
 */

import {Platform} from 'react-native';

/**
 * Get minimum touch target size based on platform
 */
export function getMinimumTouchTarget(): number {
  return Platform.OS === 'ios' ? 44 : 48;
}

/**
 * Ensure element meets minimum touch target size
 */
export function ensureMinimumTouchTarget(
  width: number,
  height: number,
): {width: number; height: number} {
  const minSize = getMinimumTouchTarget();
  return {
    width: Math.max(width, minSize),
    height: Math.max(height, minSize),
  };
}

/**
 * Generate accessibility label for prayer time
 */
export function getPrayerTimeAccessibilityLabel(
  prayerName: string,
  time: Date,
  isNext?: boolean,
): string {
  const timeStr = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const nextText = isNext ? 'Next prayer. ' : '';
  return `${nextText}${prayerName} prayer at ${timeStr}`;
}

/**
 * Generate accessibility hint for interactive elements
 */
export function getAccessibilityHint(
  elementType: 'button' | 'card' | 'link' | 'switch' | 'slider',
  context?: string,
): string {
  const hints: Record<string, string> = {
    button: 'Double tap to activate',
    card: 'Double tap to open',
    link: 'Double tap to navigate',
    switch: 'Double tap to toggle',
    slider: 'Swipe left or right to adjust',
  };

  const baseHint = hints[elementType] || '';
  return context ? `${baseHint}. ${context}` : baseHint;
}

/**
 * Format number for screen readers
 */
export function formatNumberForScreenReader(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)} million`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)} thousand`;
  }
  return num.toString();
}

/**
 * Generate accessibility label for progress
 */
export function getProgressAccessibilityLabel(
  current: number,
  total: number,
  label: string,
): string {
  const percentage = Math.round((current / total) * 100);
  return `${label}: ${current} of ${total}, ${percentage} percent complete`;
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  // In production, check AccessibilityInfo.isReduceMotionEnabled()
  // For now, return false as default
  return false;
}

/**
 * Get animation duration based on reduced motion preference
 */
export function getAnimationDuration(baseDuration: number): number {
  return prefersReducedMotion() ? 0 : baseDuration;
}

/**
 * Generate accessibility label for achievement
 */
export function getAchievementAccessibilityLabel(
  title: string,
  description: string,
  isUnlocked: boolean,
): string {
  const status = isUnlocked ? 'Unlocked' : 'Locked';
  return `${title}. ${description}. Status: ${status}`;
}

