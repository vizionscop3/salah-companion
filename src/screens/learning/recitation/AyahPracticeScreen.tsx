/**
 * Ayah Practice Screen
 * 
 * Practice complete ayahs with word-level analysis.
 */

import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ActivityIndicator} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography, colors} from '@constants/theme';
import {NeubrutalCard, NeubrutalButton} from '@components/index';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAuth} from '@context/AuthContext';
import {recordingService} from '@services/recitation/recordingService';
import {
  saveRecitationPractice,
  analyzeRecitation,
  type AyahFeedback,
} from '@services/recitation/recitationService';
import {
  getAyah,
  getAyahTranslations,
  getAyahTransliteration,
  type AyahTranslationInfo,
} from '@services/recitation/quranicTextService';
import {playQuranicAudio} from '@services/audio/quranicAudioService';

interface AyahPracticeScreenProps {
  route: {
    params?: {
      surahNumber?: number;
      ayahNumber?: number;
    };
  };
}

export const AyahPracticeScreen: React.FC<AyahPracticeScreenProps> = ({route}) => {
  const {currentTheme} = useTheme();
  const {user} = useAuth();
  const {surahNumber = 1, ayahNumber = 1} = route.params || {};

  const [ayah, setAyah] = useState<{
    text: string;
    transliteration: string;
    translations: AyahTranslationInfo[];
  } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<AyahFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);

  useEffect(() => {
    loadAyah();
    recordingService.requestPermissions();

    return () => {
      recordingService.cleanup();
    };
  }, [surahNumber, ayahNumber]);

  const loadAyah = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      setTranslationError(null);

      const [ayahResult, translationsResult, transliterationResult] =
        await Promise.allSettled([
          getAyah(surahNumber, ayahNumber),
          getAyahTranslations(surahNumber, ayahNumber),
          getAyahTransliteration(surahNumber, ayahNumber),
        ]);

      if (ayahResult.status === 'rejected') {
        throw ayahResult.reason;
      }

      const ayahData = ayahResult.value;
      const translations: AyahTranslationInfo[] =
        translationsResult.status === 'fulfilled' ? translationsResult.value : [];
      const transliteration: string =
        transliterationResult.status === 'fulfilled' ? transliterationResult.value : '';

      if (translationsResult.status === 'rejected') {
        setTranslationError('Unable to load translations. Showing Arabic only.');
      }

      setAyah({
        text: ayahData.text,
        transliteration,
        translations,
      });
    } catch (error) {
      console.error('Error loading ayah:', error);
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Failed to load ayah. Please check your connection and try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayReference = async () => {
    try {
      await playQuranicAudio(surahNumber, ayahNumber, 'alafasy', 80);
    } catch (error) {
      console.error('Error playing reference:', error);
    }
  };

  const handleStartRecording = async () => {
    try {
      const fileName = `ayah_${surahNumber}_${ayahNumber}_${Date.now()}.m4a`;
      await recordingService.startRecording(fileName);
      setIsRecording(true);
      setFeedback(null);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const handleStopRecording = async () => {
    try {
      const path = await recordingService.stopRecording();
      setIsRecording(false);
      setIsAnalyzing(true);

      // Analyze recording
      const analysis = await analyzeRecitation(
        path,
        ayah?.text || '',
        'ayah',
        surahNumber,
        ayahNumber,
      );
      setFeedback(analysis.feedback as AyahFeedback);

      // Save practice session
      if (user && ayah) {
        await saveRecitationPractice(user.id, {
          surahId: surahNumber.toString(),
          ayahId: ayahNumber.toString(),
          practiceMode: 'ayah',
          audioRecordingUrl: path,
          accuracyScore: analysis.accuracyScore,
          tajweedScore: analysis.tajweedScore,
          feedbackData: analysis.feedback,
          durationSeconds: Math.floor(recordingService.getRecordingState().duration / 1000),
        });
      }

      setIsAnalyzing(false);
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading ayah...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!ayah && !isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {loadError || 'Failed to load ayah'}
          </Text>
          <NeubrutalButton
            title="Retry"
            onPress={loadAyah}
            variant="primary"
            size="medium"
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!ayah) {
    return null;
  }

  const accuracyColor = feedback
    ? feedback.overallAccuracy >= 90
      ? colors.success.main
      : feedback.overallAccuracy >= 70
      ? colors.warning.main
      : colors.error.main
    : undefined;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Ayah Practice</Text>
          <Text style={styles.subtitle}>
            Surah {surahNumber}, Ayah {ayahNumber}
          </Text>
          {translationError && (
            <Text style={styles.translationError}>{translationError}</Text>
          )}
        </View>

        <NeubrutalCard style={styles.ayahCard} shadowSize="large">
          <View style={styles.ayahContainer}>
            <Text style={styles.arabicText}>{ayah?.text || ''}</Text>
            {ayah?.transliteration && (
              <Text style={styles.transliteration}>
                {ayah.transliteration}
              </Text>
            )}
            {ayah && ayah.translations.length > 0 && (
              <View style={styles.translationsContainer}>
                {ayah.translations.map(t => (
                  <View key={`${t.id}-${t.resourceId}`} style={styles.translationBlock}>
                    <Text style={styles.translation}>{t.text}</Text>
                    {(t.resourceName || t.authorName) && (
                      <Text style={styles.translationMeta}>
                        {t.resourceName}
                        {t.authorName ? ` — ${t.authorName}` : ''}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.actions}>
            <NeubrutalButton
              title="Play Reference"
              onPress={handlePlayReference}
              variant="outline"
              size="medium"
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
        </NeubrutalCard>

        <NeubrutalCard style={styles.recordingCard} shadowSize="medium">
          <Text style={styles.sectionTitle}>Record Your Recitation</Text>
          
          {isRecording ? (
            <View style={styles.recordingContainer}>
              <ActivityIndicator size="large" color={colors.error.main} />
              <Text style={styles.recordingText}>Recording...</Text>
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
                style={styles.stopButton}
              />
            </View>
          ) : (
            <NeubrutalButton
              title={isAnalyzing ? 'Analyzing...' : 'Start Recording'}
              onPress={handleStartRecording}
              variant="primary"
              size="large"
              disabled={isAnalyzing}
              loading={isAnalyzing}
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

          {isAnalyzing && (
            <View style={styles.analyzingContainer}>
              <ActivityIndicator size="small" color={colors.primary.main} />
              <Text style={styles.analyzingText}>Analyzing your recitation...</Text>
            </View>
          )}
        </NeubrutalCard>

        {feedback && (
          <NeubrutalCard style={styles.feedbackCard} shadowSize="medium">
            <Text style={styles.sectionTitle}>Feedback</Text>
            
            <View style={styles.accuracyContainer}>
              <Text style={styles.accuracyLabel}>Overall Accuracy</Text>
              <View style={[styles.accuracyCircle, {borderColor: accuracyColor}]}>
                <Text style={[styles.accuracyScore, {color: accuracyColor}]}>
                  {Math.round(feedback.overallAccuracy)}%
                </Text>
              </View>
            </View>

            {feedback.tajweedScore !== undefined && (
              <View style={styles.tajweedContainer}>
                <Text style={styles.tajweedLabel}>Tajweed Score</Text>
                <Text style={styles.tajweedScore}>
                  {Math.round(feedback.tajweedScore)}%
                </Text>
              </View>
            )}

            {feedback.commonIssues && feedback.commonIssues.length > 0 && (
              <View style={styles.issuesContainer}>
                <Text style={styles.issuesTitle}>Areas to Improve:</Text>
                {feedback.commonIssues.map((issue, index) => (
                  <View key={index} style={styles.issueItem}>
                    <Text style={styles.issueText}>• {issue}</Text>
                  </View>
                ))}
              </View>
            )}

            {feedback.words && feedback.words.length > 0 && (
              <View style={styles.wordsContainer}>
                <Text style={styles.wordsTitle}>Word-by-Word Analysis:</Text>
                {feedback.words.map((word, index) => (
                  <View
                    key={index}
                    style={[
                      styles.wordItem,
                      word.needsWork && styles.wordItemNeedsWork,
                    ]}>
                    <Text style={styles.wordArabic}>{word.arabicText}</Text>
                    <Text style={styles.wordAccuracy}>
                      {Math.round(word.accuracy)}%
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </NeubrutalCard>
        )}
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
    textAlign: 'center',
    color: colors.error.main,
    ...typography.body1,
  },
  retryButton: {
    marginTop: spacing.sm,
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
    ...typography.body1,
    color: colors.text.secondary,
    opacity: 0.7,
  },
  ayahCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface.secondary,
    borderColor: colors.primary.main,
  },
  ayahContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  arabicText: {
    ...typography.h3,
    fontFamily: 'Amiri',
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 48,
    color: colors.text.primary,
  },
  translation: {
    ...typography.body1,
    textAlign: 'center',
    opacity: 0.8,
    fontStyle: 'italic',
    color: colors.text.secondary,
  },
  translationsContainer: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  translationBlock: {
    marginBottom: spacing.xs,
  },
  translationMeta: {
    ...typography.body2,
    textAlign: 'center',
    opacity: 0.6,
    marginTop: spacing.xs,
    color: colors.text.secondary,
  },
  translationError: {
    ...typography.body2,
    color: colors.error.main,
    marginTop: spacing.xs,
  },
  transliteration: {
    ...typography.body1,
    textAlign: 'center',
    opacity: 0.7,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    fontStyle: 'italic',
    color: colors.text.secondary,
  },
  actions: {
    marginTop: spacing.sm,
  },
  actionButton: {
    marginTop: spacing.xs,
  },
  recordingCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface.secondary,
    borderColor: colors.primary.main,
  },
  sectionTitle: {
    ...typography.h5,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontFamily: 'Poppins',
  },
  recordingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  recordingText: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    color: colors.text.primary,
    ...typography.body1,
  },
  stopButton: {
    marginTop: spacing.sm,
  },
  recordButton: {
    marginTop: spacing.sm,
  },
  analyzingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    justifyContent: 'center',
  },
  analyzingText: {
    marginLeft: spacing.sm,
    color: colors.text.secondary,
    ...typography.body2,
  },
  feedbackCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface.secondary,
    borderColor: colors.primary.main,
  },
  accuracyContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  accuracyLabel: {
    ...typography.body1,
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  accuracyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accuracyScore: {
    ...typography.h2,
    fontWeight: 'bold',
  },
  tajweedContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.surface.tertiary,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  tajweedLabel: {
    ...typography.body2,
    marginBottom: spacing.xs,
    color: colors.text.secondary,
  },
  tajweedScore: {
    ...typography.h4,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  issuesContainer: {
    marginTop: spacing.md,
  },
  issuesTitle: {
    ...typography.body1,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  issueItem: {
    marginBottom: spacing.xs,
  },
  issueText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  wordsContainer: {
    marginTop: spacing.md,
  },
  wordsTitle: {
    ...typography.body1,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  wordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderRadius: 4,
  },
  wordItemNeedsWork: {
    backgroundColor: colors.warning.light + '20',
    borderWidth: 2,
    borderColor: colors.warning.main,
  },
  wordArabic: {
    ...typography.body1,
    fontFamily: 'Amiri',
    flex: 1,
    color: colors.text.primary,
  },
  wordAccuracy: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.text.secondary,
  },
});

