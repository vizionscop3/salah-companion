/**
 * Ramadan Screen
 *
 * Ramadan mode with Tarawih tracking, fasting progress, and special features.
 */

import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Card, Title, Paragraph, Button, ProgressBar, Chip} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {useAuth} from '@context/AuthContext';
import {spacing, typography, colors} from '@constants/theme';
import {islamicShadows, islamicBorderRadius} from '@constants/islamicTheme';
import {
  isRamadan,
  getRamadanDay,
  getRamadanProgress,
  getRamadanStats,
  recordFast,
  recordTarawihSession,
  getTarawihSessions,
  updateQuranReading,
} from '@services/ramadan/ramadanService';
import {LoadingState} from '@components/index';

export const RamadanScreen: React.FC = () => {
  const {currentTheme} = useTheme();
  const {user} = useAuth();
  const [progress, setProgress] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [tarawihSessions, setTarawihSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTarawihModal, setShowTarawihModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [progressData, statsData, sessionsData] = await Promise.all([
        getRamadanProgress(user.id),
        getRamadanStats(user.id),
        getTarawihSessions(user.id),
      ]);
      setProgress(progressData);
      setStats(statsData);
      setTarawihSessions(sessionsData);
    } catch (error) {
      console.error('Error loading Ramadan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordFast = async () => {
    if (!user?.id) return;

    try {
      await recordFast(user.id);
      await loadData();
    } catch (error) {
      console.error('Error recording fast:', error);
    }
  };

  const handleRecordTarawih = async (rakats: number = 8) => {
    if (!user?.id) return;

    try {
      await recordTarawihSession(user.id, rakats);
      await loadData();
      setShowTarawihModal(false);
    } catch (error) {
      console.error('Error recording Tarawih:', error);
    }
  };

  if (!isRamadan()) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Ramadan Mode</Title>
            <Paragraph>
              Ramadan mode will be available during the holy month of Ramadan.
            </Paragraph>
          </Card.Content>
        </Card>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingState message="Loading Ramadan progress..." />
      </SafeAreaView>
    );
  }

  const day = getRamadanDay();
  const completionPercentage = stats?.completionPercentage || 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: colors.accent.gold}]}>
            رمضان مبارك
          </Text>
          <Text style={[styles.subtitle, {color: currentTheme.colors.text}]}>
            Ramadan Mubarak - Day {day} of {progress?.totalDays || 30}
          </Text>
        </View>

        {/* Progress Overview */}
        {progress && (
          <Card style={[styles.card, styles.progressCard]}>
            <Card.Content>
              <Title>Fasting Progress</Title>
              <ProgressBar
                progress={completionPercentage / 100}
                color={colors.accent.gold}
                style={styles.progressBar}
              />
              <View style={styles.progressStats}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, {color: colors.accent.gold}]}>
                    {stats?.fastsCompleted || 0}
                  </Text>
                  <Text style={[styles.statLabel, {color: currentTheme.colors.text}]}>
                    Fasts Completed
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, {color: colors.primary.main}]}>
                    {stats?.tarawihSessions || 0}
                  </Text>
                  <Text style={[styles.statLabel, {color: currentTheme.colors.text}]}>
                    Tarawih Sessions
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, {color: colors.success.main}]}>
                    {stats?.quranRead || 0}
                  </Text>
                  <Text style={[styles.statLabel, {color: currentTheme.colors.text}]}>
                    Pages Read
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Button
            mode="contained"
            onPress={handleRecordFast}
            style={[styles.actionButton, {backgroundColor: colors.accent.gold}]}
            contentStyle={styles.actionButtonContent}>
            Record Fast
          </Button>
          <Button
            mode="contained"
            onPress={() => setShowTarawihModal(true)}
            style={[styles.actionButton, {backgroundColor: colors.primary.main}]}
            contentStyle={styles.actionButtonContent}>
            Record Tarawih
          </Button>
        </View>

        {/* Tarawih Sessions */}
        {tarawihSessions.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Recent Tarawih Sessions</Title>
              {tarawihSessions.slice(0, 5).map(session => (
                <View key={session.id} style={styles.tarawihItem}>
                  <View>
                    <Text style={[styles.tarawihDate, {color: currentTheme.colors.text}]}>
                      {new Date(session.date).toLocaleDateString()}
                    </Text>
                    <Text style={[styles.tarawihRakats, {color: currentTheme.colors.text}]}>
                      {session.rakats} Rak'ahs
                    </Text>
                  </View>
                  <Chip icon="check-circle" style={styles.completedChip}>
                    Completed
                  </Chip>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Tarawih Modal */}
        {showTarawihModal && (
          <View style={styles.modalOverlay}>
            <Card style={styles.modalCard}>
              <Card.Content>
                <Title>Record Tarawih Session</Title>
                <Paragraph>How many rak'ahs did you perform?</Paragraph>
                <View style={styles.rakatsContainer}>
                  {[8, 20].map(rakats => (
                    <Button
                      key={rakats}
                      mode="outlined"
                      onPress={() => handleRecordTarawih(rakats)}
                      style={styles.rakatsButton}>
                      {rakats} Rak'ahs
                    </Button>
                  ))}
                </View>
                <Button
                  mode="text"
                  onPress={() => setShowTarawihModal(false)}
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
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    fontSize: 36,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body1,
    textAlign: 'center',
    opacity: 0.7,
  },
  card: {
    marginBottom: spacing.md,
    ...islamicShadows.medium,
    borderRadius: islamicBorderRadius.large,
    backgroundColor: colors.surface.secondary,
  },
  progressCard: {
    borderWidth: 2,
    borderColor: colors.accent.gold,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    marginVertical: spacing.md,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    opacity: 0.7,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    borderRadius: islamicBorderRadius.medium,
  },
  actionButtonContent: {
    paddingVertical: spacing.sm,
  },
  tarawihItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.background.paper,
    borderRadius: 8,
  },
  tarawihDate: {
    ...typography.body1,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  tarawihRakats: {
    ...typography.body2,
    opacity: 0.7,
  },
  completedChip: {
    height: 28,
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
  rakatsContainer: {
    flexDirection: 'row',
    marginVertical: spacing.md,
    gap: spacing.sm,
  },
  rakatsButton: {
    flex: 1,
  },
  cancelButton: {
    marginTop: spacing.sm,
  },
});

