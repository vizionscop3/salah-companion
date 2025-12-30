/**
 * Neubrutal Button Component
 *
 * Bold button with Material Neubrutomorphism design:
 * - Primary turquoise background
 * - Bold border
 * - Hard offset shadow
 * - Press animation
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import {colors, spacing, typography, borderRadius, brutalistShadows} from '@constants/theme';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export interface NeubrutalButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const NeubrutalButton: React.FC<NeubrutalButtonProps> = React.memo(({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {scale: scale.value},
      {translateX: translateX.value},
      {translateY: translateY.value},
    ],
  }));

  const handlePressIn = () => {
    if (disabled || loading) return;
    scale.value = withSpring(0.98);
    translateX.value = withSpring(2);
    translateY.value = withSpring(2);
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
  };

  const getButtonStyle = () => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.md,
      borderWidth: 3,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      ...brutalistShadows.small,
    };

    if (variant === 'primary') {
      return {
        ...baseStyle,
        backgroundColor: colors.primary.main,
        borderColor: colors.background.default,
      };
    }
    if (variant === 'secondary') {
      return {
        ...baseStyle,
        backgroundColor: colors.surface.tertiary,
        borderColor: colors.primary.main,
      };
    }
    return {
      ...baseStyle,
      backgroundColor: 'transparent',
      borderColor: colors.primary.main,
    };
  };

  const getTextColor = () => {
    if (variant === 'outline') return colors.primary.main;
    if (variant === 'secondary') return colors.text.primary;
    return colors.background.default;
  };

  const getPadding = () => {
    if (size === 'small') return {paddingVertical: spacing.xs, paddingHorizontal: spacing.md};
    if (size === 'large') return {paddingVertical: spacing.md, paddingHorizontal: spacing.xl};
    return {paddingVertical: spacing.sm, paddingHorizontal: spacing.lg};
  };

  return (
    <AnimatedTouchable
      style={[
        styles.button,
        getButtonStyle(),
        getPadding(),
        disabled && styles.disabled,
        style,
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={1}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? colors.primary.main : colors.background.default}
        />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.text, {color: getTextColor()}, textStyle]}>{title}</Text>
        </>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
  },
  text: {
    ...typography.button,
    fontWeight: '700',
  },
  iconContainer: {
    marginRight: spacing.xs,
  },
  disabled: {
    opacity: 0.5,
  },
});

