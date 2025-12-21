/**
 * Achievement Unlock Modal Component
 *
 * Displays a celebration modal when an achievement is unlocked.
 */

import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Modal, Animated} from 'react-native';
import {Card, Button, Title} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography, colors, elevation} from '@constants/theme';
import type {UnlockedAchievement} from '@services/achievements/achievementService';
import {ICON_MAP} from './AchievementBadge';

export interface AchievementUnlockModalProps {
  achievement: UnlockedAchievement | null;
  visible: boolean;
  onDismiss: () => void;
}

export const AchievementUnlockModal: React.FC<AchievementUnlockModalProps> = ({
  achievement,
  visible,
  onDismiss,
}) => {
  const {currentTheme} = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && achievement) {
      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible, achievement, scaleAnim, opacityAnim]);

  if (!achievement) {
    return null;
  }

  const icon = ICON_MAP[achievement.iconName] || '🏆';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{scale: scaleAnim}],
              opacity: opacityAnim,
            },
          ]}>
          <Card style={[styles.card, elevation[8]]}>
            <Card.Content style={styles.content}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>{icon}</Text>
                <View style={styles.sparkleContainer}>
                  <Text style={styles.sparkle}>✨</Text>
                </View>
              </View>

              <Title style={[styles.title, {color: currentTheme.colors.primary}]}>
                Achievement Unlocked!
              </Title>

              <Text style={[styles.achievementTitle, {color: currentTheme.colors.text}]}>
                {achievement.title}
              </Text>

              <Text
                style={[
                  styles.description,
                  {color: currentTheme.colors.text + 'CC'},
                ]}>
                {achievement.description}
              </Text>

              <View style={styles.pointsContainer}>
                <Text style={[styles.pointsLabel, {color: currentTheme.colors.text}]}>
                  Points Awarded:
                </Text>
                <Text
                  style={[styles.pointsValue, {color: currentTheme.colors.secondary}]}>
                  +{achievement.pointsAwarded}
                </Text>
              </View>

              <Button
                mode="contained"
                onPress={onDismiss}
                style={styles.button}
                contentStyle={styles.buttonContent}>
                Awesome!
              </Button>
            </Card.Content>
          </Card>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: 400,
  },
  card: {
    borderRadius: 20,
    backgroundColor: colors.surface.main,
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 80,
    textAlign: 'center',
  },
  sparkleContainer: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  sparkle: {
    fontSize: 30,
  },
  title: {
    ...typography.h4,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  achievementTitle: {
    ...typography.h5,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    ...typography.body1,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.primary.light + '20',
    borderRadius: 12,
  },
  pointsLabel: {
    ...typography.body1,
    marginRight: spacing.sm,
  },
  pointsValue: {
    ...typography.h5,
    fontWeight: '700',
  },
  button: {
    marginTop: spacing.md,
    minWidth: 150,
  },
  buttonContent: {
    paddingVertical: spacing.xs,
  },
});
