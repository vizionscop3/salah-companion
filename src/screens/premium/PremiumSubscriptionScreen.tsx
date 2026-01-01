/**
 * Premium Subscription Screen
 *
 * Screen for users to sign up for premium subscription.
 * Premium subscription is required to create an account and save progress to cloud.
 */

import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography, colors, borderRadius, brutalistShadows} from '@constants/theme';
import {useNavigation} from '@react-navigation/native';
import {NeubrutalButton} from '@components/NeubrutalButton';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAuth} from '@context/AuthContext';
import {LoginScreen} from '@screens/auth/LoginScreen';
import {RegisterScreen} from '@screens/auth/RegisterScreen';

export const PremiumSubscriptionScreen: React.FC = () => {
  const {currentTheme} = useTheme();
  const navigation = useNavigation();
  const {isAuthenticated} = useAuth();
  const [showLogin, setShowLogin] = React.useState(false);

  if (showLogin) {
    return <LoginScreen />;
  }

  if (isAuthenticated) {
    // User is already authenticated, show success
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <MaterialCommunityIcons
            name="check-circle"
            size={64}
            color={colors.success.main}
          />
          <Text style={styles.title}>Premium Active!</Text>
          <Text style={styles.subtitle}>
            Your progress is now being saved to your account.
          </Text>
          <NeubrutalButton
            title="Continue"
            onPress={() => navigation.goBack()}
            variant="primary"
            size="large"
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="crown"
            size={48}
            color={colors.primary.main}
          />
          <Text style={styles.title}>Upgrade to Premium</Text>
          <Text style={styles.subtitle}>
            Create an account to save your progress and access premium features
          </Text>
        </View>

        <View style={styles.featuresList}>
          <View style={styles.featureCard}>
            <MaterialCommunityIcons
              name="cloud-upload"
              size={32}
              color={colors.primary.main}
            />
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Cloud Sync</Text>
              <Text style={styles.featureDescription}>
                Your progress is saved to the cloud and synced across all devices
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <MaterialCommunityIcons
              name="backup-restore"
              size={32}
              color={colors.primary.main}
            />
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Progress Backup</Text>
              <Text style={styles.featureDescription}>
                Never lose your progress - automatic backups keep your data safe
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <MaterialCommunityIcons
              name="chart-line"
              size={32}
              color={colors.primary.main}
            />
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Advanced Analytics</Text>
              <Text style={styles.featureDescription}>
                Detailed insights into your prayer habits and learning progress
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <MaterialCommunityIcons
              name="account-group"
              size={32}
              color={colors.primary.main}
            />
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Social Features</Text>
              <Text style={styles.featureDescription}>
                Compete on leaderboards and share achievements with friends
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <MaterialCommunityIcons
            name="information"
            size={24}
            color={colors.primary.main}
          />
          <Text style={styles.infoText}>
            Your current progress will be migrated to your account when you sign up.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <NeubrutalButton
          title="Create Account"
          onPress={() => (navigation as any).navigate('Register')}
          variant="primary"
          size="large"
          style={styles.button}
        />
        <NeubrutalButton
          title="Already have an account? Sign In"
          onPress={() => (navigation as any).navigate('Login')}
          variant="secondary"
          size="medium"
          style={styles.button}
        />
      </View>
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
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresList: {
    gap: spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface.secondary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    borderColor: colors.primary.main,
    ...brutalistShadows.medium,
    gap: spacing.md,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    ...typography.h5,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    fontFamily: 'Poppins',
  },
  featureDescription: {
    ...typography.body2,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface.tertiary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primary.main,
    gap: spacing.sm,
  },
  infoText: {
    ...typography.body2,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.surface.secondary,
    borderTopWidth: 3,
    borderTopColor: colors.primary.main,
  },
  button: {
    width: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
});

