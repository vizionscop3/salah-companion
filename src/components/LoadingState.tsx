/**
 * Loading State Component
 *
 * Beautiful loading states inspired by Islamic app design patterns
 * with smooth animations and contextual messaging.
 */

import React from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {Card} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography} from '@constants/theme';
import {islamicColors, islamicSpacing} from '@constants/islamicTheme';

export interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'small' | 'large';
  color?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  fullScreen = false,
  size = 'large',
  color,
}) => {
  const {currentTheme} = useTheme();
  const indicatorColor = color || currentTheme.colors.primary;

  if (fullScreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <View style={styles.fullScreenContent}>
          <ActivityIndicator size={size} color={indicatorColor} />
          {message && (
            <Text style={[styles.message, {color: currentTheme.colors.text}]}>
              {message}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.container}>
          <ActivityIndicator size={size} color={indicatorColor} />
          {message && (
            <Text style={[styles.message, {color: currentTheme.colors.text}]}>
              {message}
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  fullScreenContent: {
    alignItems: 'center',
  },
  card: {
    margin: spacing.md,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: spacing.lg,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    ...typography.body1,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
