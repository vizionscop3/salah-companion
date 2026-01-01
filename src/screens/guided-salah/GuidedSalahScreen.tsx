/**
 * Guided Salah Screen
 *
 * Step-by-step prayer guidance with audio and visual cues.
 */

import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ProgressBar} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography, colors} from '@constants/theme';
import {NeubrutalCard, NeubrutalButton} from '@components/index';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  getPrayerGuide,
  getCurrentStep,
  getNextStep,
  isLastStep,
  PrayerGuide,
  SalahStep,
} from '@services/salah/guidedSalahService';
import {PrayerName} from '@services/prayer/prayerTimeService';
import {audioService} from '@services/audio/audioService';
import {isQuranicRecitation} from '@services/audio/audioMapping';

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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const prayerGuide = getPrayerGuide(prayer);
    setGuide(prayerGuide);
    setCurrentStepIndex(0);
    
    // Initialize audio service
    audioService.initialize();
    
    // Cleanup on unmount
    return () => {
      audioService.stopAudio();
    };
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

  const handlePlayAudio = async () => {
    if (!currentStep) return;

    try {
      setIsLoading(true);
      setIsPlaying(true);

      // Check if this is a Quranic recitation that can use API
      const useApi = isQuranicRecitation(currentStep.id);

      // Play audio (will use API if available, fallback to local)
      // Errors are handled silently by audioService
      await audioService.playAudio(
        currentStep.id,
        80,
        () => {
          setIsPlaying(false);
          setIsLoading(false);
        },
        useApi, // Enable API for Quranic recitations
      );
    } catch (error) {
      // Silent failure - audio is optional, don't disrupt user experience
      // Only log in dev mode
      if (__DEV__) {
        console.warn('Audio playback failed (silent fallback):', error);
      }
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const handleStopAudio = () => {
    audioService.stopAudio();
    setIsPlaying(false);
    setIsLoading(false);
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
          <Text style={styles.title}>
            Guided {prayer.charAt(0).toUpperCase() + prayer.slice(1)} Prayer
          </Text>
          <Text style={styles.subtitle}>
            Step {currentStepIndex + 1} of {guide.steps.length}
          </Text>
        </View>

        <ProgressBar progress={progress} color={colors.primary.main} style={styles.progressBar} />

        <NeubrutalCard style={styles.stepCard} shadowSize="large">
          <View style={styles.stepHeader}>
            <View style={styles.positionTag}>
              <MaterialCommunityIcons
                name={currentStep.position === 'standing' ? 'human-handsup' : currentStep.position === 'sujud' ? 'human' : 'human-handsup'}
                size={16}
                color={colors.primary.main}
              />
              <Text style={styles.positionText}>{currentStep.position || 'N/A'}</Text>
            </View>
            <Text style={styles.stepNumber}>
              Step {currentStep.order}
            </Text>
          </View>

          <Text style={styles.stepTitle}>{currentStep.instruction}</Text>

          {currentStep.arabic && (
            <View style={styles.arabicContainer}>
              <Text style={styles.arabicText}>
                {currentStep.arabic}
              </Text>
              {currentStep.transliteration && (
                <Text style={styles.transliteration}>
                  {currentStep.transliteration}
                </Text>
              )}
              {currentStep.translation && (
                <Text style={styles.translation}>
                  {currentStep.translation}
                </Text>
              )}
            </View>
          )}

          {(currentStep.audioUrl || currentStep.arabic) && (
            <NeubrutalButton
              title={isLoading ? 'Loading...' : isPlaying ? 'Stop Audio' : 'Play Audio'}
              onPress={isPlaying ? handleStopAudio : handlePlayAudio}
              variant="primary"
              size="large"
              loading={isLoading}
              disabled={isLoading}
              icon={
                <MaterialCommunityIcons
                  name={isPlaying ? 'stop' : 'play'}
                  size={20}
                  color={colors.background.default}
                />
              }
              style={styles.audioButton}
            />
          )}
        </NeubrutalCard>

        {nextStep && (
          <NeubrutalCard style={styles.nextStepCard} shadowSize="small">
            <Text style={styles.nextStepText}>Next: {nextStep.instruction}</Text>
          </NeubrutalCard>
        )}

        <View style={styles.navigationButtons}>
          <NeubrutalButton
            title="Previous"
            onPress={handlePrevious}
            variant="outline"
            size="medium"
            disabled={currentStepIndex === 0}
            style={styles.navButton}
          />
          <NeubrutalButton
            title={isLastStep(guide, currentStepIndex) ? 'Complete' : 'Next'}
            onPress={handleNext}
            variant="primary"
            size="medium"
            disabled={isLastStep(guide, currentStepIndex)}
            style={styles.navButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
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
    color: colors.text.primary,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    fontFamily: 'Poppins',
  },
  subtitle: {
    ...typography.body2,
    color: colors.text.secondary,
    opacity: 0.7,
  },
  progressBar: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    height: 8,
    borderRadius: 4,
  },
  stepCard: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface.secondary,
    borderColor: colors.primary.main,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  positionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.tertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary.main,
    gap: spacing.xs,
  },
  positionText: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.text.primary,
    textTransform: 'capitalize',
  },
  stepNumber: {
    ...typography.body2,
    fontWeight: '700',
    color: colors.primary.main,
    fontFamily: 'Poppins',
  },
  stepTitle: {
    ...typography.h5,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontFamily: 'Poppins',
  },
  arabicContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  arabicText: {
    ...typography.h3,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontFamily: 'Amiri',
    color: colors.text.primary,
    lineHeight: 48,
  },
  transliteration: {
    ...typography.body1,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: spacing.xs,
    color: colors.text.secondary,
  },
  translation: {
    ...typography.body2,
    textAlign: 'center',
    opacity: 0.8,
    color: colors.text.secondary,
  },
  audioButton: {
    marginTop: spacing.md,
  },
  nextStepCard: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface.tertiary,
    borderColor: colors.border.secondary,
  },
  nextStepText: {
    ...typography.body2,
    color: colors.text.secondary,
    opacity: 0.7,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  navButton: {
    flex: 1,
  },
});

