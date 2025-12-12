/**
 * Profile Screen
 *
 * User profile, settings, achievements, and subscription management.
 */

import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Card, Title, Paragraph, List, Switch} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography} from '@constants/theme';

export const ProfileScreen: React.FC = () => {
  const {currentTheme, isDark, toggleTheme} = useTheme();

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

        <Card style={styles.card}>
          <Card.Content>
            <Title>Account</Title>
            <Paragraph>Email: user@example.com</Paragraph>
            <Paragraph>Subscription: Free</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Settings</Title>
            <List.Item
              title="Dark Mode"
              right={() => (
                <Switch value={isDark} onValueChange={toggleTheme} />
              )}
            />
            <List.Item
              title="Notifications"
              right={() => <Switch value={true} onValueChange={() => {}} />}
            />
            <List.Item
              title="Azan Notifications"
              right={() => <Switch value={true} onValueChange={() => {}} />}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Achievements</Title>
            <Paragraph>7 Days of Light - Unlocked</Paragraph>
            <Paragraph>The Opening - In Progress</Paragraph>
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
  title: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  card: {
    marginBottom: spacing.md,
    elevation: 2,
  },
});

