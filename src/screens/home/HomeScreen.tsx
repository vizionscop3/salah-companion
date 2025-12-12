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

export const HomeScreen: React.FC = () => {
  const {currentTheme} = useTheme();
  const navigation = useNavigation();
  const {prayerTimes, nextPrayer, loading} = usePrayerTimes();

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

        <Card style={styles.card}>
          <Card.Content>
            <Title>Today's Progress</Title>
            <Paragraph>Prayers completed: 0/5</Paragraph>
            <Paragraph>Current streak: 0 days</Paragraph>
          </Card.Content>
        </Card>

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

