/**
 * Profile Screen
 *
 * User profile, settings, achievements, and subscription management.
 */

import React from 'react';
import {View, Text, StyleSheet, ScrollView, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Card, Title, Paragraph, List, Switch, Button, Avatar, Divider} from 'react-native-paper';
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
} from '@components';
import {spacing, typography, colors, elevation} from '@constants/theme';
import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';

export const ProfileScreen: React.FC = () => {
  const {currentTheme, isDark, toggleTheme} = useTheme();
  const {user, logout} = useAuth();
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
        contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: currentTheme.colors.text}]}>
            Profile
          </Text>
        </View>

        {/* User Info Card */}
        <Card style={[styles.card, elevation[2]]}>
          <Card.Content style={styles.userCardContent}>
            <Avatar.Text
              size={80}
              label={getInitials(user?.displayName, user?.email)}
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Text style={[styles.userName, {color: currentTheme.colors.text}]}>
                {user?.displayName || 'User'}
              </Text>
              <Text style={[styles.userEmail, {color: currentTheme.colors.text}]}>
                {user?.email}
              </Text>
              <View style={styles.subscriptionBadge}>
                <Text
                  style={[
                    styles.subscriptionText,
                    {color: currentTheme.colors.primary},
                  ]}>
                  {user?.subscriptionTier === 'premium' ? '⭐ Premium' : 'Free'}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Stats Card */}
        {progress && (
          <Card style={[styles.card, elevation[2]]}>
            <Card.Content>
              <Title>Your Progress</Title>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, {color: currentTheme.colors.primary}]}>
                    {progress.currentStreak}
                  </Text>
                  <Text style={[styles.statLabel, {color: currentTheme.colors.text}]}>
                    Day Streak
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, {color: currentTheme.colors.secondary}]}>
                    {progress.achievements}
                  </Text>
                  <Text style={[styles.statLabel, {color: currentTheme.colors.text}]}>
                    Achievements
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, {color: colors.accent.bold}]}>
                    {progress.prayersCompleted}/{progress.totalPrayers}
                  </Text>
                  <Text style={[styles.statLabel, {color: currentTheme.colors.text}]}>
                    Today
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
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
        <Card style={[styles.card, elevation[2]]}>
          <Card.Content>
            <Title>Settings</Title>
            <List.Item
              title="Dark Mode"
              description="Toggle dark theme"
              left={props => <List.Icon {...props} icon="theme-light-dark" />}
              right={() => (
                <Switch value={isDark} onValueChange={toggleTheme} />
              )}
            />
            <Divider />
            <List.Item
              title="Notifications"
              description="Enable prayer time notifications"
              left={props => <List.Icon {...props} icon="bell" />}
              right={() => <Switch value={true} onValueChange={() => {}} />}
            />
            <Divider />
            <List.Item
              title="Azan Notifications"
              description="Play Azan at prayer times"
              left={props => <List.Icon {...props} icon="volume-high" />}
              right={() => <Switch value={true} onValueChange={() => {}} />}
            />
            <Divider />
            <List.Item
              title="Edit Profile"
              description="Update your profile information"
              left={props => <List.Icon {...props} icon="account-edit" />}
              onPress={() => {
                // TODO: Navigate to edit profile screen
                Alert.alert('Coming Soon', 'Profile editing will be available soon.');
              }}
            />
          </Card.Content>
        </Card>

        {/* Account Actions */}
        <Card style={[styles.card, elevation[2]]}>
          <Card.Content>
            <Title>Account</Title>
            <Button
              mode="outlined"
              onPress={() => {
                (navigation as any).navigate('Settings');
              }}
              icon="cog"
              style={styles.actionButton}>
              App Settings
            </Button>
            <Button
              mode="outlined"
              onPress={handleLogout}
              icon="logout"
              style={styles.actionButton}
              textColor={colors.error.main}>
              Sign Out
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
    marginBottom: spacing.xs,
  },
  card: {
    marginBottom: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface.main,
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  avatar: {
    marginRight: spacing.md,
    backgroundColor: colors.primary.main,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.h5,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.body2,
    opacity: 0.7,
    marginBottom: spacing.sm,
  },
  subscriptionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    backgroundColor: colors.primary.light + '20',
  },
  subscriptionText: {
    ...typography.caption,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h4,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    opacity: 0.7,
  },
  actionButton: {
    marginTop: spacing.sm,
  },
});

