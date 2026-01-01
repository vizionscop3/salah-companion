/**
 * Font Scaling Utilities
 *
 * Utilities for applying font scaling across the app.
 */

import {useTheme} from '@context/ThemeContext';

/**
 * Get scaled font size based on user preference
 */
export function getScaledFontSize(baseSize: number, fontScale: number): number {
  return Math.round(baseSize * fontScale);
}

/**
 * Hook to get scaled typography styles
 */
export function useScaledTypography() {
  const {fontScale} = useTheme();

  return {
    h1: (baseSize: number) => getScaledFontSize(baseSize, fontScale),
    h2: (baseSize: number) => getScaledFontSize(baseSize, fontScale),
    h3: (baseSize: number) => getScaledFontSize(baseSize, fontScale),
    h4: (baseSize: number) => getScaledFontSize(baseSize, fontScale),
    h5: (baseSize: number) => getScaledFontSize(baseSize, fontScale),
    h6: (baseSize: number) => getScaledFontSize(baseSize, fontScale),
    body1: (baseSize: number) => getScaledFontSize(baseSize, fontScale),
    body2: (baseSize: number) => getScaledFontSize(baseSize, fontScale),
    caption: (baseSize: number) => getScaledFontSize(baseSize, fontScale),
  };
}

/**
 * Create scaled typography style
 */
export function createScaledTypographyStyle(
  baseStyle: {fontSize: number; lineHeight?: number},
  fontScale: number,
) {
  return {
    ...baseStyle,
    fontSize: getScaledFontSize(baseStyle.fontSize, fontScale),
    lineHeight: baseStyle.lineHeight
      ? getScaledFontSize(baseStyle.lineHeight, fontScale)
      : undefined,
  };
}

