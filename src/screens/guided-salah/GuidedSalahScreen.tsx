/**
 * Guided Salah Screen
 *
 * Step-by-step prayer guidance with audio and visual cues.
 */

import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ProgressBar,
  Chip,
} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography} from '@constants/theme';
import {
  getPrayerGuide,
  getCurrentStep,
  getNextStep,
  isLastStep,
  PrayerGuide,
  SalahStep,
} from '@services/salah/guidedSalahService';
import {PrayerName} from '@services/prayer/prayerTimeService';

interface GuidedSalahScreenProps {
  route?: {
    params?: {
      prayer?: PrayerName;
    };
  };
}

export const GuidedSalahScreen: React.FC<GuidedSalahScreenProps> = ({
  route,
}) => {
  const {currentTheme} = useTheme();
  const prayer = route?.params?.prayer || 'fajr';
  const [guide, setGuide] = useState<PrayerGuide | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const prayerGuide = getPrayerGuide(prayer);
    setGuide(prayerGuide);
    setCurrentStepIndex(0);
  }, [prayer]);

  const currentStep = guide
    ? getCurrentStep(guide, currentStepIndex)
    : null;
  const nextStep = guide ? getNextStep(guide, currentStepIndex) : null;
  const progress = guide
    ? (currentStepIndex + 1) / guide.steps.length
    : 0;

  const handleNext = () => {
    if (guide && !isLastStep(guide, currentStepIndex)) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handlePlayAudio = () => {
    // TODO: Implement audio playback
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 2000);
  };

  if (!guide || !currentStep) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, {color: currentTheme.colors.text}]}>
            Loading prayer guide...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: currentTheme.colors.text}]}>
            Guided {prayer.charAt(0).toUpperCase() + prayer.slice(1)} Prayer
          </Text>
          <Text style={[styles.subtitle, {color: currentTheme.colors.text}]}>
            Step {currentStepIndex + 1} of {guide.steps.length}
          </Text>
        </View>

        <ProgressBar progress={progress} color={currentTheme.colors.primary} />

        <Card style={styles.stepCard}>
          <Card.Content>
            <View style={styles.stepHeader}>
              <Chip
                icon={currentStep.position === 'standing' ? 'human-handsup' : undefined}
                style={styles.positionChip}>
                {currentStep.position || 'N/A'}
              </Chip>
              <Text style={[styles.stepNumber, {color: currentTheme.colors.primary}]}>
                Step {currentStep.order}
              </Text>
            </View>

            <Title style={styles.stepTitle}>{currentStep.instruction}</Title>

            {currentStep.arabic && (
              <View style={styles.arabicContainer}>
                <Text style={[styles.arabicText, {color: currentTheme.colors.text}]}>
                  {currentStep.arabic}
                </Text>
                {currentStep.transliteration && (
                  <Text
                    style={[
                      styles.transliteration,
                      {color: currentTheme.colors.text},
                    ]}>
                    {currentStep.transliteration}
                  </Text>
                )}
                {currentStep.translation && (
                  <Text
                    style={[styles.translation, {color: currentTheme.colors.text}]}>
                    {currentStep.translation}
                  </Text>
                )}
              </View>
            )}

            {currentStep.audioUrl && (
              <Button
                mode="contained"
                onPress={handlePlayAudio}
                icon={isPlaying ? 'pause' : 'play'}
                style={styles.audioButton}
                loading={isPlaying}>
                {isPlaying ? 'Playing...' : 'Play Audio'}
              </Button>
            )}
          </Card.Content>
        </Card>

        {nextStep && (
          <Card style={styles.nextStepCard}>
            <Card.Content>
              <Title>Next: {nextStep.instruction}</Title>
            </Card.Content>
          </Card>
        )}

        <View style={styles.navigationButtons}>
          <Button
            mode="outlined"
            onPress={handlePrevious}
            disabled={currentStepIndex === 0}
            style={styles.navButton}>
            Previous
          </Button>
          <Button
            mode="contained"
            onPress={handleNext}
            disabled={isLastStep(guide, currentStepIndex)}
            style={styles.navButton}>
            {isLastStep(guide, currentStepIndex) ? 'Complete' : 'Next'}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body1,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body2,
    opacity: 0.7,
  },
  stepCard: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    elevation: 4,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  positionChip: {
    marginRight: spacing.sm,
  },
  stepNumber: {
    ...typography.body2,
    fontWeight: '600',
  },
  stepTitle: {
    marginBottom: spacing.md,
  },
  arabicContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  arabicText: {
    ...typography.h4,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontFamily: 'Amiri', // Arabic font
  },
  transliteration: {
    ...typography.body1,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  translation: {
    ...typography.body2,
    textAlign: 'center',
    opacity: 0.7,
  },
  audioButton: {
    marginTop: spacing.md,
  },
  nextStepCard: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: '#F5F5F5',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  navButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});

