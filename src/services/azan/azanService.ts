/**
 * Azan (Call to Prayer) Service
 * 
 * Manages Azan audio playback, scheduling, and notifications.
 */

import Sound from 'react-native-sound';
import {Platform} from 'react-native';
import PushNotification from 'react-native-push-notification';
import {PrayerName} from '@services/prayer/prayerTimeService';

export type AzanVoice = 'makkah' | 'madinah' | 'qatami' | 'alafasy';

export interface AzanConfig {
  voice: AzanVoice;
  volume: number; // 0-100
  fadeIn: boolean;
  dndOverride: boolean;
  vibration: boolean;
  enabled: boolean;
}

/**
 * Azan Service Class
 */
class AzanService {
  private currentSound: Sound | null = null;
  private config: AzanConfig = {
    voice: 'makkah',
    volume: 80,
    fadeIn: true,
    dndOverride: false,
    vibration: true,
    enabled: true,
  };

  /**
   * Initialize the service
   */
  initialize(config?: Partial<AzanConfig>) {
    if (config) {
      this.config = {...this.config, ...config};
    }

    // Configure sound category for iOS
    if (Platform.OS === 'ios') {
      Sound.setCategory('Playback', true);
    }

    // Configure push notifications
    this.configureNotifications();
  }

  /**
   * Configure push notifications for Azan
   */
  private configureNotifications() {
    PushNotification.configure({
      onRegister: function (token: {token: string}) {
        console.log('Push notification token:', token);
      },
      onNotification: function (notification: any) {
        console.log('Notification:', notification);
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

  /**
   * Schedule Azan notification for a prayer time
   */
  scheduleAzan(prayer: PrayerName, time: Date, config?: Partial<AzanConfig>) {
    if (!this.config.enabled) {
      return;
    }

    const finalConfig = {...this.config, ...config};

    // Schedule notification
    PushNotification.localNotificationSchedule({
      id: this.getNotificationId(prayer),
      title: `Azan - ${this.getPrayerName(prayer)}`,
      message: this.getAzanText(),
      date: time,
      soundName: this.getSoundFileName(finalConfig.voice),
      playSound: true,
      vibrate: finalConfig.vibration,
      vibration: finalConfig.vibration ? 1000 : 0,
      userInfo: {
        prayer,
        type: 'azan',
      },
      ...(finalConfig.dndOverride && {
        // Override Do Not Disturb on Android
        importance: 'high',
        priority: 'high',
      }),
    });
  }

  /**
   * Play Azan audio
   */
  async playAzan(voice?: AzanVoice, volume?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const azanVoice = voice || this.config.voice;
      const azanVolume = volume ?? this.config.volume;

      // Stop any currently playing sound
      this.stopAzan();

      // Create new sound instance
      const soundFile = this.getSoundFileName(azanVoice);
      const sound = new Sound(soundFile, Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.error('Error loading Azan sound:', error);
          reject(error);
          return;
        }

        // Set volume (0.0 to 1.0)
        sound.setVolume(azanVolume / 100);

        // Play with fade in if configured
        if (this.config.fadeIn) {
          sound.play((success) => {
            if (success) {
              console.log('Azan played successfully');
              resolve();
            } else {
              console.error('Error playing Azan');
              reject(new Error('Failed to play Azan'));
            }
            sound.release();
          });
        } else {
          sound.play((success) => {
            if (success) {
              console.log('Azan played successfully');
              resolve();
            } else {
              console.error('Error playing Azan');
              reject(new Error('Failed to play Azan'));
            }
            sound.release();
          });
        }

        this.currentSound = sound;
      });
    });
  }

  /**
   * Stop currently playing Azan
   */
  stopAzan() {
    if (this.currentSound) {
      this.currentSound.stop();
      this.currentSound.release();
      this.currentSound = null;
    }
  }

  /**
   * Cancel scheduled Azan for a prayer
   */
  cancelAzan(prayer: PrayerName) {
    PushNotification.cancelLocalNotifications({
      id: this.getNotificationId(prayer),
    });
  }

  /**
   * Cancel all scheduled Azan notifications
   */
  cancelAllAzan() {
    PushNotification.cancelAllLocalNotifications();
  }

  /**
   * Get sound file name for voice
   */
  private getSoundFileName(voice: AzanVoice): string {
    const soundFiles: Record<AzanVoice, string> = {
      makkah: 'azan_makkah.mp3',
      madinah: 'azan_madinah.mp3',
      qatami: 'azan_qatami.mp3',
      alafasy: 'azan_alafasy.mp3',
    };
    return soundFiles[voice];
  }

  /**
   * Get notification ID for prayer
   */
  private getNotificationId(prayer: PrayerName): string {
    return `azan_${prayer}`;
  }

  /**
   * Get prayer name for display
   */
  private getPrayerName(prayer: PrayerName): string {
    const names: Record<PrayerName, string> = {
      fajr: 'Fajr',
      dhuhr: 'Dhuhr',
      asr: 'Asr',
      maghrib: 'Maghrib',
      isha: 'Isha',
    };
    return names[prayer];
  }

  /**
   * Get Azan text
   */
  private getAzanText(): string {
    return 'Allahu Akbar - Come to prayer';
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AzanConfig>) {
    this.config = {...this.config, ...config};
  }

  /**
   * Get current configuration
   */
  getConfig(): AzanConfig {
    return {...this.config};
  }
}

// Export singleton instance
export const azanService = new AzanService();
export default azanService;

