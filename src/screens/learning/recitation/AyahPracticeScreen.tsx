/**
 * Ayah Practice Screen
 * 
 * Practice complete ayahs with word-level analysis.
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
} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography} from '@constants/theme';
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
          <ActivityIndicator size="large" />
          <Paragraph style={styles.loadingText}>Loading ayah...</Paragraph>
        </View>
      </SafeAreaView>
    );
  }

  if (!ayah && !isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Paragraph style={styles.errorText}>
            {loadError || 'Failed to load ayah'}
          </Paragraph>
          <Button mode="contained" onPress={loadAyah} style={styles.retryButton}>
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!ayah) {
    return null;
  }

  const accuracyColor = feedback
    ? feedback.overallAccuracy >= 90
      ? '#4CAF50'
      : feedback.overallAccuracy >= 70
      ? '#FF9800'
      : '#F44336'
    : undefined;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Title style={styles.title}>Ayah Practice</Title>
          <Paragraph style={styles.subtitle}>
            Surah {surahNumber}, Ayah {ayahNumber}
          </Paragraph>
          {translationError && (
            <Paragraph style={styles.translationError}>{translationError}</Paragraph>
          )}
        </View>

        <Card style={[styles.ayahCard, {backgroundColor: currentTheme.colors.surface}]}>
          <Card.Content>
            <View style={styles.ayahContainer}>
              <Text style={styles.arabicText}>{ayah?.text || ''}</Text>
              {ayah?.transliteration && (
                <Paragraph style={styles.transliteration}>
                  {ayah.transliteration}
                </Paragraph>
              )}
              {ayah && ayah.translations.length > 0 && (
                <View style={styles.translationsContainer}>
                  {ayah.translations.map(t => (
                    <View key={`${t.id}-${t.resourceId}`} style={styles.translationBlock}>
                      <Paragraph style={styles.translation}>{t.text}</Paragraph>
                      {(t.resourceName || t.authorName) && (
                        <Paragraph style={styles.translationMeta}>
                          {t.resourceName}
                          {t.authorName ? ` — ${t.authorName}` : ''}
                        </Paragraph>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.actions}>
              <Button
                mode="outlined"
                icon="play"
                onPress={handlePlayReference}
                style={styles.actionButton}>
                Play Reference
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.recordingCard, {backgroundColor: currentTheme.colors.surface}]}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Record Your Recitation</Title>
            
            {isRecording ? (
              <View style={styles.recordingContainer}>
                <ActivityIndicator size="large" color={currentTheme.colors.error} />
                <Paragraph style={styles.recordingText}>Recording...</Paragraph>
                <Button
                  mode="contained"
                  buttonColor={currentTheme.colors.error}
                  onPress={handleStopRecording}
                  style={styles.stopButton}>
                  Stop Recording
                </Button>
              </View>
            ) : (
              <Button
                mode="contained"
                icon="microphone"
                onPress={handleStartRecording}
                disabled={isAnalyzing}
                style={styles.recordButton}>
                {isAnalyzing ? 'Analyzing...' : 'Start Recording'}
              </Button>
            )}

            {isAnalyzing && (
              <View style={styles.analyzingContainer}>
                <ActivityIndicator size="small" />
                <Paragraph style={styles.analyzingText}>Analyzing your recitation...</Paragraph>
              </View>
            )}
          </Card.Content>
        </Card>

        {feedback && (
          <Card style={[styles.feedbackCard, {backgroundColor: currentTheme.colors.surface}]}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Feedback</Title>
              
              <View style={styles.accuracyContainer}>
                <Paragraph style={styles.accuracyLabel}>Overall Accuracy</Paragraph>
                <View style={[styles.accuracyCircle, {borderColor: accuracyColor}]}>
                  <Text style={[styles.accuracyScore, {color: accuracyColor}]}>
                    {Math.round(feedback.overallAccuracy)}%
                  </Text>
                </View>
              </View>

              {feedback.tajweedScore !== undefined && (
                <View style={styles.tajweedContainer}>
                  <Paragraph style={styles.tajweedLabel}>Tajweed Score</Paragraph>
                  <Paragraph style={styles.tajweedScore}>
                    {Math.round(feedback.tajweedScore)}%
                  </Paragraph>
                </View>
              )}

              {feedback.commonIssues && feedback.commonIssues.length > 0 && (
                <View style={styles.issuesContainer}>
                  <Paragraph style={styles.issuesTitle}>Areas to Improve:</Paragraph>
                  {feedback.commonIssues.map((issue, index) => (
                    <View key={index} style={styles.issueItem}>
                      <Paragraph style={styles.issueText}>• {issue}</Paragraph>
                    </View>
                  ))}
                </View>
              )}

              {feedback.words && feedback.words.length > 0 && (
                <View style={styles.wordsContainer}>
                  <Paragraph style={styles.wordsTitle}>Word-by-Word Analysis:</Paragraph>
                  {feedback.words.map((word, index) => (
                    <View
                      key={index}
                      style={[
                        styles.wordItem,
                        word.needsWork && styles.wordItemNeedsWork,
                      ]}>
                      <Text style={styles.wordArabic}>{word.arabicText}</Text>
                      <Paragraph style={styles.wordAccuracy}>
                        {Math.round(word.accuracy)}%
                      </Paragraph>
                    </View>
                  ))}
                </View>
              )}
            </Card.Content>
          </Card>
        )}
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
    textAlign: 'center',
    color: '#F44336',
  },
  retryButton: {
    marginTop: spacing.sm,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body1,
    opacity: 0.7,
  },
  ayahCard: {
    marginBottom: spacing.md,
    elevation: 2,
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
  },
  translation: {
    ...typography.body1,
    textAlign: 'center',
    opacity: 0.8,
    fontStyle: 'italic',
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
  },
  translationError: {
    ...typography.body2,
    color: '#F44336',
    marginTop: spacing.xs,
  },
  transliteration: {
    ...typography.body1,
    textAlign: 'center',
    opacity: 0.7,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    fontStyle: 'italic',
    color: '#666',
  },
  actions: {
    marginTop: spacing.sm,
  },
  actionButton: {
    marginTop: spacing.xs,
  },
  recordingCard: {
    marginBottom: spacing.md,
    elevation: 2,
  },
  sectionTitle: {
    ...typography.h5,
    marginBottom: spacing.md,
  },
  recordingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  recordingText: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
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
  },
  feedbackCard: {
    marginBottom: spacing.md,
    elevation: 2,
  },
  accuracyContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  accuracyLabel: {
    ...typography.body1,
    marginBottom: spacing.sm,
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
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  tajweedLabel: {
    ...typography.body2,
    marginBottom: spacing.xs,
  },
  tajweedScore: {
    ...typography.h4,
    fontWeight: 'bold',
  },
  issuesContainer: {
    marginTop: spacing.md,
  },
  issuesTitle: {
    ...typography.body1,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  issueItem: {
    marginBottom: spacing.xs,
  },
  issueText: {
    ...typography.body2,
  },
  wordsContainer: {
    marginTop: spacing.md,
  },
  wordsTitle: {
    ...typography.body1,
    fontWeight: '600',
    marginBottom: spacing.sm,
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
    backgroundColor: '#FFF3E0',
  },
  wordArabic: {
    ...typography.body1,
    fontFamily: 'Amiri',
    flex: 1,
  },
  wordAccuracy: {
    ...typography.body2,
    fontWeight: '600',
  },
});

