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
    scale.value = withSpring(0.97, {
      damping: 15,
      stiffness: 300,
    });
    translateY.value = withSpring(3, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handlePressOut = () => {
    if (disabled || !onPress) return;
    scale.value = withSpring(1, {
      damping: 20,
      stiffness: 200,
    });
    translateY.value = withSpring(0, {
      damping: 20,
      stiffness: 200,
    });
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
        accessibilityRole="button"
        accessibilityState={{disabled}}
        {...props}>
        {children}
      </AnimatedTouchable>
    );
  }

  // Filter out props that might cause type issues with Animated.View
  const {hitSlop, ...viewProps} = props;
  const safeViewProps: any = hitSlop === null ? viewProps : {...viewProps, hitSlop};

  return (
    <Animated.View style={cardStyle} {...safeViewProps}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
  },
});

