/**
 * Recitation Practice Screen
 * 
 * Main entry point for recitation practice with mode selection.
 */

import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography} from '@constants/theme';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

type PracticeMode = 'word' | 'ayah' | 'surah';

interface PracticeModeOption {
  mode: PracticeMode;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: string;
}

const PRACTICE_MODES: PracticeModeOption[] = [
  {
    mode: 'word',
    title: 'Word-by-Word',
    description: 'Practice individual words with detailed feedback on pronunciation',
    difficulty: 'Beginner',
    icon: '📝',
  },
  {
    mode: 'ayah',
    title: 'Ayah Mode',
    description: 'Practice complete verses with word-level analysis',
    difficulty: 'Intermediate',
    icon: '📖',
  },
  {
    mode: 'surah',
    title: 'Full Surah',
    description: 'Practice entire surahs with comprehensive feedback',
    difficulty: 'Advanced',
    icon: '📚',
  },
];

export const RecitationPracticeScreen: React.FC = () => {
  const {currentTheme} = useTheme();
  const navigation = useNavigation<StackNavigationProp<any>>();

  const handleSelectMode = (mode: PracticeMode) => {
    if (mode === 'word') {
      navigation.navigate('WordPractice', {
        surahNumber: 1,
        ayahNumber: 1,
        wordIndex: 0,
      });
    } else if (mode === 'ayah') {
      navigation.navigate('AyahPractice', {
        surahNumber: 1,
        ayahNumber: 1,
      });
    } else {
      // Surah mode
      navigation.navigate('SurahPractice', {
        surahNumber: 1, // Default to Al-Fatiha, can be made selectable
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Title style={styles.title}>Recitation Practice</Title>
          <Paragraph style={styles.subtitle}>
            Choose a practice mode to improve your Quranic recitation
          </Paragraph>
        </View>

        {PRACTICE_MODES.map(mode => (
          <Card
            key={mode.mode}
            style={[styles.modeCard, {backgroundColor: currentTheme.colors.surface}]}
            onPress={() => handleSelectMode(mode.mode)}>
            <Card.Content>
              <View style={styles.modeHeader}>
                <View style={styles.modeIconContainer}>
                  <Title style={styles.modeIcon}>{mode.icon}</Title>
                </View>
                <View style={styles.modeInfo}>
                  <View style={styles.modeTitleRow}>
                    <Title style={styles.modeTitle}>{mode.title}</Title>
                    <Chip
                      style={[
                        styles.difficultyChip,
                        {
                          backgroundColor:
                            mode.difficulty === 'Beginner'
                              ? '#4CAF50'
                              : mode.difficulty === 'Intermediate'
                              ? '#FF9800'
                              : '#F44336',
                        },
                      ]}
                      textStyle={styles.difficultyText}>
                      {mode.difficulty}
                    </Chip>
                  </View>
                  <Paragraph style={styles.modeDescription}>
                    {mode.description}
                  </Paragraph>
                </View>
              </View>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => handleSelectMode(mode.mode)}
                style={styles.startButton}>
                Start Practice
              </Button>
            </Card.Actions>
          </Card>
        ))}

        <Card style={[styles.infoCard, {backgroundColor: currentTheme.colors.surface}]}>
          <Card.Content>
            <Title style={styles.infoTitle}>💡 Tips for Better Practice</Title>
            <Paragraph style={styles.infoText}>
              • Find a quiet place to practice{'\n'}
              • Listen to the reference audio carefully{'\n'}
              • Record yourself and compare{'\n'}
              • Practice regularly for best results{'\n'}
              • Focus on accuracy before speed
            </Paragraph>
          </Card.Content>
        </Card>
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
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body1,
    opacity: 0.7,
  },
  modeCard: {
    marginBottom: spacing.md,
    elevation: 2,
  },
  modeHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  modeIconContainer: {
    marginRight: spacing.md,
  },
  modeIcon: {
    fontSize: 48,
  },
  modeInfo: {
    flex: 1,
  },
  modeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
  },
  modeTitle: {
    ...typography.h4,
    marginRight: spacing.sm,
    marginBottom: 0,
  },
  difficultyChip: {
    height: 24,
  },
  difficultyText: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  modeDescription: {
    ...typography.body2,
    opacity: 0.8,
  },
  startButton: {
    marginTop: spacing.sm,
  },
  infoCard: {
    marginTop: spacing.md,
    elevation: 1,
  },
  infoTitle: {
    ...typography.h5,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.body2,
    lineHeight: 24,
  },
});

