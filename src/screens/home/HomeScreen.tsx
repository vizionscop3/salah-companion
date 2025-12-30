/**
 * Home Screen - Material Neubrutomorphism
 *
 * Main landing screen with Material Neubrutomorphism design.
 * Shows prayer times, quick actions, and progress.
 */

import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography, colors} from '@constants/theme';
import {usePrayerTimes} from '@hooks/usePrayerTimes';
import {formatPrayerTime} from '@services/prayer/prayerTimeService';
import {useNavigation} from '@react-navigation/native';
import {
  QiblaCompass,
  ProgressCard,
  RecentAchievements,
  AchievementUnlockModal,
  NeubrutalCard,
  NeubrutalButton,
  NotificationList,
  AnimatedCard,
  FadeInView,
} from '@components/index';
import {useProgress} from '@hooks/useProgress';
import {useAuth} from '@context/AuthContext';
import {useAchievements} from '@hooks/useAchievements';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

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
  const [activeTab, setActiveTab] = useState<'home' | 'notifications'>('home');

  useEffect(() => {
    if (user?.id && progress) {
      checkForNewAchievements().then((newlyUnlocked) => {
        if (newlyUnlocked.length > 0) {
          setUnlockedAchievement(newlyUnlocked[0]);
          setShowUnlockModal(true);
        }
      });
    }
  }, [user?.id, progress, checkForNewAchievements]);

  const renderContent = () => {
    if (activeTab === 'notifications') {
      return <NotificationList />;
    }

    return (
      <>
        <View style={styles.header}>
          <Text style={styles.greeting}>As-salamu alaykum</Text>
          <Text style={styles.subtitle}>Welcome to Salah Companion</Text>
        </View>

        {nextPrayer && prayerTimes && (
          <AnimatedCard
            index={0}
            style={styles.nextPrayerCard}
            shadowSize="medium"
            accessibilityRole="summary"
            accessibilityLabel={`Next prayer is ${nextPrayer.prayer} at ${formatPrayerTime(nextPrayer.time)}`}>
            <View style={styles.nextPrayerContent}>
              <Text style={styles.nextPrayerLabel}>Next Prayer</Text>
              <Text style={styles.nextPrayerName}>
                {nextPrayer.prayer.charAt(0).toUpperCase() + nextPrayer.prayer.slice(1)}
              </Text>
              <Text style={styles.nextPrayerTime}>{formatPrayerTime(nextPrayer.time)}</Text>
              <Text style={styles.nextPrayerRemaining}>
                {Math.floor(
                  (nextPrayer.time.getTime() - new Date().getTime()) / (1000 * 60),
                )}{' '}
                minutes remaining
              </Text>
            </View>
          </AnimatedCard>
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

        {/* Phase 3 Quick Actions */}
        <AnimatedCard
          index={2}
          style={styles.phase3ActionsCard}
          shadowSize="medium"
          accessibilityRole="region"
          accessibilityLabel="Advanced features">
          <Text style={styles.phase3ActionsTitle}>Advanced Features</Text>
          <View style={styles.phase3ActionsList}>
            <NeubrutalButton
              title="Leaderboards"
              onPress={() => (navigation as any).navigate('Leaderboard')}
              size="small"
              variant="outline"
              style={styles.phase3ActionButton}
            />
            <NeubrutalButton
              title="Memorization"
              onPress={() => (navigation as any).navigate('Memorization')}
              size="small"
              variant="outline"
              style={styles.phase3ActionButton}
            />
            <NeubrutalButton
              title="Ramadan Mode"
              onPress={() => (navigation as any).navigate('Ramadan')}
              size="small"
              variant="outline"
              style={styles.phase3ActionButton}
            />
          </View>
        </AnimatedCard>

        <QiblaCompass showDistance={true} />

        <NeubrutalCard style={styles.quickActionsCard} shadowSize="medium">
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActionsList}>
            <NeubrutalButton
              title="Start Guided Prayer"
              onPress={() => (navigation as any).navigate('GuidedSalah', {prayer: 'fajr'})}
              size="medium"
              variant="primary"
              style={styles.actionButton}
            />
            <NeubrutalButton
              title="Practice Recitation"
              onPress={() => (navigation as any).navigate('Learning')}
              size="medium"
              variant="secondary"
              style={styles.actionButton}
            />
            <NeubrutalButton
              title="Learn Arabic"
              onPress={() => (navigation as any).navigate('Learning')}
              size="medium"
              variant="outline"
              style={styles.actionButton}
            />
          </View>
        </NeubrutalCard>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Tabs */}
      <View style={styles.headerContainer}>
        <View style={styles.locationHeader}>
          <MaterialCommunityIcons name="map-marker" size={20} color={colors.primary.main} />
          <Text style={styles.locationText}>Al-aksa</Text>
        </View>
        <View style={styles.headerActions}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'home' && styles.tabActive,
              ]}
              onPress={() => setActiveTab('home')}>
              <MaterialCommunityIcons
                name="home"
                size={20}
                color={activeTab === 'home' ? colors.background.default : colors.text.secondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'notifications' && styles.tabActive,
              ]}
              onPress={() => setActiveTab('notifications')}>
              <MaterialCommunityIcons
                name="bell"
                size={20}
                color={activeTab === 'notifications' ? colors.background.default : colors.text.secondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {renderContent()}
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
    backgroundColor: colors.background.default,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface.secondary,
    borderBottomWidth: 3,
    borderBottomColor: colors.primary.main,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  locationText: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: 'Poppins',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  tab: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.surface.tertiary,
    borderWidth: 2,
    borderColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary.main,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.h2,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    fontFamily: 'Poppins',
  },
  subtitle: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  nextPrayerCard: {
    padding: spacing.lg,
    backgroundColor: colors.surface.secondary,
    borderColor: colors.primary.main,
  },
  nextPrayerContent: {
    gap: spacing.xs,
  },
  nextPrayerLabel: {
    ...typography.body2,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  nextPrayerName: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.primary.main,
    fontFamily: 'Poppins',
  },
  nextPrayerTime: {
    ...typography.h5,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: 'Poppins',
  },
  nextPrayerRemaining: {
    ...typography.body2,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  quickActionsCard: {
    padding: spacing.md,
  },
  quickActionsTitle: {
    ...typography.h5,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontFamily: 'Poppins',
  },
  quickActionsList: {
    gap: spacing.sm,
  },
  actionButton: {
    width: '100%',
  },
  phase3ActionsCard: {
    padding: spacing.md,
    marginTop: spacing.md,
  },
  phase3ActionsTitle: {
    ...typography.h5,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  phase3ActionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  phase3ActionButton: {
    flex: 1,
    minWidth: '30%',
  },
});
