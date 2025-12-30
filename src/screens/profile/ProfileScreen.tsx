/**
 * Profile Screen - Material Neubrutomorphism
 *
 * User profile, settings, achievements, and subscription management.
 */

import React from 'react';
import {View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '@context/ThemeContext';
import {useAuth} from '@context/AuthContext';
import {useProgress} from '@hooks/useProgress';
import {useRecitationAnalytics} from '@hooks/useRecitationAnalytics';
import {usePronunciationAnalytics} from '@hooks/usePronunciationAnalytics';
import {useAchievements} from '@hooks/useAchievements';
import {
  RecitationStatsCard,
  PronunciationStatsCard,
  AchievementGrid,
  AchievementUnlockModal,
  NeubrutalCard,
  NeubrutalButton,
} from '@components/index';
import {spacing, typography, colors, borderRadius, brutalistShadows} from '@constants/theme';
import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export const ProfileScreen: React.FC = () => {
  const {currentTheme, isDark, toggleTheme} = useTheme();
  const {user, logout, isGuest} = useAuth();
  const {progress} = useProgress(user?.id || null);
  const {summary: recitationSummary, loading: recitationLoading} =
    useRecitationAnalytics(user?.id || null);
  const {summary: pronunciationSummary, loading: pronunciationLoading} =
    usePronunciationAnalytics(user?.id || null);
  const {
    achievements,
    loading: achievementsLoading,
    checkForNewAchievements,
  } = useAchievements(user?.id || null);
  const navigation = useNavigation();

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

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            // Navigation will be handled by AppNavigator
          },
        },
      ],
    );
  };

  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User Info Card */}
        <NeubrutalCard style={styles.userCard} shadowSize="medium">
          <View style={styles.userCardContent}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {isGuest ? 'G' : getInitials(user?.displayName, user?.email)}
                </Text>
              </View>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.displayName || (isGuest ? 'Guest User' : 'User')}
              </Text>
              <Text style={styles.userEmail}>
                {user?.email || (isGuest ? 'Progress saved locally' : '')}
              </Text>
              <View style={styles.subscriptionBadge}>
                <Text style={styles.subscriptionText}>
                  {isGuest
                    ? '👤 Guest Mode'
                    : user?.subscriptionTier === 'premium'
                    ? '⭐ Premium'
                    : 'Free'}
                </Text>
              </View>
            </View>
          </View>
        </NeubrutalCard>

        {/* Premium Upgrade Card for Guest Users */}
        {isGuest && (
          <NeubrutalCard style={styles.premiumCard} shadowSize="medium">
            <View style={styles.premiumContent}>
              <MaterialCommunityIcons
                name="crown"
                size={32}
                color={colors.accent.gold}
                style={styles.premiumIcon}
              />
              <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
              <Text style={styles.premiumDescription}>
                Create an account to save your progress to the cloud and access premium features.
              </Text>
              <NeubrutalButton
                title="Upgrade to Premium"
                onPress={() => {
                  (navigation as any).navigate('PremiumSubscription');
                }}
                variant="primary"
                size="medium"
                style={styles.premiumButton}
                icon={
                  <MaterialCommunityIcons
                    name="crown"
                    size={20}
                    color={colors.background.default}
                  />
                }
              />
            </View>
          </NeubrutalCard>
        )}

        {/* Stats Card */}
        {progress && (
          <NeubrutalCard style={styles.statsCard} shadowSize="medium">
            <View style={styles.statsContent}>
              <Text style={styles.statsTitle}>Your Progress</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{progress.currentStreak}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, {color: colors.secondary.main}]}>
                    {progress.achievements}
                  </Text>
                  <Text style={styles.statLabel}>Achievements</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, {color: colors.accent.gold}]}>
                    {progress.prayersCompleted}/{progress.totalPrayers}
                  </Text>
                  <Text style={styles.statLabel}>Today</Text>
                </View>
              </View>
            </View>
          </NeubrutalCard>
        )}

        {/* Recitation Analytics */}
        <RecitationStatsCard summary={recitationSummary} loading={recitationLoading} />

        {/* Pronunciation Analytics */}
        <PronunciationStatsCard
          summary={pronunciationSummary}
          loading={pronunciationLoading}
        />

        {/* Achievements */}
        <AchievementGrid achievements={achievements} loading={achievementsLoading} />

        {/* Settings Card */}
        <NeubrutalCard style={styles.settingsCard} shadowSize="medium">
          <View style={styles.settingsContent}>
            <Text style={styles.settingsTitle}>Settings</Text>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={toggleTheme}
              activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons
                  name="theme-light-dark"
                  size={24}
                  color={colors.primary.main}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Dark Mode</Text>
                  <Text style={styles.settingDescription}>Toggle dark theme</Text>
                </View>
              </View>
              <View style={[styles.switchContainer, isDark && styles.switchActive]}>
                <View style={[styles.switchThumb, isDark && styles.switchThumbActive]} />
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="bell" size={24} color={colors.primary.main} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Notifications</Text>
                  <Text style={styles.settingDescription}>Enable prayer time notifications</Text>
                </View>
              </View>
              <View style={[styles.switchContainer, styles.switchActive]}>
                <View style={[styles.switchThumb, styles.switchThumbActive]} />
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="volume-high" size={24} color={colors.primary.main} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Azan Notifications</Text>
                  <Text style={styles.settingDescription}>Play Azan at prayer times</Text>
                </View>
              </View>
              <View style={[styles.switchContainer, styles.switchActive]}>
                <View style={[styles.switchThumb, styles.switchThumbActive]} />
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                (navigation as any).navigate('EditProfile');
              }}
              activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons
                  name="account-edit"
                  size={24}
                  color={colors.primary.main}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Edit Profile</Text>
                  <Text style={styles.settingDescription}>Update your profile information</Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
          </View>
        </NeubrutalCard>

        {/* Account Actions */}
        <NeubrutalCard style={styles.accountCard} shadowSize="medium">
          <View style={styles.accountContent}>
            <Text style={styles.accountTitle}>Account</Text>
            <NeubrutalButton
              title="App Settings"
              onPress={() => {
                (navigation as any).navigate('Settings');
              }}
              variant="outline"
              size="medium"
              style={styles.actionButton}
              icon={
                <MaterialCommunityIcons name="cog" size={20} color={colors.primary.main} />
              }
            />
            {!isGuest && (
              <NeubrutalButton
                title="Sign Out"
                onPress={handleLogout}
                variant="outline"
                size="medium"
                style={[styles.actionButton, styles.logoutButton]}
                textStyle={styles.logoutButtonText}
                icon={
                  <MaterialCommunityIcons name="logout" size={20} color={colors.error.main} />
                }
              />
            )}
          </View>
        </NeubrutalCard>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h2,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: 'Poppins',
  },
  userCard: {
    padding: spacing.lg,
    backgroundColor: colors.surface.secondary,
    borderColor: colors.primary.main,
    borderWidth: 3,
    borderRadius: borderRadius.lg,
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarContainer: {
    width: 80,
    height: 80,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary.main,
    ...brutalistShadows.medium,
  },
  avatarText: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.background.default,
    fontFamily: 'Poppins',
  },
  userInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  userName: {
    ...typography.h5,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: 'Poppins',
  },
  userEmail: {
    ...typography.body2,
    color: colors.text.secondary,
    fontFamily: 'Poppins',
  },
  subscriptionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface.tertiary,
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  subscriptionText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary.main,
    fontFamily: 'Poppins',
  },
  premiumCard: {
    padding: spacing.lg,
    backgroundColor: colors.surface.secondary,
    borderColor: colors.accent.gold,
    borderWidth: 3,
    borderRadius: borderRadius.lg,
  },
  premiumContent: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  premiumIcon: {
    marginBottom: spacing.xs,
  },
  premiumTitle: {
    ...typography.h5,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  premiumDescription: {
    ...typography.body2,
    color: colors.text.secondary,
    fontFamily: 'Poppins',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  premiumButton: {
    width: '100%',
  },
  statsCard: {
    padding: spacing.lg,
    backgroundColor: colors.surface.secondary,
    borderColor: colors.primary.main,
    borderWidth: 3,
    borderRadius: borderRadius.lg,
  },
  statsContent: {
    gap: spacing.md,
  },
  statsTitle: {
    ...typography.h5,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: 'Poppins',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.sm,
  },
  statItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    ...typography.h4,
    fontWeight: '700',
    color: colors.primary.main,
    fontFamily: 'Poppins',
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontFamily: 'Poppins',
  },
  settingsCard: {
    padding: spacing.lg,
    backgroundColor: colors.surface.secondary,
    borderColor: colors.primary.main,
    borderWidth: 3,
    borderRadius: borderRadius.lg,
  },
  settingsContent: {
    gap: spacing.xs,
  },
  settingsTitle: {
    ...typography.h5,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    fontFamily: 'Poppins',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  settingText: {
    flex: 1,
    gap: spacing.xs,
  },
  settingTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: 'Poppins',
  },
  settingDescription: {
    ...typography.caption,
    color: colors.text.secondary,
    fontFamily: 'Poppins',
  },
  switchContainer: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface.tertiary,
    borderWidth: 2,
    borderColor: colors.surface.tertiary,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.text.secondary,
  },
  switchThumbActive: {
    backgroundColor: colors.background.default,
    alignSelf: 'flex-end',
  },
  divider: {
    height: 1,
    backgroundColor: colors.surface.tertiary,
    marginVertical: spacing.xs,
  },
  accountCard: {
    padding: spacing.lg,
    backgroundColor: colors.surface.secondary,
    borderColor: colors.primary.main,
    borderWidth: 3,
    borderRadius: borderRadius.lg,
  },
  accountContent: {
    gap: spacing.md,
  },
  accountTitle: {
    ...typography.h5,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: 'Poppins',
  },
  actionButton: {
    marginTop: spacing.sm,
  },
  logoutButton: {
    borderColor: colors.error.main,
  },
  logoutButtonText: {
    color: colors.error.main,
  },
});
