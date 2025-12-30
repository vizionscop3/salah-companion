/**
 * Islamic Design Theme
 *
 * Enhanced theme inspired by Islamic app design patterns
 * with modern UI/UX principles and Arabic typography support.
 */

import {MD3LightTheme, MD3DarkTheme} from 'react-native-paper';

// Islamic-inspired color palette
export const islamicColors = {
  // Primary colors - inspired by Islamic art and architecture
  primary: '#1B5E20', // Deep green (symbolic of Islam)
  primaryLight: '#4CAF50', // Light green
  primaryDark: '#0D3E10', // Dark green
  
  // Accent colors
  accent: '#FF6F00', // Warm amber/orange
  accentLight: '#FFB74D',
  accentDark: '#E65100',
  
  // Secondary colors
  secondary: '#1565C0', // Deep blue (sky/water)
  secondaryLight: '#42A5F5',
  secondaryDark: '#0D47A1',
  
  // Gold accents (for special elements)
  gold: '#FFD700',
  goldLight: '#FFF9C4',
  goldDark: '#F9A825',
  
  // Neutral colors
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',
  error: '#C62828',
  warning: '#F57C00',
  success: '#2E7D32',
  info: '#0277BD',
  
  // Text colors
  text: '#212121',
  textSecondary: '#757575',
  textDisabled: '#BDBDBD',
  textOnPrimary: '#FFFFFF',
  
  // Border and divider
  border: '#E0E0E0',
  divider: '#BDBDBD',
  
  // Prayer time colors
  fajr: '#1A237E', // Deep indigo (dawn)
  dhuhr: '#FF6F00', // Amber (noon)
  asr: '#F57C00', // Orange (afternoon)
  maghrib: '#C62828', // Red (sunset)
  isha: '#1A237E', // Deep indigo (night)
};

// Enhanced typography with Arabic support
export const islamicTypography = {
  // Arabic fonts
  arabic: {
    regular: 'Amiri-Regular',
    bold: 'Amiri-Bold',
    quranic: 'Amiri-Quran', // For Quranic text
  },
  
  // English/Latin fonts
  english: {
    regular: 'Roboto-Regular',
    medium: 'Roboto-Medium',
    bold: 'Roboto-Bold',
  },
  
  // Sizes
  sizes: {
    h1: 32,
    h2: 24,
    h3: 20,
    h4: 18,
    h5: 16,
    body1: 16,
    body2: 14,
    caption: 12,
    overline: 10,
  },
  
  // Line heights
  lineHeights: {
    h1: 40,
    h2: 32,
    h3: 28,
    h4: 24,
    body1: 24,
    body2: 20,
    caption: 16,
  },
};

// Spacing system (8dp grid)
export const islamicSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const islamicBorderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  xlarge: 16,
  round: 999,
};

// Shadows (elevation)
export const islamicShadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.20,
    shadowRadius: 3.84,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 5.84,
    elevation: 5,
  },
  xlarge: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.30,
    shadowRadius: 10.32,
    elevation: 8,
  },
};

// Animation durations
export const islamicAnimations = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,
};

// Prayer time gradients
export const prayerGradients = {
  fajr: ['#1A237E', '#283593', '#3949AB'],
  dhuhr: ['#FF6F00', '#FF8F00', '#FFB300'],
  asr: ['#F57C00', '#FB8C00', '#FFA726'],
  maghrib: ['#C62828', '#D32F2F', '#E53935'],
  isha: ['#1A237E', '#283593', '#3949AB'],
};

// Light theme configuration
export const islamicLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: islamicColors.primary,
    primaryContainer: islamicColors.primaryLight,
    secondary: islamicColors.secondary,
    secondaryContainer: islamicColors.secondaryLight,
    tertiary: islamicColors.accent,
    error: islamicColors.error,
    errorContainer: '#FFEBEE',
    surface: islamicColors.surface,
    surfaceVariant: islamicColors.surfaceVariant,
    background: islamicColors.background,
    outline: islamicColors.border,
    outlineVariant: islamicColors.divider,
    shadow: '#000',
    scrim: '#000',
    inverseSurface: '#121212',
    inverseOnSurface: '#FFFFFF',
    inversePrimary: islamicColors.primaryLight,
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#FFFFFF',
      level3: '#FFFFFF',
      level4: '#FFFFFF',
      level5: '#FFFFFF',
    },
  },
};

// Dark theme configuration
export const islamicDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: islamicColors.primaryLight,
    primaryContainer: islamicColors.primaryDark,
    secondary: islamicColors.secondaryLight,
    secondaryContainer: islamicColors.secondaryDark,
    tertiary: islamicColors.accentLight,
    error: '#EF5350',
    errorContainer: '#B71C1C',
    surface: '#121212',
    surfaceVariant: '#1E1E1E',
    background: '#000000',
    outline: '#424242',
    outlineVariant: '#616161',
    shadow: '#000',
    scrim: '#000',
    inverseSurface: '#FFFFFF',
    inverseOnSurface: '#212121',
    inversePrimary: islamicColors.primary,
    elevation: {
      level0: 'transparent',
      level1: '#1E1E1E',
      level2: '#242424',
      level3: '#272727',
      level4: '#2C2C2C',
      level5: '#2D2D2D',
    },
  },
};

// Component-specific styles
export const componentStyles = {
  card: {
    borderRadius: islamicBorderRadius.large,
    ...islamicShadows.medium,
    backgroundColor: islamicColors.surface,
    padding: islamicSpacing.md,
  },
  button: {
    borderRadius: islamicBorderRadius.medium,
    paddingVertical: islamicSpacing.sm,
    paddingHorizontal: islamicSpacing.md,
  },
  input: {
    borderRadius: islamicBorderRadius.medium,
    backgroundColor: islamicColors.surfaceVariant,
  },
  prayerCard: {
    borderRadius: islamicBorderRadius.large,
    ...islamicShadows.small,
    padding: islamicSpacing.md,
  },
  qiblaCompass: {
    borderRadius: islamicBorderRadius.round,
    ...islamicShadows.large,
  },
};

export default {
  colors: islamicColors,
  typography: islamicTypography,
  spacing: islamicSpacing,
  borderRadius: islamicBorderRadius,
  shadows: islamicShadows,
  animations: islamicAnimations,
  prayerGradients,
  lightTheme: islamicLightTheme,
  darkTheme: islamicDarkTheme,
  componentStyles,
};
