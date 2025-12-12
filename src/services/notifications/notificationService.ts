/**
 * Notification Service
 * 
 * Manages prayer time notifications and scheduling.
 */

import PushNotification from 'react-native-push-notification';
import {Platform} from 'react-native';
import {PrayerTimes, PrayerName} from '@services/prayer/prayerTimeService';
import {azanService} from '@services/azan/azanService';

export interface NotificationConfig {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  advanceMinutes: number; // Notify X minutes before prayer
}

/**
 * Schedule all prayer time notifications
 */
export function schedulePrayerNotifications(
  prayerTimes: PrayerTimes,
  config: NotificationConfig = {
    enabled: true,
    sound: true,
    vibration: true,
    advanceMinutes: 5,
  },
) {
  if (!config.enabled) {
    return;
  }

  const prayers: Array<{name: PrayerName; time: Date}> = [
    {name: 'fajr', time: prayerTimes.fajr},
    {name: 'dhuhr', time: prayerTimes.dhuhr},
    {name: 'asr', time: prayerTimes.asr},
    {name: 'maghrib', time: prayerTimes.maghrib},
    {name: 'isha', time: prayerTimes.isha},
  ];

  // Schedule Azan notifications
  prayers.forEach((prayer) => {
    const notificationTime = new Date(prayer.time);
    notificationTime.setMinutes(
      notificationTime.getMinutes() - config.advanceMinutes,
    );

    // Schedule advance notification
    if (notificationTime > new Date()) {
      PushNotification.localNotificationSchedule({
        id: `prayer_advance_${prayer.name}`,
        title: `Prayer Reminder: ${prayer.name.charAt(0).toUpperCase() + prayer.name.slice(1)}`,
        message: `Prayer time in ${config.advanceMinutes} minutes`,
        date: notificationTime,
        soundName: config.sound ? 'default' : undefined,
        playSound: config.sound,
        vibrate: config.vibration,
        vibration: config.vibration ? 1000 : 0,
        userInfo: {
          prayer: prayer.name,
          type: 'prayer_reminder',
        },
      });
    }

    // Schedule Azan at prayer time
    azanService.scheduleAzan(prayer.name, prayer.time);
  });
}

/**
 * Cancel all prayer notifications
 */
export function cancelPrayerNotifications() {
  PushNotification.cancelAllLocalNotifications();
  azanService.cancelAllAzan();
}

/**
 * Cancel notification for specific prayer
 */
export function cancelPrayerNotification(prayer: PrayerName) {
  PushNotification.cancelLocalNotifications({
    id: `prayer_advance_${prayer}`,
  });
  azanService.cancelAzan(prayer);
}

/**
 * Initialize notification service
 */
export function initializeNotifications() {
    PushNotification.configure({
      onRegister: function (token: {token: string}) {
        console.log('Push notification token:', token);
      },
      onNotification: function (notification: any) {
        console.log('Notification received:', notification);
      
      // Handle Azan notification
      if (notification.userInfo?.type === 'azan') {
        // Play Azan audio
        const prayer = notification.userInfo.prayer as PrayerName;
        azanService.playAzan().catch(console.error);
      }
    },
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },
    popInitialNotification: true,
    requestPermissions: Platform.OS === 'ios',
  });
}

