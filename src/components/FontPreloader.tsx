/**
 * Font Preloader Component
 *
 * Preloads custom fonts before rendering the app.
 * Shows a loading screen while fonts are being loaded.
 */

import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {colors, spacing, typography} from '@constants/theme';
import {setFontLoadingStatus, getFontLoadingStatus} from '@utils/fontLoader';

export interface FontPreloaderProps {
  children: React.ReactNode;
  onFontsLoaded?: () => void;
}

/**
 * Font Preloader - Loads fonts before rendering children
 * 
 * Note: In React Native, fonts are typically loaded automatically
 * if they're properly linked. This component provides a loading state
 * and can be extended to actually load fonts if needed.
 */
export const FontPreloader: React.FC<FontPreloaderProps> = ({
  children,
  onFontsLoaded,
}) => {
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    // Simulate font loading
    // In production, you might want to use a library like
    // react-native-font-loader or expo-font (if using Expo)
    const loadFonts = async () => {
      try {
        setFontLoadingStatus('loading');
        
        // For standard React Native, fonts are loaded automatically
        // if they're in the assets/fonts directory and linked properly
        // This is just a delay to ensure fonts are ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setFontLoadingStatus('loaded');
        setFontsReady(true);
        onFontsLoaded?.();
      } catch (error) {
        console.warn('Font loading error:', error);
        setFontLoadingStatus('error');
        // Still show app even if fonts fail
        setFontsReady(true);
        onFontsLoaded?.();
      }
    };

    loadFonts();
  }, [onFontsLoaded]);

  if (!fontsReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading fonts...</Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.default,
  },
  loadingText: {
    ...typography.body1,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
});

