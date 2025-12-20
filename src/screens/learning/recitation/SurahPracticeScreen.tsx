/**
 * Surah Practice Screen
 * 
 * Practice complete surahs with comprehensive feedback and position tracking.
 */

import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  ProgressBar,
} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography, colors} from '@constants/theme';
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
          <ActivityIndicator size="large" color={currentTheme.colors.primary} />
          <Paragraph style={styles.loadingText}>Loading surah...</Paragraph>
        </View>
      </SafeAreaView>
    );
  }

  if (!surah && !isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Paragraph style={styles.errorText}>
            {loadError || 'Failed to load surah'}
          </Paragraph>
          <Button mode="contained" onPress={loadSurah} style={styles.retryButton}>
            Retry
          </Button>
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
          <Title style={styles.title}>{surah.englishName}</Title>
          <Paragraph style={styles.subtitle}>
            {surah.name} • {surah.numberOfAyahs} Ayahs
          </Paragraph>
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Paragraph style={styles.recordingText}>
                Recording: {formatDuration(recordingDuration)}
              </Paragraph>
            </View>
          )}
          {!isRecording && surah.ayahs.length > 0 && (
            <ProgressBar progress={progress} color={currentTheme.colors.primary} style={styles.progressBar} />
          )}
        </View>

        <Card style={[styles.surahCard, {backgroundColor: currentTheme.colors.surface}]}>
          <Card.Content>
            <View style={styles.actions}>
              <Button
                mode="outlined"
                icon="play"
                onPress={handlePlayReference}
                style={styles.actionButton}
                disabled={isRecording}>
                Play Reference
              </Button>
            </View>

            {!isRecording && !feedback && (
              <Button
                mode="contained"
                icon="microphone"
                onPress={handleStartRecording}
                style={styles.recordButton}>
                Start Recording
              </Button>
            )}

            {isRecording && (
              <Button
                mode="contained"
                icon="stop"
                onPress={handleStopRecording}
                style={[styles.recordButton, styles.stopButton]}>
                Stop Recording
              </Button>
            )}

            {isAnalyzing && (
              <View style={styles.analyzingContainer}>
                <ActivityIndicator size="large" color={currentTheme.colors.primary} />
                <Paragraph style={styles.analyzingText}>Analyzing your recitation...</Paragraph>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Display all ayahs */}
        <Card style={[styles.ayahsCard, {backgroundColor: currentTheme.colors.surface}]}>
          <Card.Content>
            <Title style={styles.ayahsTitle}>Surah Text</Title>
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
                    <Paragraph style={styles.transliteration}>{transliteration}</Paragraph>
                  )}
                </View>
              );
            })}
          </Card.Content>
        </Card>

        {/* Feedback Display */}
        {feedback && (
          <Card style={[styles.feedbackCard, {backgroundColor: currentTheme.colors.surface}]}>
            <Card.Content>
              <Title style={styles.feedbackTitle}>Practice Results</Title>
              
              <View style={styles.scoreContainer}>
                <View style={styles.scoreItem}>
                  <Paragraph style={styles.scoreLabel}>Overall Accuracy</Paragraph>
                  <Text style={[styles.scoreValue, {color: getAccuracyColor(feedback.overallAccuracy)}]}>
                    {feedback.overallAccuracy.toFixed(1)}%
                  </Text>
                </View>
                {feedback.tajweedScore !== undefined && (
                  <View style={styles.scoreItem}>
                    <Paragraph style={styles.scoreLabel}>Tajweed Score</Paragraph>
                    <Text style={[styles.scoreValue, {color: getAccuracyColor(feedback.tajweedScore)}]}>
                      {feedback.tajweedScore.toFixed(1)}%
                    </Text>
                  </View>
                )}
              </View>

              {feedback.improvementAreas.length > 0 && (
                <View style={styles.improvementSection}>
                  <Paragraph style={styles.improvementTitle}>Areas for Improvement:</Paragraph>
                  {feedback.improvementAreas.map((area, index) => (
                    <Paragraph key={index} style={styles.improvementItem}>
                      • {area}
                    </Paragraph>
                  ))}
                </View>
              )}

              <Button
                mode="outlined"
                onPress={() => {
                  setFeedback(null);
                  setCurrentAyahIndex(0);
                }}
                style={styles.retryButton}>
                Practice Again
              </Button>
            </Card.Content>
          </Card>
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h4,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body1,
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
    borderRadius: 12,
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
  },
  ayahsCard: {
    marginBottom: spacing.lg,
    borderRadius: 12,
  },
  ayahsTitle: {
    ...typography.h6,
    marginBottom: spacing.md,
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
  },
  ayahNumber: {
    ...typography.body2,
    fontWeight: '600',
    marginRight: spacing.sm,
    minWidth: 30,
  },
  ayahText: {
    ...typography.body1,
    fontSize: 20,
    fontFamily: 'Amiri',
    flex: 1,
    textAlign: 'right',
  },
  transliteration: {
    ...typography.body2,
    textAlign: 'right',
    opacity: 0.7,
    marginTop: spacing.xs,
    fontStyle: 'italic',
    color: '#666',
    flex: 1,
  },
  feedbackCard: {
    marginBottom: spacing.lg,
    borderRadius: 12,
  },
  feedbackTitle: {
    ...typography.h6,
    marginBottom: spacing.md,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.background.paper,
    borderRadius: 8,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    ...typography.body2,
    opacity: 0.7,
    marginBottom: spacing.xs,
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
  },
  improvementItem: {
    ...typography.body2,
    marginBottom: spacing.xs,
    opacity: 0.8,
  },
  retryButton: {
    marginTop: spacing.md,
  },
});


