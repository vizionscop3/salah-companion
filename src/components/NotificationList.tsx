/**
 * Notification List Component - Material Neubrutomorphism
 *
 * Displays notifications with Material Neubrutomorphism design.
 */

import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {NeubrutalCard} from './index';
import {spacing, typography, colors, borderRadius, brutalistShadows} from '@constants/theme';

export interface Notification {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  time: string;
  read?: boolean;
}

export interface NotificationListProps {
  notifications?: Notification[];
  onNotificationPress?: (notification: Notification) => void;
}

const defaultNotifications: Notification[] = [
  {
    id: '1',
    icon: '✅',
    title: 'Congratulation',
    subtitle: "You Have Finished Today's Trainings",
    time: '12:15 Pm',
  },
  {
    id: '2',
    icon: '💌',
    title: 'Message From Ayesha',
    subtitle: "You Have Finished Today's Trainings",
    time: '12:15 Pm',
  },
  {
    id: '3',
    icon: '❌',
    title: 'Booking Cancel',
    subtitle: "You Have Finished Today's Trainings",
    time: '12:15 Pm',
  },
  {
    id: '4',
    icon: '💳',
    title: 'Payment',
    subtitle: "You Have Finished Today's Trainings",
    time: '12:15 Pm',
  },
  {
    id: '5',
    icon: '%',
    title: 'Promotion',
    subtitle: "You Have Finished Today's Trainings",
    time: '12:15 Pm',
  },
];

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications = defaultNotifications,
  onNotificationPress,
}) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Notifications</Text>
      <View style={styles.notificationsList}>
        {notifications.map((notif, index) => (
          <NeubrutalCard
            key={notif.id}
            style={styles.notificationItem}
            shadowSize="small"
            onPress={() => onNotificationPress?.(notif)}>
            <View style={styles.notificationContent}>
              <View style={styles.notifIcon}>
                <Text style={styles.notifIconText}>{notif.icon}</Text>
              </View>
              <View style={styles.notifInfo}>
                <Text style={styles.notifTitle}>{notif.title}</Text>
                <Text style={styles.notifSubtitle}>{notif.subtitle}</Text>
              </View>
              <Text style={styles.notifTime}>{notif.time}</Text>
            </View>
          </NeubrutalCard>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.text.primary,
    paddingHorizontal: spacing.xs,
    fontFamily: 'Poppins',
  },
  notificationsList: {
    gap: spacing.sm,
  },
  notificationItem: {
    padding: spacing.md,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  notifIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface.elevated,
    borderWidth: 2,
    borderColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    ...brutalistShadows.small,
  },
  notifIconText: {
    fontSize: 20,
  },
  notifInfo: {
    flex: 1,
    gap: 4,
  },
  notifTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: 'Poppins',
  },
  notifSubtitle: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  notifTime: {
    ...typography.caption,
    color: colors.text.muted,
  },
});

