/**
 * Arabic Pronunciation Academy Screen
 *
 * Interactive learning module for Arabic letter pronunciation.
 */

import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Dimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Card, Button, Chip, ProgressBar} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {useAuth} from '@context/AuthContext';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {spacing, typography, colors, elevation} from '@constants/theme';
import {
  ARABIC_LETTERS,
  getLettersByCategory,
  getUserPronunciationProgress,
  playLetterAudio,
  recordLetterPractice,
  getLetterProgress,
  type LetterCategory,
  type ArabicLetter,
} from '@services/pronunciation/pronunciationService';

const {width} = Dimensions.get('window');

const LETTER_CATEGORIES: Record<LetterCategory, {label: string; color: string}> = {
  familiar: {label: 'Familiar Sounds', color: colors.success.main},
  modified: {label: 'Modified Sounds', color: colors.warning.main},
  unique: {label: 'Unique Sounds', color: colors.primary.main},
  emphatic: {label: 'Emphatic Letters', color: colors.secondary.main},
};

export const PronunciationAcademyScreen: React.FC = () => {
  const {currentTheme} = useTheme();
  const {user} = useAuth();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [selectedCategory, setSelectedCategory] = useState<LetterCategory | 'all'>('all');
  const [selectedLetter, setSelectedLetter] = useState<ArabicLetter | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState({lettersLearned: 0, totalLetters: ARABIC_LETTERS.length});
  const [letterProgress, setLetterProgress] = useState<Record<string, {isLearned: boolean; timesPracticed: number}>>({});

  React.useEffect(() => {
    if (user) {
      getUserPronunciationProgress(user.id).then(setProgress);
      
      // Load progress for all letters
      Promise.all(
        ARABIC_LETTERS.map(async letter => {
          const letterProg = await getLetterProgress(user.id, letter.id);
          const simplified = letterProg 
            ? {isLearned: letterProg.isLearned, timesPracticed: letterProg.timesPracticed}
            : {isLearned: false, timesPracticed: 0};
          return [letter.id, simplified] as [string, {isLearned: boolean; timesPracticed: number}];
        })
      ).then((results) => {
        const progressMap: Record<string, {isLearned: boolean; timesPracticed: number}> = {};
        results.forEach(([letterId, prog]) => {
          progressMap[letterId] = prog;
        });
        setLetterProgress(progressMap);
      });
    }
  }, [user]);

  const filteredLetters =
    selectedCategory === 'all'
      ? ARABIC_LETTERS
      : getLettersByCategory(selectedCategory);

  const handlePlayAudio = async (letter: ArabicLetter) => {
    if (playing) return;
    
    setPlaying(true);
    try {
      await playLetterAudio(letter.id, 80);
      // Record practice when audio is played
      if (user) {
        await recordLetterPractice(user.id, letter.id);
      }
    } catch (error) {
      console.error('Error playing letter audio:', error);
    } finally {
      setPlaying(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: currentTheme.colors.text}]}>
            Arabic Pronunciation Academy
          </Text>
          <Text style={[styles.subtitle, {color: currentTheme.colors.text}]}>
            Master Arabic letters and sounds
          </Text>
        </View>

        {/* Category Filter */}
        <View style={styles.categoryContainer}>
          <Chip
            selected={selectedCategory === 'all'}
            onPress={() => setSelectedCategory('all')}
            style={styles.categoryChip}>
            All
          </Chip>
          {Object.entries(LETTER_CATEGORIES).map(([key, value]) => (
            <Chip
              key={key}
              selected={selectedCategory === key}
              onPress={() => setSelectedCategory(key as LetterCategory)}
              style={styles.categoryChip}
              selectedColor={value.color}>
              {value.label}
            </Chip>
          ))}
        </View>

        {/* Letters Grid */}
        <View style={styles.lettersGrid}>
          {filteredLetters.map(letter => {
            const letterProg = letterProgress[letter.id] || {isLearned: false, timesPracticed: 0};
            return (
              <Card
                key={letter.id}
                style={[
                  styles.letterCard,
                  elevation[2],
                  letterProg.isLearned && {borderWidth: 2, borderColor: colors.success.main},
                ]}
                onPress={() => setSelectedLetter(letter)}>
                <Card.Content style={styles.letterCardContent}>
                  {letterProg.isLearned && (
                    <View style={styles.learnedBadge}>
                      <Text style={styles.learnedBadgeText}>✓</Text>
                    </View>
                  )}
                  <Text style={styles.letterArabic}>{letter.arabic}</Text>
                  <Text style={[styles.letterName, {color: currentTheme.colors.text}]}>
                    {letter.name}
                  </Text>
                  <Text style={[styles.letterTrans, {color: currentTheme.colors.text}]}>
                    {letter.transliteration}
                  </Text>
                  <View
                    style={[
                      styles.categoryBadge,
                      {backgroundColor: LETTER_CATEGORIES[letter.category].color + '20'},
                    ]}>
                    <Text
                      style={[
                        styles.categoryText,
                        {color: LETTER_CATEGORIES[letter.category].color},
                      ]}>
                      {LETTER_CATEGORIES[letter.category].label}
                    </Text>
                  </View>
                  {letterProg.timesPracticed > 0 && (
                    <Text style={[styles.practiceCount, {color: currentTheme.colors.text}]}>
                      Practiced: {letterProg.timesPracticed}x
                    </Text>
                  )}
                </Card.Content>
              </Card>
            );
          })}
        </View>

        {/* Letter Detail Modal */}
        {selectedLetter && (
          <Card style={[styles.detailCard, elevation[4]]}>
            <Card.Content>
              <View style={styles.detailHeader}>
                <Text style={styles.detailArabic}>{selectedLetter.arabic}</Text>
                <View>
                  <Text style={[styles.detailName, {color: currentTheme.colors.text}]}>
                    {selectedLetter.name}
                  </Text>
                  <Text style={[styles.detailTrans, {color: currentTheme.colors.text}]}>
                    {selectedLetter.transliteration}
                  </Text>
                </View>
              </View>

              <Text style={[styles.detailDescription, {color: currentTheme.colors.text}]}>
                {selectedLetter.description}
              </Text>

              {selectedLetter.tonguePlacement && (
                <View style={styles.detailSection}>
                  <Text style={[styles.detailLabel, {color: currentTheme.colors.text}]}>
                    Tongue Placement:
                  </Text>
                  <Text style={[styles.detailValue, {color: currentTheme.colors.text}]}>
                    {selectedLetter.tonguePlacement}
                  </Text>
                </View>
              )}

              {selectedLetter.similarSound && (
                <View style={styles.detailSection}>
                  <Text style={[styles.detailLabel, {color: currentTheme.colors.text}]}>
                    Similar Sound:
                  </Text>
                  <Text style={[styles.detailValue, {color: currentTheme.colors.text}]}>
                    {selectedLetter.similarSound}
                  </Text>
                </View>
              )}

              <Button
                mode="contained"
                onPress={() => handlePlayAudio(selectedLetter)}
                loading={playing}
                icon="play"
                style={styles.playButton}>
                Play Audio
              </Button>

              <Button
                mode="outlined"
                onPress={() => {
                  if (selectedLetter) {
                    const letterId = selectedLetter.id;
                    setSelectedLetter(null);
                    navigation.navigate('LetterPractice', {letterId});
                  }
                }}
                icon="microphone"
                style={styles.practiceButton}>
                Practice
              </Button>

              <Button
                mode="text"
                onPress={() => setSelectedLetter(null)}
                style={styles.closeButton}>
                Close
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Progress Indicator */}
        <Card style={[styles.progressCard, elevation[2]]}>
          <Card.Content>
            <Text style={[styles.progressTitle, {color: currentTheme.colors.text}]}>
              Your Progress
            </Text>
            <ProgressBar
              progress={progress.totalLetters > 0 ? progress.lettersLearned / progress.totalLetters : 0}
              color={currentTheme.colors.primary}
            />
            <Text style={[styles.progressText, {color: currentTheme.colors.text}]}>
              {progress.lettersLearned} of {progress.totalLetters} letters learned
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.paper,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body1,
    opacity: 0.7,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  categoryChip: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  lettersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  letterCard: {
    width: (width - spacing.md * 3) / 2,
    marginBottom: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface.main,
  },
  letterCardContent: {
    alignItems: 'center',
    padding: spacing.md,
  },
  letterArabic: {
    fontSize: 48,
    fontFamily: 'Amiri',
    marginBottom: spacing.sm,
  },
  letterName: {
    ...typography.h6,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  letterTrans: {
    ...typography.body2,
    opacity: 0.7,
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  categoryText: {
    ...typography.caption,
    fontWeight: '600',
  },
  detailCard: {
    marginBottom: spacing.lg,
    borderRadius: 12,
    backgroundColor: colors.surface.main,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  detailArabic: {
    fontSize: 64,
    fontFamily: 'Amiri',
    marginRight: spacing.md,
  },
  detailName: {
    ...typography.h4,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  detailTrans: {
    ...typography.h6,
    opacity: 0.7,
  },
  detailDescription: {
    ...typography.body1,
    marginBottom: spacing.md,
    lineHeight: 24,
  },
  detailSection: {
    marginBottom: spacing.md,
  },
  detailLabel: {
    ...typography.body2,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  detailValue: {
    ...typography.body1,
    opacity: 0.8,
  },
  playButton: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  closeButton: {
    marginTop: spacing.xs,
  },
  progressCard: {
    marginTop: spacing.lg,
    borderRadius: 12,
    backgroundColor: colors.surface.main,
  },
  progressTitle: {
    ...typography.h6,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  progressText: {
    ...typography.body2,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  learnedBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.success.main,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  learnedBadgeText: {
    color: colors.surface.main,
    fontSize: 14,
    fontWeight: 'bold',
  },
  practiceCount: {
    ...typography.caption,
    marginTop: spacing.xs,
    opacity: 0.6,
  },
  practiceButton: {
    marginTop: spacing.md,
  },
});

