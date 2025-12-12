/**
 * Material Neubrutomorphism Theme Configuration
 *
 * This file contains the theme configuration combining:
 * - Material UI's professional polish
 * - Neubrutomorphism's bold authenticity
 * - Neumorphic depth and tactile feedback
 */

import {MD3LightTheme, MD3DarkTheme} from 'react-native-paper';

// Color System
export const colors = {
  primary: {
    main: '#1976D2', // Material Blue
    light: '#42A5F5',
    dark: '#1565C0',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#9C27B0', // Material Purple
    light: '#BA68C8',
    dark: '#7B1FA2',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#388E3C',
    light: '#66BB6A',
    dark: '#2E7D32',
  },
  warning: {
    main: '#F57C00',
    light: '#FFB74D',
    dark: '#E65100',
  },
  error: {
    main: '#D32F2F',
    light: '#E57373',
    dark: '#C62828',
  },
  accent: {
    bold: '#FF6B6B',
    calm: '#4ECDC4',
    dark: '#2C3E50',
  },
  surface: {
    light: '#F5F5F5',
    main: '#FFFFFF',
    dark: '#E0E0E0',
    elevated: '#FAFAFA',
  },
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
    hint: '#9E9E9E',
  },
  background: {
    default: '#FFFFFF',
    paper: '#FAFAFA',
    dark: '#121212',
  },
};

// Material 3 Light Theme
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary.main,
    secondary: colors.secondary.main,
    error: colors.error.main,
    surface: colors.surface.main,
    background: colors.background.default,
    text: colors.text.primary,
  },
};

// Material 3 Dark Theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary.light,
    secondary: colors.secondary.light,
    error: colors.error.light,
    surface: colors.surface.dark,
    background: colors.background.dark,
    text: '#FFFFFF',
  },
};

// Spacing System (Material 8dp Grid)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  brutalist: {
    small: 12,
    medium: 20,
    large: 40,
  },
};

// Typography
export const typography = {
  h1: {
    fontSize: 72,
    fontWeight: '900' as const,
    lineHeight: 86.4,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 48,
    fontWeight: '700' as const,
    lineHeight: 62.4,
    letterSpacing: -0.25,
  },
  h3: {
    fontSize: 36,
    fontWeight: '600' as const,
    lineHeight: 50.4,
  },
  h4: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 39.2,
  },
  h5: {
    fontSize: 24,
    fontWeight: '500' as const,
    lineHeight: 36,
  },
  h6: {
    fontSize: 20,
    fontWeight: '500' as const,
    lineHeight: 30,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 25.6,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 22.4,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
};

// Elevation & Shadows
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

// Brutalist Shadows
export const brutalistShadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {width: 4, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 0,
    elevation: 4,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {width: 6, height: 6},
    shadowOpacity: 0.25,
    shadowRadius: 0,
    elevation: 6,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {width: 8, height: 8},
    shadowOpacity: 0.25,
    shadowRadius: 0,
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
};

