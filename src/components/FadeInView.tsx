/**
 * Fade In View Component
 *
 * Wrapper component that fades in its children with smooth animation.
 */

import React, {useEffect} from 'react';
import {View, ViewStyle} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

export const FadeInView: React.FC<FadeInViewProps> = React.memo(
  ({children, delay = 0, duration = 300, style}) => {
    const opacity = useSharedValue(0);

    useEffect(() => {
      opacity.value = withDelay(
        delay,
        withTiming(1, {
          duration,
          easing: Easing.out(Easing.ease),
        }),
      );
    }, [delay, duration]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
    }));

    return (
      <Animated.View style={[animatedStyle, style]}>
        {children}
      </Animated.View>
    );
  },
);

FadeInView.displayName = 'FadeInView';

