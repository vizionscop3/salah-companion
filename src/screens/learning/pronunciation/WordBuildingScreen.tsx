/**
 * Word Building Screen
 *
 * Progressive word building from Arabic letters with syllable-by-syllable practice.
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Card, Title, Paragraph, Button, ProgressBar, Chip} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {useAuth} from '@context/AuthContext';
import {spacing, typography, colors} from '@constants/theme';
import {islamicShadows, islamicBorderRadius} from '@constants/islamicTheme';
import {
  PRACTICE_WORDS,
  Word,
  getUserWordProgress,
  recordWordPractice,
  canPracticeWord,
  getWordsByDifficulty,
} from '@services/pronunciation/wordBuildingService';
import {LoadingState, ErrorState} from '@components/index';

export const WordBuildingScreen: React.FC = () => {
  const {currentTheme} = useTheme();
  const {user} = useAuth();
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    'beginner' | 'intermediate' | 'advanced'
  >('beginner');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [practicing, setPracticing] = useState(false);

  useEffect(() => {
    loadProgress();
  }, [user]);

  const loadProgress = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const progressData = await getUserWordProgress(user.id);
      setProgress(progressData);
    } catch (error) {
      console.error('Error loading word progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWordSelect = async (word: Word) => {
    if (!user?.id) return;

    const canPractice = await canPracticeWord(user.id, word);
    if (!canPractice) {
      // Show message that user needs to learn more letters first
      return;
    }

    setSelectedWord(word);
  };

  const handlePractice = async () => {
    if (!selectedWord || !user?.id) return;

    setPracticing(true);
    // Simulate practice session
    // In production, this would record audio and analyze
    setTimeout(async () => {
      const accuracy = Math.floor(Math.random() * 30) + 70; // 70-100%
      await recordWordPractice(user.id, selectedWord.id, accuracy);
      await loadProgress();
      setPracticing(false);
      setSelectedWord(null);
    }, 2000);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingState message="Loading word building progress..." />
      </SafeAreaView>
    );
  }

  const words = getWordsByDifficulty(selectedDifficulty);
  const difficultyProgress = progress?.difficultyProgress || {
    beginner: 0,
    intermediate: 0,
    advanced: 0,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: currentTheme.colors.text}]}>
            Word Building
          </Text>
          <Text style={[styles.subtitle, {color: currentTheme.colors.text}]}>
            Build words from letters you've learned
          </Text>
        </View>

        {/* Progress Overview */}
        {progress && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Your Progress</Title>
              <View style={styles.progressRow}>
                <Text style={[styles.progressLabel, {color: currentTheme.colors.text}]}>
                  Words Practiced: {progress.wordsPracticed} / {progress.totalWords}
                </Text>
                <Text style={[styles.progressLabel, {color: currentTheme.colors.text}]}>
                  Words Mastered: {progress.wordsMastered}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Difficulty Selector */}
        <View style={styles.difficultyContainer}>
          {(['beginner', 'intermediate', 'advanced'] as const).map(difficulty => (
            <TouchableOpacity
              key={difficulty}
              onPress={() => setSelectedDifficulty(difficulty)}
              style={[
                styles.difficultyChip,
                selectedDifficulty === difficulty && styles.difficultyChipSelected,
              ]}>
              <Text
                style={[
                  styles.difficultyText,
                  selectedDifficulty === difficulty && styles.difficultyTextSelected,
                  {color: currentTheme.colors.text},
                ]}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </Text>
              <ProgressBar
                progress={difficultyProgress[difficulty]}
                color={colors.primary.main}
                style={styles.difficultyProgress}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Words List */}
        <View style={styles.wordsContainer}>
          {words.map(word => (
            <TouchableOpacity
              key={word.id}
              onPress={() => handleWordSelect(word)}
              style={styles.wordCard}>
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.wordHeader}>
                    <View style={styles.wordArabic}>
                      <Text style={[styles.arabicText, {color: colors.primary.main}]}>
                        {word.arabic}
                      </Text>
                      <Text style={[styles.transliteration, {color: currentTheme.colors.text}]}>
                        {word.transliteration}
                      </Text>
                    </View>
                    <Chip
                      icon="book-open-page-variant"
                      style={styles.categoryChip}
                      textStyle={styles.categoryChipText}>
                      {word.category}
                    </Chip>
                  </View>
                  <Text style={[styles.translation, {color: currentTheme.colors.text}]}>
                    {word.translation}
                  </Text>
                  <View style={styles.syllablesContainer}>
                    {word.syllables.map((syllable, index) => (
                      <View key={index} style={styles.syllable}>
                        <Text style={[styles.syllableArabic, {color: colors.primary.main}]}>
                          {syllable.arabic}
                        </Text>
                        <Text
                          style={[styles.syllableTranslit, {color: currentTheme.colors.text}]}>
                          {syllable.transliteration}
                        </Text>
                      </View>
                    ))}
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Practice Modal */}
        {selectedWord && (
          <View style={styles.modalOverlay}>
            <Card style={styles.modalCard}>
              <Card.Content>
                <Title>Practice: {selectedWord.transliteration}</Title>
                <View style={styles.practiceWordContainer}>
                  <Text style={[styles.practiceArabic, {color: colors.primary.main}]}>
                    {selectedWord.arabic}
                  </Text>
                  <Text style={[styles.practiceTranslit, {color: currentTheme.colors.text}]}>
                    {selectedWord.transliteration}
                  </Text>
                  <Text style={[styles.practiceTranslation, {color: currentTheme.colors.text}]}>
                    {selectedWord.translation}
                  </Text>
                </View>
                {practicing ? (
                  <ActivityIndicator size="large" color={colors.primary.main} />
                ) : (
                  <Button
                    mode="contained"
                    onPress={handlePractice}
                    style={styles.practiceButton}>
                    Start Practice
                  </Button>
                )}
                <Button
                  mode="outlined"
                  onPress={() => setSelectedWord(null)}
                  style={styles.cancelButton}>
                  Cancel
                </Button>
              </Card.Content>
            </Card>
          </View>
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
  card: {
    marginBottom: spacing.md,
    ...islamicShadows.medium,
    borderRadius: islamicBorderRadius.large,
    backgroundColor: colors.surface.secondary,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  progressLabel: {
    ...typography.body2,
  },
  difficultyContainer: {
    marginBottom: spacing.md,
  },
  difficultyChip: {
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderRadius: islamicBorderRadius.medium,
    backgroundColor: colors.surface.secondary,
    borderWidth: 2,
    borderColor: colors.border.primary,
  },
  difficultyChipSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + '20',
  },
  difficultyText: {
    ...typography.body1,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  difficultyTextSelected: {
    color: colors.primary.main,
  },
  difficultyProgress: {
    height: 4,
    borderRadius: 2,
  },
  wordsContainer: {
    marginBottom: spacing.lg,
  },
  wordCard: {
    marginBottom: spacing.md,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  wordArabic: {
    flex: 1,
  },
  arabicText: {
    ...typography.h4,
    fontSize: 32,
    textAlign: 'right',
    marginBottom: spacing.xs,
  },
  transliteration: {
    ...typography.body1,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  translation: {
    ...typography.body1,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  categoryChip: {
    height: 28,
  },
  categoryChipText: {
    fontSize: 12,
  },
  syllablesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  syllable: {
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
    padding: spacing.xs,
    borderRadius: 8,
    backgroundColor: colors.primary.main + '10',
  },
  syllableArabic: {
    ...typography.body1,
    fontSize: 20,
    textAlign: 'center',
  },
  syllableTranslit: {
    ...typography.caption,
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '90%',
    maxWidth: 400,
    ...islamicShadows.large,
    borderRadius: islamicBorderRadius.large,
    backgroundColor: colors.surface.secondary,
  },
  practiceWordContainer: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  practiceArabic: {
    ...typography.h2,
    fontSize: 48,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  practiceTranslit: {
    ...typography.h4,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  practiceTranslation: {
    ...typography.body1,
    opacity: 0.8,
  },
  practiceButton: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  cancelButton: {
    marginTop: spacing.xs,
  },
});

