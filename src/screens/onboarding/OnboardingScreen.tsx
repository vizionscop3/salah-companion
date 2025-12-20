/**
 * Onboarding Screen
 *
 * First-time user onboarding flow.
 */

import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Dimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Button, Card} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {useAuth} from '@context/AuthContext';
import {spacing, typography, colors, elevation} from '@constants/theme';
import {useNavigation} from '@react-navigation/native';
import {updateUserProfile} from '@services/auth/authService';
import {prisma} from '@services/database/prismaClient';

const {width} = Dimensions.get('window');

interface OnboardingStep {
  title: string;
  description: string;
  icon: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'Welcome to Salah Companion',
    description:
      'Your personal guide to prayer, learning, and spiritual growth. Let\'s get started!',
    icon: '🕌',
  },
  {
    title: 'Accurate Prayer Times',
    description:
      'Get precise prayer times based on your location with multiple calculation methods.',
    icon: '🕐',
  },
  {
    title: 'Guided Prayer',
    description:
      'Step-by-step guidance through each prayer with Arabic text, transliteration, and translation.',
    icon: '📿',
  },
  {
    title: 'Track Your Progress',
    description:
      'Build consistency with daily streaks and achievements as you grow in your practice.',
    icon: '📈',
  },
  {
    title: 'Learn & Grow',
    description:
      'Master Arabic pronunciation, practice recitation, and deepen your understanding.',
    icon: '📚',
  },
];

export const OnboardingScreen: React.FC = () => {
  const {currentTheme} = useTheme();
  const {user, refreshUser} = useAuth();
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Mark onboarding as complete
      await prisma.user.update({
        where: {id: user.id},
        data: {onboardingCompleted: true},
      });

      // Refresh user data
      await refreshUser();

      // Navigate to main app
      // Navigation will be handled by AppNavigator based on auth state
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {ONBOARDING_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep && styles.progressDotActive,
                {
                  backgroundColor:
                    index <= currentStep
                      ? currentTheme.colors.primary
                      : colors.surface.dark,
                },
              ]}
            />
          ))}
        </View>

        {/* Step Content */}
        <Card style={[styles.card, elevation[4]]}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.icon}>{currentStepData.icon}</Text>
            <Text style={[styles.title, {color: currentTheme.colors.text}]}>
              {currentStepData.title}
            </Text>
            <Text style={[styles.description, {color: currentTheme.colors.text}]}>
              {currentStepData.description}
            </Text>
          </Card.Content>
        </Card>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {!isLastStep && (
            <Button
              mode="text"
              onPress={handleSkip}
              textColor={currentTheme.colors.text}
              style={styles.skipButton}>
              Skip
            </Button>
          )}
          <Button
            mode="contained"
            onPress={handleNext}
            loading={loading}
            disabled={loading}
            style={styles.nextButton}
            contentStyle={styles.nextButtonContent}>
            {isLastStep ? 'Get Started' : 'Next'}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.paper,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  progressDotActive: {
    width: 24,
  },
  card: {
    borderRadius: 16,
    backgroundColor: colors.surface.main,
    marginBottom: spacing.xl,
  },
  cardContent: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  icon: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body1,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  skipButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
    marginLeft: spacing.md,
  },
  nextButtonContent: {
    paddingVertical: spacing.sm,
  },
});

