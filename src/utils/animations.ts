/**
 * Animation Utilities
 *
 * Reusable animation configurations and helpers for smooth UI transitions.
 */

import {withSpring, withTiming, Easing} from 'react-native-reanimated';

/**
 * Spring animation configurations
 */
export const springConfigs = {
  gentle: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  bouncy: {
    damping: 10,
    stiffness: 200,
    mass: 0.8,
  },
  snappy: {
    damping: 20,
    stiffness: 300,
    mass: 0.5,
  },
  smooth: {
    damping: 25,
    stiffness: 180,
    mass: 1.2,
  },
};

/**
 * Timing animation configurations
 */
export const timingConfigs = {
  fast: {
    duration: 200,
    easing: Easing.out(Easing.cubic),
  },
  medium: {
    duration: 300,
    easing: Easing.inOut(Easing.ease),
  },
  slow: {
    duration: 500,
    easing: Easing.inOut(Easing.ease),
  },
  smooth: {
    duration: 400,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  },
};

/**
 * Create spring animation
 */
export function createSpringAnimation(
  toValue: number,
  config: keyof typeof springConfigs = 'gentle',
) {
  return withSpring(toValue, springConfigs[config]);
}

/**
 * Create timing animation
 */
export function createTimingAnimation(
  toValue: number,
  config: keyof typeof timingConfigs = 'medium',
) {
  return withTiming(toValue, timingConfigs[config]);
}

/**
 * Fade in animation
 */
export function fadeIn(duration: number = 300) {
  return withTiming(1, {
    duration,
    easing: Easing.out(Easing.ease),
  });
}

/**
 * Fade out animation
 */
export function fadeOut(duration: number = 200) {
  return withTiming(0, {
    duration,
    easing: Easing.in(Easing.ease),
  });
}

/**
 * Slide in from bottom animation
 */
export function slideInFromBottom(translateY: number = 0) {
  return withSpring(translateY, springConfigs.smooth);
}

/**
 * Slide out to bottom animation
 */
export function slideOutToBottom(translateY: number = 100) {
  return withTiming(translateY, timingConfigs.fast);
}

/**
 * Scale animation
 */
export function scaleAnimation(scale: number, config: keyof typeof springConfigs = 'bouncy') {
  return withSpring(scale, springConfigs[config]);
}

/**
 * Rotate animation
 */
export function rotateAnimation(degrees: number) {
  return withTiming(degrees, timingConfigs.medium);
}

/**
 * Stagger animation delays for list items
 */
export function getStaggerDelay(index: number, delay: number = 50): number {
  return index * delay;
}

/**
 * Pulse animation (for loading states)
 */
export function createPulseAnimation() {
  return {
    opacity: withTiming(0.3, {
      duration: 1000,
      easing: Easing.inOut(Easing.ease),
    }),
  };
}
