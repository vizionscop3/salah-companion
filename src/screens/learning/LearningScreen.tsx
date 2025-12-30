/**
 * Learning Screen
 *
 * Access to learning modules: Arabic Pronunciation, Recitation Practice, etc.
 * Includes progress tracking for each learning module.
 */

import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Card, Title, Paragraph, Button, ProgressBar} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography} from '@constants/theme';
import {islamicShadows, islamicBorderRadius} from '@constants/islamicTheme';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '@context/AuthContext';
import {
  getUserPronunciationProgress,
} from '@services/pronunciation/pronunciationService';
import {
  getRecitationSummary,
} from '@services/progress/recitationAnalyticsService';
import {getTodayProgress} from '@services/progress/progressService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LearningModule {
  title: string;
  description: string;
  progress: number;
  type: string;
  icon?: string;
}

export const LearningScreen: React.FC = () => {
  const {currentTheme} = useTheme();
  const navigation = useNavigation();
  const {user} = useAuth();
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModuleProgress();
  }, [user]);

  const loadModuleProgress = async () => {
    if (!user?.id) {
      setModules(getDefaultModules());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [pronunciationProgress, recitationSummary, prayerProgress] = await Promise.all([
        getUserPronunciationProgress(user.id).catch(() => ({
          lettersLearned: 0,
          totalLetters: 28,
        })),
        getRecitationSummary(user.id).catch(() => ({
          totalPractices: 0,
          surahsPracticed: 0,
        })),
        getTodayProgress(user.id).catch(() => ({
          prayersCompleted: 0,
        })),
      ]);

      // Check if user has completed Azan education
      const azanCompleted = await AsyncStorage.getItem(
        `@salah_companion:azan_education_completed:${user.id}`,
      );

      // Check if user has viewed surah library
      const surahLibraryViewed = await AsyncStorage.getItem(
        `@salah_companion:surah_library_viewed:${user.id}`,
      );

      const updatedModules: LearningModule[] = [
        {
          title: 'Guided Prayer',
          description: 'Step-by-step guidance through each prayer',
          progress: Math.min((prayerProgress.prayersCompleted || 0) / 5, 1),
          type: 'guided',
          icon: 'hand-prayer',
        },
        {
          title: 'Arabic Pronunciation Academy',
          description: 'Learn Arabic letters and sounds systematically',
          progress: pronunciationProgress.lettersLearned / pronunciationProgress.totalLetters,
          type: 'pronunciation',
          icon: 'alphabetical',
        },
        {
          title: 'Recitation Practice',
          description: 'Practice recitation with AI-powered feedback',
          progress: Math.min((recitationSummary.totalPractices || 0) / 10, 1),
          type: 'recitation',
          icon: 'microphone',
        },
        {
          title: 'Surah Library',
          description: 'Explore surahs with translations and audio (Juz Amma - 37 surahs)',
          progress: surahLibraryViewed ? 0.1 : 0,
          type: 'surah',
          icon: 'book-open-page-variant',
        },
        {
          title: 'Azan Education',
          description: 'Learn the meaning and response to Azan',
          progress: azanCompleted ? 1 : 0,
          type: 'azan',
          icon: 'volume-high',
        },
        {
          title: 'Holiday Education',
          description: 'Learn about Islamic holidays and their significance',
          progress: 0,
          type: 'holiday',
          icon: 'calendar-star',
        },
        {
          title: 'Word Building',
          description: "Build words from letters you've learned",
          progress: 0,
          type: 'word_building',
          icon: 'alphabetical-variant',
        },
        {
          title: 'Tajweed Rules',
          description: 'Learn proper Quranic recitation rules',
          progress: 0,
          type: 'tajweed',
          icon: 'book-open-variant',
        },
        {
          title: 'Memorization',
          description: 'Track your Quran memorization with spaced repetition',
          progress: 0,
          type: 'memorization',
          icon: 'brain',
        },
      ];

      setModules(updatedModules);
    } catch (error) {
      console.error('Error loading module progress:', error);
      setModules(getDefaultModules());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultModules = (): LearningModule[] => [
    {
      title: 'Guided Prayer',
      description: 'Step-by-step guidance through each prayer',
      progress: 0,
      type: 'guided',
      icon: 'hand-prayer',
    },
    {
      title: 'Arabic Pronunciation Academy',
      description: 'Learn Arabic letters and sounds systematically',
      progress: 0,
      type: 'pronunciation',
      icon: 'alphabetical',
    },
    {
      title: 'Recitation Practice',
      description: 'Practice recitation with AI-powered feedback',
      progress: 0,
      type: 'recitation',
      icon: 'microphone',
    },
    {
      title: 'Surah Library',
      description: 'Explore surahs with translations and audio (Juz Amma - 37 surahs)',
      progress: 0,
      type: 'surah',
      icon: 'book-open-page-variant',
    },
    {
      title: 'Azan Education',
      description: 'Learn the meaning and response to Azan',
      progress: 0,
      type: 'azan',
      icon: 'volume-high',
    },
    {
      title: 'Holiday Education',
      description: 'Learn about Islamic holidays and their significance',
      progress: 0,
      type: 'holiday',
      icon: 'calendar-star',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: currentTheme.colors.text}]}>
            Learning Center
          </Text>
          <Text style={[styles.subtitle, {color: currentTheme.colors.text}]}>
            Build understanding and connection
          </Text>
        </View>

        {modules.map((module, index) => (
          <Card key={index} style={styles.card}>
            <Card.Content>
              <View style={styles.moduleHeader}>
                <Title style={styles.moduleTitle}>{module.title}</Title>
                <Text style={[styles.progressText, {color: currentTheme.colors.primary}]}>
                  {Math.round(module.progress * 100)}%
                </Text>
              </View>
              <Paragraph style={styles.moduleDescription}>{module.description}</Paragraph>
              
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <ProgressBar
                  progress={module.progress}
                  color={currentTheme.colors.primary}
                  style={styles.progressBar}
                />
              </View>

              <Button
                mode="contained"
                onPress={() => {
                  if (module.type === 'guided') {
                    (navigation as any).navigate('GuidedSalah', {
                      prayer: 'fajr',
                    });
                  } else if (module.type === 'pronunciation') {
                    (navigation as any).navigate('PronunciationAcademy');
                  } else if (module.type === 'recitation') {
                    (navigation as any).navigate('RecitationPractice');
                  } else if (module.type === 'surah') {
                    (navigation as any).navigate('SurahLibrary');
                    // Mark as viewed
                    if (user?.id) {
                      AsyncStorage.setItem(
                        `@salah_companion:surah_library_viewed:${user.id}`,
                        'true',
                      );
                    }
                  } else if (module.type === 'azan') {
                    (navigation as any).navigate('AzanEducation');
                  } else if (module.type === 'holiday') {
                    (navigation as any).navigate('HolidayEducation', {
                      holidayKey: 'ramadan',
                    });
                  } else if (module.type === 'word_building') {
                    (navigation as any).navigate('WordBuilding');
                  } else if (module.type === 'tajweed') {
                    (navigation as any).navigate('TajweedRules');
                  } else if (module.type === 'memorization') {
                    (navigation as any).navigate('Memorization');
                  } else {
                    console.log('Opening:', module.type);
                  }
                }}
                style={styles.button}
                contentStyle={styles.buttonContent}>
                {module.progress > 0 ? 'Continue Learning' : 'Start Learning'}
              </Button>
            </Card.Content>
          </Card>
        ))}
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
    ...typography.body2,
    opacity: 0.7,
  },
  card: {
    marginBottom: spacing.md,
    ...islamicShadows.medium,
    borderRadius: islamicBorderRadius.large,
    backgroundColor: '#FFFFFF',
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  moduleTitle: {
    flex: 1,
  },
  progressText: {
    ...typography.h4,
    fontWeight: '700',
  },
  moduleDescription: {
    marginBottom: spacing.sm,
    opacity: 0.8,
  },
  progressContainer: {
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  button: {
    marginTop: spacing.sm,
    borderRadius: islamicBorderRadius.medium,
  },
  buttonContent: {
    paddingVertical: spacing.xs,
  },
});

