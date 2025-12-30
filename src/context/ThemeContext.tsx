/**
 * Theme Context Provider
 *
 * Provides theme state and toggle functionality throughout the app.
 */

import React, {createContext, useContext, useState, useCallback, useEffect} from 'react';
import {useColorScheme, useAccessibilityInfo} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {theme, colors} from '@constants/theme';

type ThemeMode = 'light' | 'dark' | 'auto';
type AccessibilityMode = 'normal' | 'highContrast' | 'largeText';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  currentTheme: typeof theme.light;
  colors: typeof colors;
  accessibilityMode: AccessibilityMode;
  fontScale: number;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setAccessibilityMode: (mode: AccessibilityMode) => void;
  setFontScale: (scale: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const {reduceMotionEnabled, screenReaderEnabled} = useAccessibilityInfo();
  const [mode, setMode] = useState<ThemeMode>('auto');
  const [accessibilityMode, setAccessibilityModeState] =
    useState<AccessibilityMode>('normal');
  const [fontScale, setFontScaleState] = useState<number>(1.0);

  // Load saved preferences
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('@theme:accessibilityMode');
      const savedFontScale = await AsyncStorage.getItem('@theme:fontScale');
      if (savedMode) {
        setAccessibilityModeState(savedMode as AccessibilityMode);
      }
      if (savedFontScale) {
        setFontScaleState(parseFloat(savedFontScale));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const isDark =
    mode === 'dark' || (mode === 'auto' && systemColorScheme === 'dark');

  // Apply high contrast colors if enabled
  const getThemeColors = () => {
    if (accessibilityMode === 'highContrast') {
      return {
        ...colors,
        primary: {
          ...colors.primary,
          main: isDark ? '#FFFFFF' : '#000000',
        },
        text: {
          ...colors.text,
          primary: isDark ? '#FFFFFF' : '#000000',
          secondary: isDark ? '#CCCCCC' : '#333333',
        },
      };
    }
    return colors;
  };

  const currentTheme = isDark ? theme.dark : theme.light;
  const themeColors = getThemeColors();

  const handleSetMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
  }, []);

  const toggleTheme = useCallback(() => {
    setMode(prev => {
      if (prev === 'auto') return 'light';
      if (prev === 'light') return 'dark';
      return 'auto';
    });
  }, []);

  const setAccessibilityMode = useCallback(async (newMode: AccessibilityMode) => {
    setAccessibilityModeState(newMode);
    try {
      await AsyncStorage.setItem('@theme:accessibilityMode', newMode);
    } catch (error) {
      console.error('Error saving accessibility mode:', error);
    }
  }, []);

  const setFontScale = useCallback(async (scale: number) => {
    const clampedScale = Math.max(0.8, Math.min(2.0, scale)); // Clamp between 0.8 and 2.0
    setFontScaleState(clampedScale);
    try {
      await AsyncStorage.setItem('@theme:fontScale', clampedScale.toString());
    } catch (error) {
      console.error('Error saving font scale:', error);
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        isDark,
        currentTheme,
        colors: themeColors,
        accessibilityMode,
        fontScale,
        setMode: handleSetMode,
        toggleTheme,
        setAccessibilityMode,
        setFontScale,
      }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

