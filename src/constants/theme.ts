/**
 * Material Neubrutomorphism Theme Configuration
 *
 * This file contains the theme configuration combining:
 * - Material UI's professional polish
 * - Neubrutomorphism's bold authenticity
 * - Neumorphic depth and tactile feedback
 *
 * Design DNA: 40% Neubrutalism + 30% Neumorphism + 30% Material Design
 */

import {MD3LightTheme, MD3DarkTheme} from 'react-native-paper';

// Color System - Material Neubrutomorphism
export const colors = {
  primary: {
    main: '#3DD9C5', // Turquoise - Primary brand color
    dark: '#2AB9A9',
    light: '#6FE8D9',
    contrastText: '#0F1419',
  },
  secondary: {
    main: '#A78BFA', // Purple
    light: '#C4B5FD',
    dark: '#8B5CF6',
  },
  success: {
    main: '#388E3C',
    light: '#66BB6A',
    dark: '#2E7D32',
  },
  warning: {
    main: '#FFB84D', // Gold
    light: '#FFD699',
    dark: '#E5A63D',
  },
  error: {
    main: '#FF6B9D', // Rose
    light: '#FF8FB3',
    dark: '#E55A8A',
  },
  accent: {
    gold: '#FFB84D', // Dhuhr, Sunrise
    rose: '#FF6B9D', // Asr
    purple: '#A78BFA', // Fajr
    blue: '#60A5FA', // Info
    turquoise: '#3DD9C5', // Primary
  },
  surface: {
    primary: '#0F1419', // Main background
    secondary: '#1A2332', // Cards
    tertiary: '#242F42', // Elevated
    elevated: '#2A3647', // Floating
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#A8B2C1',
    muted: '#6B7280',
    disabled: '#4B5563',
  },
  background: {
    default: '#0F1419',
    paper: '#1A2332',
    dark: '#0A0E13',
  },
  border: {
    primary: '#3DD9C5',
    dark: '#0A0E13',
    width: 3,
    widthThick: 4,
  },
};

// Material 3 Dark Theme (Primary theme for Neubrutomorphism)
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary.main,
    secondary: colors.secondary.main,
    error: colors.error.main,
    surface: colors.surface.secondary,
    background: colors.background.default,
    text: colors.text.primary,
    onSurface: colors.text.primary,
    onBackground: colors.text.primary,
  },
};

// Material 3 Light Theme (for compatibility)
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary.main,
    secondary: colors.secondary.main,
    error: colors.error.main,
    surface: colors.surface.secondary,
    background: colors.background.default,
    text: colors.text.primary,
  },
};

// Spacing System (Fibonacci-Based Scale)
export const spacing = {
  xs: 8, // 0.5rem
  sm: 16, // 1rem
  md: 24, // 1.5rem
  lg: 32, // 2rem
  xl: 48, // 3rem
  brutalist: {
    small: 12,
    medium: 20,
    large: 40,
  },
};

// Typography - Material Neubrutomorphism
export const typography = {
  // Display Font: Poppins
  h1: {
    fontSize: 48,
    fontWeight: '800' as const,
    lineHeight: 57.6,
    fontFamily: 'Poppins',
  },
  h2: {
    fontSize: 36,
    fontWeight: '700' as const,
    lineHeight: 43.2,
    fontFamily: 'Poppins',
  },
  h3: {
    fontSize: 30,
    fontWeight: '700' as const,
    lineHeight: 36,
    fontFamily: 'Poppins',
  },
  h4: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 30,
    fontFamily: 'Poppins',
  },
  h5: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 26,
    fontFamily: 'Poppins',
  },
  h6: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    fontFamily: 'Poppins',
  },
  // Body Font: Inter
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    fontFamily: 'Inter',
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    fontFamily: 'Inter',
  },
  button: {
    fontSize: 16,
    fontWeight: '700' as const,
    lineHeight: 24,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
    fontFamily: 'Poppins',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 18,
    fontFamily: 'Inter',
  },
};

// Border Radius Scale
export const borderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

// Triple-Layer Shadow System - Material Neubrutomorphism
// Layer 1: Neumorphic Inner (Depth)
// Layer 2: Outer Glow (Atmosphere)
// Layer 3: Brutal Offset (Punch)

// Neumorphic Inner Shadows
export const neumorphicInner = {
  pressed: {
    shadowColor: '#000',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#FFF',
    shadowOffset: {width: -2, height: -2},
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
};

// Outer Glow Shadows
export const outerGlow = {
  small: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 4,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 6,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 8,
  },
  primary: {
    shadowColor: '#3DD9C5',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
};

// Brutalist Offset Shadows
export const brutalistShadows = {
  small: {
    shadowColor: '#3DD9C5',
    shadowOffset: {width: 3, height: 3},
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  medium: {
    shadowColor: '#3DD9C5',
    shadowOffset: {width: 6, height: 6},
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  large: {
    shadowColor: '#3DD9C5',
    shadowOffset: {width: 10, height: 10},
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
  },
};

// Combined Neubrutal Shadows (for use in components)
export const neubrutalShadows = {
  small: {
    // Note: React Native doesn't support multiple shadows natively
    // We'll use the brutal offset as primary with elevation
    ...brutalistShadows.small,
  },
  medium: {
    ...brutalistShadows.medium,
  },
  large: {
    ...brutalistShadows.large,
  },
};

// Material Elevation (for compatibility)
export const elevation = {
  0: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  1: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 1,
  },
  2: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 2,
  },
  4: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.19,
    shadowRadius: 20,
    elevation: 4,
  },
  8: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 15},
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 8,
  },
};

// Export theme object
export const theme = {
  light: lightTheme,
  dark: darkTheme,
  colors,
  spacing,
  typography,
  elevation,
  brutalistShadows,
  neubrutalShadows,
  neumorphicInner,
  outerGlow,
  borderRadius,
};

