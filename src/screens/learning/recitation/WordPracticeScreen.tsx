/**
 * Word-by-Word Practice Screen
 * 
 * Practice individual words with detailed feedback.
 */

import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ProgressBar, ActivityIndicator} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography, colors} from '@constants/theme';
import {NeubrutalCard, NeubrutalButton} from '@components/index';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAuth} from '@context/AuthContext';
import {recordingService} from '@services/recitation/recordingService';
import {
  saveRecitationPractice,
  analyzeRecitation,
  type WordFeedback,
} from '@services/recitation/recitationService';
import {
  getAyah,
  splitAyahIntoWords,
  getAyahTransliteration,
} from '@services/recitation/quranicTextService';
import {
  playQuranicAudio,
  playWordAudio,
  isWordAudioCachedFile,
} from '@services/audio/quranicAudioService';
import {audioService} from '@services/audio/audioService';

interface WordPracticeScreenProps {
  route: {
    params?: {
      surahNumber?: number;
      ayahNumber?: number;
      wordIndex?: number;
    };
  };
}

export const WordPracticeScreen: React.FC<WordPracticeScreenProps> = ({route}) => {
  const {currentTheme} = useTheme();
  const {user} = useAuth();
  const {surahNumber = 1, ayahNumber = 1, wordIndex = 0} = route.params || {};

  const [currentWordIndex, setCurrentWordIndex] = useState(wordIndex);
  const [words, setWords] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<WordFeedback | null>(null);
  const [recordingPath, setRecordingPath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ayahText, setAyahText] = useState('');
  const [ayahTransliteration, setAyahTransliteration] = useState<string>('');

  useEffect(() => {
    loadAyah();
    audioService.initialize();
    recordingService.requestPermissions();

    return () => {
      recordingService.cleanup();
    };
  }, [surahNumber, ayahNumber]);

  const loadAyah = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const [ayah, transliteration] = await Promise.all([
        getAyah(surahNumber, ayahNumber),
        getAyahTransliteration(surahNumber, ayahNumber).catch(() => ''),
      ]);
      setAyahText(ayah.text);
      setAyahTransliteration(transliteration);
      const wordList = splitAyahIntoWords(ayah.text);
      setWords(wordList.map(w => w.text));
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

  const currentWord = words[currentWordIndex] || '';

  const handlePlayReference = async () => {
    try {
      // First, try to play word-level audio from Hugging Face dataset
      try {
        const isCached = await isWordAudioCachedFile(surahNumber, ayahNumber, currentWordIndex);
        if (isCached || currentWordIndex >= 0) {
          await playWordAudio(surahNumber, ayahNumber, currentWordIndex, 80);
          return;
        }
      } catch (wordError) {
        console.warn('Word-level audio not available, playing full ayah:', wordError);
      }
      
      // Fallback: Play the word in context (play the full ayah)
      await playQuranicAudio(surahNumber, ayahNumber, 'alafasy', 80);
    } catch (error) {
      console.error('Error playing reference:', error);
    }
  };

  const handleStartRecording = async () => {
    try {
      const fileName = `word_${surahNumber}_${ayahNumber}_${currentWordIndex}_${Date.now()}.m4a`;
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
      setRecordingPath(path);
      setIsRecording(false);
      setIsAnalyzing(true);

      // Analyze recording
      const analysis = await analyzeRecitation(
        path,
        currentWord,
        'word',
        surahNumber,
        ayahNumber,
      );
      // When mode is 'word', feedback is WordFeedback[]
      const wordFeedback = (analysis.feedback as WordFeedback[])[0];
      if (wordFeedback) {
        setFeedback(wordFeedback);
      }

      // Save practice session
      if (user) {
        await saveRecitationPractice(user.id, {
          surahId: surahNumber.toString(),
          ayahId: ayahNumber.toString(),
          practiceMode: 'word',
          audioRecordingUrl: path,
          accuracyScore: analysis.accuracyScore,
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

  const handleNextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setFeedback(null);
      setRecordingPath(null);
    }
  };

  const handlePreviousWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
      setFeedback(null);
      setRecordingPath(null);
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

  if (loadError && words.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{loadError}</Text>
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

  const progress = words.length > 0 ? (currentWordIndex + 1) / words.length : 0;
  const accuracyColor = feedback
    ? feedback.accuracy >= 90
      ? '#4CAF50'
      : feedback.accuracy >= 70
      ? '#FF9800'
      : '#F44336'
    : undefined;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Word-by-Word Practice</Text>
          <Text style={styles.subtitle}>
            Surah {surahNumber}, Ayah {ayahNumber}
          </Text>
          <ProgressBar progress={progress} color={colors.primary.main} style={styles.progressBar} />
          <Text style={styles.progressText}>
            Word {currentWordIndex + 1} of {words.length}
          </Text>
        </View>

        <NeubrutalCard style={styles.wordCard} shadowSize="large">
          <View style={styles.wordContainer}>
            <Text style={styles.arabicWord}>{currentWord}</Text>
            {ayahTransliteration && (
              <Text style={styles.transliteration}>
                {ayahTransliteration}
              </Text>
            )}
            <Text style={styles.wordContext}>
              From: {ayahText}
            </Text>
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
                <Text style={styles.accuracyLabel}>Accuracy Score</Text>
                <View style={[styles.accuracyCircle, {borderColor: accuracyColor}]}>
                  <Text style={[styles.accuracyScore, {color: accuracyColor}]}>
                    {Math.round(feedback.accuracy)}%
                  </Text>
                </View>
              </View>

              {feedback.needsWork && (
                <View style={styles.needsWorkContainer}>
                  <Text style={styles.needsWorkText}>
                    ⚠️ This word needs more practice
                  </Text>
                </View>
              )}

              {feedback.phonemes && feedback.phonemes.length > 0 && (
                <View style={styles.phonemesContainer}>
                  <Text style={styles.phonemesTitle}>Phoneme Analysis:</Text>
                  {feedback.phonemes.map((phoneme, index) => (
                    <View key={index} style={styles.phonemeItem}>
                      <Text style={styles.phonemeText}>
                        {phoneme.phoneme}: {Math.round(phoneme.accuracy)}%
                        {phoneme.issue && ` - ${phoneme.issue}`}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
          </NeubrutalCard>
        )}

        <View style={styles.navigation}>
          <NeubrutalButton
            title="Previous"
            onPress={handlePreviousWord}
            variant="outline"
            size="medium"
            disabled={currentWordIndex === 0}
            style={styles.navButton}
          />
          <NeubrutalButton
            title="Next Word"
            onPress={handleNextWord}
            variant="primary"
            size="medium"
            disabled={currentWordIndex >= words.length - 1}
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
    marginTop: spacing.md,
    color: colors.text.primary,
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
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  progressText: {
    ...typography.body2,
    textAlign: 'center',
    color: colors.text.secondary,
  },
  wordCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface.secondary,
    borderColor: colors.primary.main,
  },
  wordContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  arabicWord: {
    ...typography.h2,
    fontFamily: 'Amiri',
    textAlign: 'center',
    marginBottom: spacing.sm,
    color: colors.text.primary,
    lineHeight: 48,
  },
  transliteration: {
    ...typography.body1,
    textAlign: 'center',
    opacity: 0.7,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
    color: colors.text.secondary,
  },
  wordContext: {
    ...typography.body2,
    textAlign: 'center',
    opacity: 0.6,
    fontFamily: 'Amiri',
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
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accuracyScore: {
    ...typography.h3,
    fontWeight: 'bold',
  },
  needsWorkContainer: {
    backgroundColor: colors.warning.light + '20',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.warning.main,
  },
  needsWorkText: {
    ...typography.body2,
    color: colors.warning.main,
    fontWeight: '600',
  },
  phonemesContainer: {
    marginTop: spacing.md,
  },
  phonemesTitle: {
    ...typography.body1,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  phonemeItem: {
    marginBottom: spacing.xs,
  },
  phonemeText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  navButton: {
    flex: 1,
  },
});

