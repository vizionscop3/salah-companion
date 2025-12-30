/**
 * Theme Context Provider
 *
 * Provides theme state and toggle functionality throughout the app.
 */

import React, {createContext, useContext, useState, useCallback} from 'react';
import {useColorScheme} from 'react-native';
import {theme, colors} from '@constants/theme';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  currentTheme: typeof theme.light;
  colors: typeof colors; // Add direct access to colors
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('auto');

  const isDark =
    mode === 'dark' || (mode === 'auto' && systemColorScheme === 'dark');

  const currentTheme = isDark ? theme.dark : theme.light;

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

  return (
    <ThemeContext.Provider
      value={{
        mode,
        isDark,
        currentTheme,
        colors, // Add colors to context
        setMode: handleSetMode,
        toggleTheme,
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

