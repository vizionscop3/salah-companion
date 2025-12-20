/**
 * Word-by-Word Practice Screen
 * 
 * Practice individual words with detailed feedback.
 */

import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ProgressBar,
  ActivityIndicator,
} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography} from '@constants/theme';
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
      setFeedback(analysis.feedback[0] as WordFeedback);

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
          <ActivityIndicator size="large" />
          <Paragraph style={styles.loadingText}>Loading ayah...</Paragraph>
        </View>
      </SafeAreaView>
    );
  }

  if (loadError && words.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Paragraph style={styles.errorText}>{loadError}</Paragraph>
          <Button mode="contained" onPress={loadAyah} style={styles.retryButton}>
            Retry
          </Button>
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
          <Title style={styles.title}>Word-by-Word Practice</Title>
          <Paragraph style={styles.subtitle}>
            Surah {surahNumber}, Ayah {ayahNumber}
          </Paragraph>
          <ProgressBar progress={progress} color={currentTheme.colors.primary} style={styles.progressBar} />
          <Paragraph style={styles.progressText}>
            Word {currentWordIndex + 1} of {words.length}
          </Paragraph>
        </View>

        <Card style={[styles.wordCard, {backgroundColor: currentTheme.colors.surface}]}>
          <Card.Content>
            <View style={styles.wordContainer}>
              <Text style={styles.arabicWord}>{currentWord}</Text>
              {ayahTransliteration && (
                <Paragraph style={styles.transliteration}>
                  {ayahTransliteration}
                </Paragraph>
              )}
              <Paragraph style={styles.wordContext}>
                From: {ayahText}
              </Paragraph>
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
                <Paragraph style={styles.accuracyLabel}>Accuracy Score</Paragraph>
                <View style={[styles.accuracyCircle, {borderColor: accuracyColor}]}>
                  <Text style={[styles.accuracyScore, {color: accuracyColor}]}>
                    {Math.round(feedback.accuracy)}%
                  </Text>
                </View>
              </View>

              {feedback.needsWork && (
                <View style={styles.needsWorkContainer}>
                  <Paragraph style={styles.needsWorkText}>
                    ⚠️ This word needs more practice
                  </Paragraph>
                </View>
              )}

              {feedback.phonemes && feedback.phonemes.length > 0 && (
                <View style={styles.phonemesContainer}>
                  <Paragraph style={styles.phonemesTitle}>Phoneme Analysis:</Paragraph>
                  {feedback.phonemes.map((phoneme, index) => (
                    <View key={index} style={styles.phonemeItem}>
                      <Paragraph style={styles.phonemeText}>
                        {phoneme.phoneme}: {Math.round(phoneme.accuracy)}%
                        {phoneme.issue && ` - ${phoneme.issue}`}
                      </Paragraph>
                    </View>
                  ))}
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        <View style={styles.navigation}>
          <Button
            mode="outlined"
            onPress={handlePreviousWord}
            disabled={currentWordIndex === 0}
            style={styles.navButton}>
            Previous
          </Button>
          <Button
            mode="contained"
            onPress={handleNextWord}
            disabled={currentWordIndex >= words.length - 1}
            style={styles.navButton}>
            Next Word
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
  },
  wordCard: {
    marginBottom: spacing.md,
    elevation: 2,
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
  },
  transliteration: {
    ...typography.body1,
    textAlign: 'center',
    opacity: 0.7,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
    color: '#666',
  },
  wordContext: {
    ...typography.body2,
    textAlign: 'center',
    opacity: 0.6,
    fontFamily: 'Amiri',
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
    backgroundColor: '#FFF3E0',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  needsWorkText: {
    ...typography.body2,
    color: '#E65100',
  },
  phonemesContainer: {
    marginTop: spacing.md,
  },
  phonemesTitle: {
    ...typography.body1,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  phonemeItem: {
    marginBottom: spacing.xs,
  },
  phonemeText: {
    ...typography.body2,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  navButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});

