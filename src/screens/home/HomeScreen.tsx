/**
 * Home Screen
 *
 * Main landing screen showing prayer times, quick actions, and progress.
 */

import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Card, Title, Paragraph, Button} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography} from '@constants/theme';
import {usePrayerTimes} from '@hooks/usePrayerTimes';
import {formatPrayerTime} from '@services/prayer/prayerTimeService';
import {useNavigation} from '@react-navigation/native';
import {
  QiblaCompass,
  ProgressCard,
  RecentAchievements,
  AchievementUnlockModal,
} from '@components/index';
import {useProgress} from '@hooks/useProgress';
import {useAuth} from '@context/AuthContext';
import {useAchievements} from '@hooks/useAchievements';
import {useState, useEffect} from 'react';

export const HomeScreen: React.FC = () => {
  const {currentTheme} = useTheme();
  const navigation = useNavigation();
  const {prayerTimes, nextPrayer, loading} = usePrayerTimes();
  const {user} = useAuth();
  const {progress, loading: progressLoading} = useProgress(user?.id || null);
  const {
    unlockedAchievements,
    loading: achievementsLoading,
    checkForNewAchievements,
  } = useAchievements(user?.id || null);

  const [unlockedAchievement, setUnlockedAchievement] = useState<any>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // Check for new achievements when progress updates
  useEffect(() => {
    if (user?.id && progress) {
      checkForNewAchievements().then(newlyUnlocked => {
        if (newlyUnlocked.length > 0) {
          // Show unlock modal for the first newly unlocked achievement
          setUnlockedAchievement(newlyUnlocked[0]);
          setShowUnlockModal(true);
        }
      });
    }
  }, [user?.id, progress, checkForNewAchievements]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.greeting, {color: currentTheme.colors.text}]}>
            As-salamu alaykum
          </Text>
          <Text style={[styles.subtitle, {color: currentTheme.colors.text}]}>
            Welcome to Salah Companion
          </Text>
        </View>

        {nextPrayer && prayerTimes && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Next Prayer</Title>
              <Paragraph>
                {nextPrayer.prayer.charAt(0).toUpperCase() +
                  nextPrayer.prayer.slice(1)}{' '}
                - {formatPrayerTime(nextPrayer.time)}
              </Paragraph>
              <Paragraph>
                {Math.floor(
                  (nextPrayer.time.getTime() - new Date().getTime()) /
                    (1000 * 60),
                )}{' '}
                minutes remaining
              </Paragraph>
            </Card.Content>
          </Card>
        )}

        <ProgressCard
          prayersCompleted={progress?.prayersCompleted ?? 0}
          totalPrayers={progress?.totalPrayers ?? 5}
          currentStreak={progress?.currentStreak ?? 0}
          longestStreak={progress?.longestStreak ?? 0}
          achievements={progress?.achievements ?? 0}
          showDetails={true}
        />

        <RecentAchievements
          achievements={unlockedAchievements}
          loading={achievementsLoading}
          maxDisplay={3}
        />

        <QiblaCompass showDistance={true} />

        <Card style={styles.card}>
          <Card.Content>
            <Title>Quick Actions</Title>
            <Button
              mode="contained"
              onPress={() => (navigation as any).navigate('GuidedSalah', {prayer: 'fajr'})}
              style={styles.actionButton}
              contentStyle={styles.actionButtonContent}>
              Start Guided Prayer
            </Button>
            <Button
              mode="outlined"
              onPress={() => (navigation as any).navigate('Learning')}
              style={styles.actionButton}
              contentStyle={styles.actionButtonContent}>
              Practice Recitation
            </Button>
            <Button
              mode="outlined"
              onPress={() => (navigation as any).navigate('Learning')}
              style={styles.actionButton}
              contentStyle={styles.actionButtonContent}>
              Learn Arabic
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Achievement Unlock Modal */}
      <AchievementUnlockModal
        achievement={unlockedAchievement}
        visible={showUnlockModal}
        onDismiss={() => {
          setShowUnlockModal(false);
          setUnlockedAchievement(null);
        }}
      />
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
  greeting: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body1,
    opacity: 0.7,
  },
  card: {
    marginBottom: spacing.md,
    elevation: 2,
  },
  actionButton: {
    marginTop: spacing.sm,
  },
  actionButtonContent: {
    paddingVertical: spacing.xs,
  },
});

