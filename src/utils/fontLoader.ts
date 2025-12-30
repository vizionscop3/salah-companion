/**
 * Font Loader Utility
 *
 * Handles loading custom fonts (Poppins and Inter) for the app.
 * Falls back to system fonts if custom fonts are not available.
 */

import {Platform} from 'react-native';

export interface FontConfig {
  family: string;
  weights: string[];
  styles: string[];
}

/**
 * Font configurations for Poppins and Inter
 */
export const FONT_CONFIGS: Record<string, FontConfig> = {
  Poppins: {
    family: 'Poppins',
    weights: ['400', '500', '600', '700', '800'],
    styles: ['normal'],
  },
  Inter: {
    family: 'Inter',
    weights: ['400', '500', '600'],
    styles: ['normal'],
  },
};

/**
 * Check if a font is available
 * Note: This is a simplified check. In production, you might want to
 * use a library like react-native-font-loader or check font availability
 * more thoroughly.
 */
export const isFontAvailable = (fontFamily: string): boolean => {
  // For now, we'll assume fonts are available if they're in the config
  // In production, you might want to actually test font rendering
  return Object.keys(FONT_CONFIGS).includes(fontFamily);
};

/**
 * Get font family with fallback
 */
export const getFontFamily = (fontFamily: string, fallback: string = 'System'): string => {
  if (isFontAvailable(fontFamily)) {
    return fontFamily;
  }
  
  // Fallback to system fonts
  if (Platform.OS === 'ios') {
    return fallback === 'Poppins' ? 'System' : 'System';
  } else {
    return fallback === 'Poppins' ? 'sans-serif-medium' : 'sans-serif';
  }
};

/**
 * Font file names mapping
 * These should match the actual font files in assets/fonts/
 */
export const FONT_FILES = {
  Poppins: {
    '400': 'Poppins-Regular.ttf',
    '500': 'Poppins-Medium.ttf',
    '600': 'Poppins-SemiBold.ttf',
    '700': 'Poppins-Bold.ttf',
    '800': 'Poppins-ExtraBold.ttf',
  },
  Inter: {
    '400': 'Inter-Regular.ttf',
    '500': 'Inter-Medium.ttf',
    '600': 'Inter-SemiBold.ttf',
  },
};

/**
 * Font loading status
 */
export type FontLoadingStatus = 'loading' | 'loaded' | 'error';

let fontLoadingStatus: FontLoadingStatus = 'loading';

export const setFontLoadingStatus = (status: FontLoadingStatus) => {
  fontLoadingStatus = status;
};

export const getFontLoadingStatus = (): FontLoadingStatus => {
  return fontLoadingStatus;
};

