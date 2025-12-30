/**
 * Animated Card Component
 *
 * Enhanced card with smooth entrance animations and improved interactions.
 */

import React, {useEffect} from 'react';
import {ViewStyle} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import {NeubrutalCard, NeubrutalCardProps} from './NeubrutalCard';
import {getStaggerDelay, springConfigs} from '@utils/animations';

export interface AnimatedCardProps extends NeubrutalCardProps {
  index?: number;
  delay?: number;
  animateOnMount?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = React.memo(
  ({index = 0, delay = 0, animateOnMount = true, style, children, ...props}) => {
    const opacity = useSharedValue(animateOnMount ? 0 : 1);
    const translateY = useSharedValue(animateOnMount ? 20 : 0);
    const scale = useSharedValue(animateOnMount ? 0.95 : 1);

    useEffect(() => {
      if (animateOnMount) {
        const staggerDelay = getStaggerDelay(index, 50);
        const totalDelay = delay + staggerDelay;

        opacity.value = withDelay(
          totalDelay,
          withSpring(1, springConfigs.smooth),
        );
        translateY.value = withDelay(
          totalDelay,
          withSpring(0, springConfigs.smooth),
        );
        scale.value = withDelay(
          totalDelay,
          withSpring(1, springConfigs.bouncy),
        );
      }
    }, [animateOnMount, index, delay]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [
        {translateY: translateY.value},
        {scale: scale.value},
      ],
    }));

    return (
      <Animated.View style={[animatedStyle, style]}>
        <NeubrutalCard {...props}>{children}</NeubrutalCard>
      </Animated.View>
    );
  },
);

AnimatedCard.displayName = 'AnimatedCard';

