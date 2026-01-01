/**
 * Surah Practice Screen
 * 
 * Practice complete surahs with comprehensive feedback and position tracking.
 */

import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView, Text, ViewStyle} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ActivityIndicator, ProgressBar} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography, colors} from '@constants/theme';
import {NeubrutalCard, NeubrutalButton} from '@components/index';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAuth} from '@context/AuthContext';
import {recordingService} from '@services/recitation/recordingService';
import {
  saveRecitationPractice,
  analyzeRecitation,
  type SurahFeedback,
} from '@services/recitation/recitationService';
import {
  getSurah,
  getAyahTransliteration,
  type Surah,
} from '@services/recitation/quranicTextService';
import {getFullSurahAudio} from '@services/audio/quranicAudioService';

interface SurahPracticeScreenProps {
  route: {
    params?: {
      surahNumber?: number;
    };
  };
}

export const SurahPracticeScreen: React.FC<SurahPracticeScreenProps> = ({route}) => {
  const {currentTheme} = useTheme();
  const {user} = useAuth();
  const {surahNumber = 1} = route.params || {};

  const [surah, setSurah] = useState<Surah | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<SurahFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [ayahTransliterations, setAyahTransliterations] = useState<
    Map<number, string>
  >(new Map());

  useEffect(() => {
    loadSurah();
    recordingService.requestPermissions();

    return () => {
      recordingService.cleanup();
    };
  }, [surahNumber]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const loadSurah = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const surahData = await getSurah(surahNumber);
      setSurah(surahData);

      // Load transliterations in the background (non-blocking)
      loadTransliterations(surahData.ayahs);
    } catch (error) {
      console.error('Error loading surah:', error);
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Failed to load surah. Please check your connection and try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadTransliterations = async (ayahs: Array<{numberInSurah: number}>) => {
    // Load transliterations in parallel, but don't block UI
    const transliterationPromises = ayahs.map(async (ayah, index) => {
      try {
        const transliteration = await getAyahTransliteration(
          surahNumber,
          ayah.numberInSurah,
        );
        if (transliteration) {
          setAyahTransliterations(prev => {
            const updated = new Map(prev);
            updated.set(ayah.numberInSurah, transliteration);
            return updated;
          });
        }
      } catch (error) {
        // Silently fail - transliteration is optional
        console.warn(`Failed to load transliteration for ayah ${ayah.numberInSurah}:`, error);
      }
    });

    // Don't await - let it load in background
    Promise.all(transliterationPromises).catch(() => {
      // Ignore errors
    });
  };

  const handlePlayReference = async () => {
    try {
      await getFullSurahAudio(surahNumber, 'alafasy');
      // Audio will play via the audio service
    } catch (error) {
      console.error('Error playing reference:', error);
    }
  };

  const handleStartRecording = async () => {
    try {
      const fileName = `surah_${surahNumber}_${Date.now()}.m4a`;
      await recordingService.startRecording(fileName);
      setIsRecording(true);
      setFeedback(null);
      setRecordingDuration(0);
      setCurrentAyahIndex(0);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const handleStopRecording = async () => {
    try {
      const path = await recordingService.stopRecording();
      setIsRecording(false);
      setIsAnalyzing(true);

      if (!user || !surah) return;

      // Combine all ayahs text for reference
      const referenceText = surah.ayahs.map(ayah => ayah.text).join(' ');

      // Analyze recitation using Tarteel.ai or fallback
      const analysis = await analyzeRecitation(
        path,
        referenceText,
        'surah',
        surahNumber,
      );

      setFeedback(analysis.feedback as SurahFeedback);

      // Save practice session
      await saveRecitationPractice(user.id, {
        surahId: surahNumber.toString(),
        practiceMode: 'surah',
        audioRecordingUrl: path,
        accuracyScore: analysis.accuracyScore,
        tajweedScore: analysis.tajweedScore,
        feedbackData: analysis.feedback,
        durationSeconds: recordingDuration,
      });

      setIsAnalyzing(false);
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsAnalyzing(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading surah...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!surah && !isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {loadError || 'Failed to load surah'}
          </Text>
          <NeubrutalButton
            title="Retry"
            onPress={loadSurah}
            variant="primary"
            size="medium"
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!surah) {
    return null;
  }

  const progress = surah.ayahs.length > 0 ? (currentAyahIndex + 1) / surah.ayahs.length : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{surah.englishName}</Text>
          <Text style={styles.subtitle}>
            {surah.name} • {surah.numberOfAyahs} Ayahs
          </Text>
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>
                Recording: {formatDuration(recordingDuration)}
              </Text>
            </View>
          )}
          {!isRecording && surah.ayahs.length > 0 && (
            <ProgressBar progress={progress} color={colors.primary.main} style={styles.progressBar} />
          )}
        </View>

        <NeubrutalCard style={styles.surahCard} shadowSize="medium">
          <View style={styles.actions}>
            <NeubrutalButton
              title="Play Reference"
              onPress={handlePlayReference}
              variant="outline"
              size="medium"
              disabled={isRecording}
              icon={
                <MaterialCommunityIcons
                  name="play"
                  size={20}
                  color={colors.primary.main}
                />
              }
              style={styles.actionButton}
            />
          </View>

          {!isRecording && !feedback && (
            <NeubrutalButton
              title="Start Recording"
              onPress={handleStartRecording}
              variant="primary"
              size="large"
              icon={
                <MaterialCommunityIcons
                  name="microphone"
                  size={20}
                  color={colors.background.default}
                />
              }
              style={styles.recordButton}
            />
          )}

          {isRecording && (
            <NeubrutalButton
              title="Stop Recording"
              onPress={handleStopRecording}
              variant="primary"
              size="large"
              icon={
                <MaterialCommunityIcons
                  name="stop"
                  size={20}
                  color={colors.background.default}
                />
              }
              style={StyleSheet.flatten([styles.recordButton, styles.stopButton])}
            />
          )}

          {isAnalyzing && (
            <View style={styles.analyzingContainer}>
              <ActivityIndicator size="large" color={colors.primary.main} />
              <Text style={styles.analyzingText}>Analyzing your recitation...</Text>
            </View>
          )}
        </NeubrutalCard>

        {/* Display all ayahs */}
        <NeubrutalCard style={styles.ayahsCard} shadowSize="large">
          <Text style={styles.ayahsTitle}>Surah Text</Text>
          {surah.ayahs.map((ayah, index) => {
            const transliteration = ayahTransliterations.get(ayah.numberInSurah);
            return (
              <View
                key={ayah.number}
                style={[
                  styles.ayahContainer,
                  index === currentAyahIndex && isRecording && styles.currentAyah,
                ]}>
                <Text style={styles.ayahNumber}>{ayah.numberInSurah}</Text>
                <Text style={styles.ayahText}>{ayah.text}</Text>
                {transliteration && (
                  <Text style={styles.transliteration}>{transliteration}</Text>
                )}
              </View>
            );
          })}
        </NeubrutalCard>

        {/* Feedback Display */}
        {feedback && (
          <NeubrutalCard style={styles.feedbackCard} shadowSize="medium">
            <Text style={styles.feedbackTitle}>Practice Results</Text>
            
            <View style={styles.scoreContainer}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Overall Accuracy</Text>
                <Text style={[styles.scoreValue, {color: getAccuracyColor(feedback.overallAccuracy)}]}>
                  {feedback.overallAccuracy.toFixed(1)}%
                </Text>
              </View>
              {feedback.tajweedScore !== undefined && (
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreLabel}>Tajweed Score</Text>
                  <Text style={[styles.scoreValue, {color: getAccuracyColor(feedback.tajweedScore)}]}>
                    {feedback.tajweedScore.toFixed(1)}%
                  </Text>
                </View>
              )}
            </View>

            {feedback.improvementAreas.length > 0 && (
              <View style={styles.improvementSection}>
                <Text style={styles.improvementTitle}>Areas for Improvement:</Text>
                {feedback.improvementAreas.map((area, index) => (
                  <Text key={index} style={styles.improvementItem}>
                    • {area}
                  </Text>
                ))}
              </View>
            )}

            <NeubrutalButton
              title="Practice Again"
              onPress={() => {
                setFeedback(null);
                setCurrentAyahIndex(0);
              }}
              variant="outline"
              size="medium"
              style={styles.retryButton}
            />
          </NeubrutalCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const getAccuracyColor = (score: number): string => {
  if (score >= 90) return colors.success.main;
  if (score >= 70) return colors.warning.main;
  return colors.error.main;
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
    marginTop: spacing.md,
    color: colors.text.primary,
    ...typography.body1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    marginBottom: spacing.md,
    color: colors.error.main,
    ...typography.body1,
    textAlign: 'center',
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h4,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    fontFamily: 'Poppins',
  },
  subtitle: {
    ...typography.body1,
    color: colors.text.secondary,
    opacity: 0.7,
    marginBottom: spacing.sm,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.error.light,
    borderRadius: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error.main,
    marginRight: spacing.sm,
  },
  recordingText: {
    ...typography.body1,
    color: colors.error.main,
    fontWeight: '600',
  },
  progressBar: {
    marginTop: spacing.sm,
    height: 8,
    borderRadius: 4,
  },
  surahCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface.secondary,
    borderColor: colors.primary.main,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  actionButton: {
    marginHorizontal: spacing.xs,
  },
  recordButton: {
    marginTop: spacing.md,
  },
  stopButton: {
    backgroundColor: colors.error.main,
  },
  analyzingContainer: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  analyzingText: {
    marginTop: spacing.md,
    color: colors.text.secondary,
    ...typography.body2,
  },
  ayahsCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface.secondary,
    borderColor: colors.primary.main,
  },
  ayahsTitle: {
    ...typography.h6,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontFamily: 'Poppins',
  },
  ayahContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderRadius: 8,
  },
  currentAyah: {
    backgroundColor: colors.primary.light + '20',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.main,
    borderWidth: 2,
    borderColor: colors.primary.main,
    borderRadius: 8,
  },
  ayahNumber: {
    ...typography.body2,
    fontWeight: '600',
    marginRight: spacing.sm,
    minWidth: 30,
    color: colors.text.secondary,
  },
  ayahText: {
    ...typography.body1,
    fontSize: 20,
    fontFamily: 'Amiri',
    flex: 1,
    textAlign: 'right',
    color: colors.text.primary,
  },
  transliteration: {
    ...typography.body2,
    textAlign: 'right',
    opacity: 0.7,
    marginTop: spacing.xs,
    fontStyle: 'italic',
    color: colors.text.secondary,
    flex: 1,
  },
  feedbackCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface.secondary,
    borderColor: colors.primary.main,
  },
  feedbackTitle: {
    ...typography.h6,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontFamily: 'Poppins',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface.tertiary,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    ...typography.body2,
    opacity: 0.7,
    marginBottom: spacing.xs,
    color: colors.text.secondary,
  },
  scoreValue: {
    ...typography.h4,
    fontWeight: '700',
  },
  improvementSection: {
    marginBottom: spacing.md,
  },
  improvementTitle: {
    ...typography.body1,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  improvementItem: {
    ...typography.body2,
    marginBottom: spacing.xs,
    opacity: 0.8,
    color: colors.text.secondary,
  },
  retryButton: {
    marginTop: spacing.md,
  },
});


