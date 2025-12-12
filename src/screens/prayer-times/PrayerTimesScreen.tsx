/**
 * Prayer Times Screen
 *
 * Displays all prayer times for the day with visual timeline.
 */

import React from 'react';
import {View, Text, StyleSheet, ScrollView, RefreshControl} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Card, Title, Paragraph, Button, ActivityIndicator} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography} from '@constants/theme';
import {formatPrayerTime} from '@services/prayer/prayerTimeService';
import {usePrayerTimes} from '@hooks/usePrayerTimes';

const PRAYER_RAKAHS: Record<string, number> = {
  fajr: 2,
  dhuhr: 4,
  asr: 4,
  maghrib: 3,
  isha: 4,
};

export const PrayerTimesScreen: React.FC = () => {
  const {currentTheme} = useTheme();
  const {prayerTimes, nextPrayer, loading, error, refresh} = usePrayerTimes();

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.colors.primary} />
          <Text style={[styles.loadingText, {color: currentTheme.colors.text}]}>
            Calculating prayer times...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, {color: currentTheme.colors.error}]}>
            {error}
          </Text>
          <Button mode="contained" onPress={refresh} style={styles.retryButton}>
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!prayerTimes) {
    return null;
  }

  const prayers = [
    {name: 'Fajr', key: 'fajr' as const, time: prayerTimes.fajr},
    {name: 'Dhuhr', key: 'dhuhr' as const, time: prayerTimes.dhuhr},
    {name: 'Asr', key: 'asr' as const, time: prayerTimes.asr},
    {name: 'Maghrib', key: 'maghrib' as const, time: prayerTimes.maghrib},
    {name: 'Isha', key: 'isha' as const, time: prayerTimes.isha},
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }>
        <View style={styles.header}>
          <Text style={[styles.title, {color: currentTheme.colors.text}]}>
            Prayer Times
          </Text>
          <Text style={[styles.subtitle, {color: currentTheme.colors.text}]}>
            Today • 15 Muharram 1446
          </Text>
        </View>

        {nextPrayer && (
          <Card style={[styles.card, styles.nextPrayerCard]}>
            <Card.Content>
              <Title>Next Prayer</Title>
              <Paragraph>
                {nextPrayer.prayer.charAt(0).toUpperCase() + nextPrayer.prayer.slice(1)} -{' '}
                {formatPrayerTime(nextPrayer.time)}
              </Paragraph>
            </Card.Content>
          </Card>
        )}

        {prayers.map((prayer, index) => (
          <Card key={index} style={styles.card}>
            <Card.Content>
              <View style={styles.prayerRow}>
                <View style={styles.prayerInfo}>
                  <Title>{prayer.name}</Title>
                  <Paragraph>{PRAYER_RAKAHS[prayer.key]} Rak'ahs</Paragraph>
                </View>
                <Text style={[styles.time, {color: currentTheme.colors.primary}]}>
                  {formatPrayerTime(prayer.time)}
                </Text>
              </View>
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
    elevation: 2,
  },
  nextPrayerCard: {
    backgroundColor: '#E3F2FD',
    marginBottom: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body1,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    ...typography.body1,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    marginTop: spacing.md,
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prayerInfo: {
    flex: 1,
  },
  time: {
    ...typography.h5,
    fontWeight: '600',
  },
});

