/**
 * Neubrutal Card Component
 *
 * Core card component with Material Neubrutomorphism design:
 * - Bold borders (3-4px)
 * - Triple-layer shadow system
 * - Neumorphic depth
 * - Brutalist offset shadow
 */

import React from 'react';
import {View, StyleSheet, ViewStyle, TouchableOpacity, TouchableOpacityProps} from 'react-native';
import {colors, spacing, borderRadius, neubrutalShadows} from '@constants/theme';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export interface NeubrutalCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle;
  borderWidth?: number;
  shadowSize?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  disabled?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const NeubrutalCard: React.FC<NeubrutalCardProps> = ({
  children,
  style,
  borderWidth = 3,
  shadowSize = 'medium',
  onPress,
  disabled = false,
  ...props
}) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {scale: scale.value},
      {translateY: translateY.value},
    ],
  }));

  const handlePressIn = () => {
    if (disabled || !onPress) return;
    scale.value = withSpring(0.98);
    translateY.value = withSpring(2);
  };

  const handlePressOut = () => {
    if (disabled || !onPress) return;
    scale.value = withSpring(1);
    translateY.value = withSpring(0);
  };

  const shadowStyle = neubrutalShadows[shadowSize];

  const cardStyle = [
    styles.card,
    {
      borderWidth,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface.secondary,
      borderColor: colors.border.primary,
      ...shadowStyle,
    },
    style,
    animatedStyle,
  ];

  if (onPress) {
    return (
      <AnimatedTouchable
        style={cardStyle}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
        {...props}>
        {children}
      </AnimatedTouchable>
    );
  }

  return (
    <Animated.View style={cardStyle} {...props}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
  },
});

