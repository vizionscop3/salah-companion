/**
 * Error State Component
 *
 * User-friendly error displays with retry functionality
 * and Islamic design aesthetics.
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Card, Button, Icon} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography} from '@constants/theme';
import {islamicColors, islamicShadows, islamicBorderRadius} from '@constants/islamicTheme';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
  icon = 'alert-circle',
}) => {
  const {currentTheme} = useTheme();

  return (
    <Card style={[styles.card, islamicShadows.medium]}>
      <Card.Content style={styles.content}>
        <View style={styles.container}>
          <View style={styles.icon}>
            <Icon
              source={icon}
              size={48}
              color={islamicColors.error}
            />
          </View>
          <Text style={[styles.title, {color: currentTheme.colors.text}]}>
            {title}
          </Text>
          <Text style={[styles.message, {color: currentTheme.colors.text}]}>
            {message}
          </Text>
          {onRetry && (
            <Button
              mode="contained"
              onPress={onRetry}
              style={[styles.retryButton, {borderRadius: islamicBorderRadius.medium}]}
              contentStyle={styles.retryButtonContent}>
              {retryLabel}
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: spacing.md,
    borderRadius: islamicBorderRadius.large,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: spacing.lg,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h5,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    ...typography.body1,
    marginBottom: spacing.lg,
    textAlign: 'center',
    opacity: 0.7,
  },
  retryButton: {
    marginTop: spacing.sm,
  },
  retryButtonContent: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
});
