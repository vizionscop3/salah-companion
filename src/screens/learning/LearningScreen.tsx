/**
 * Learning Screen - Material Neubrutomorphism
 *
 * Access to learning modules: Arabic Pronunciation, Recitation Practice, etc.
 * Includes progress tracking for each learning module.
 */

import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography, colors, borderRadius, brutalistShadows} from '@constants/theme';
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
import {NeubrutalCard, NeubrutalButton, AnimatedCard} from '@components/index';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

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

  const handleModulePress = (module: LearningModule) => {
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
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading learning modules...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Learning Center</Text>
          <Text style={styles.subtitle}>Build understanding and connection</Text>
        </View>

        {modules.map((module, index) => (
          <AnimatedCard
            key={index}
            index={index}
            style={styles.moduleCard}
            shadowSize="medium">
            <View style={styles.moduleContent}>
              {/* Module Header with Icon */}
              <View style={styles.moduleHeader}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name={module.icon || 'book-open-variant'}
                    size={32}
                    color={colors.primary.main}
                  />
                </View>
                <View style={styles.moduleHeaderText}>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  <Text style={styles.moduleDescription}>{module.description}</Text>
                </View>
              </View>

              {/* Progress Section */}
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressPercentage}>
                    {Math.round(module.progress * 100)}%
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {width: `${module.progress * 100}%`},
                      ]}
                    />
                  </View>
                </View>
              </View>

              {/* Action Button */}
              <NeubrutalButton
                title={module.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                onPress={() => handleModulePress(module)}
                variant="primary"
                size="medium"
                style={styles.actionButton}
                icon={
                  <MaterialCommunityIcons
                    name={module.progress > 0 ? 'play-circle' : 'play'}
                    size={20}
                    color={colors.background.default}
                  />
                }
              />
            </View>
          </AnimatedCard>
        ))}
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
    gap: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body1,
    color: colors.text.secondary,
    fontFamily: 'Poppins',
  },
  header: {
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h2,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    fontFamily: 'Poppins',
  },
  subtitle: {
    ...typography.body1,
    color: colors.text.secondary,
    fontFamily: 'Poppins',
  },
  moduleCard: {
    padding: spacing.lg,
    backgroundColor: colors.surface.secondary,
    borderColor: colors.primary.main,
    borderWidth: 3,
    borderRadius: borderRadius.lg,
  },
  moduleContent: {
    gap: spacing.md,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface.tertiary,
    borderWidth: 2,
    borderColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...brutalistShadows.small,
  },
  moduleHeaderText: {
    flex: 1,
    gap: spacing.xs,
  },
  moduleTitle: {
    ...typography.h5,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: 'Poppins',
  },
  moduleDescription: {
    ...typography.body2,
    color: colors.text.secondary,
    fontFamily: 'Poppins',
    lineHeight: 20,
  },
  progressSection: {
    gap: spacing.xs,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    ...typography.body2,
    color: colors.text.secondary,
    fontFamily: 'Poppins',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressPercentage: {
    ...typography.h5,
    fontWeight: '700',
    color: colors.primary.main,
    fontFamily: 'Poppins',
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: colors.surface.tertiary,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.surface.tertiary,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.sm,
  },
  actionButton: {
    marginTop: spacing.xs,
  },
});
