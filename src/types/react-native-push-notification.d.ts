/**
 * Type definitions for react-native-push-notification
 */

declare module 'react-native-push-notification' {
  interface PushNotificationPermissions {
    alert?: boolean;
    badge?: boolean;
    sound?: boolean;
  }

  interface PushNotificationOptions {
    onRegister?: (token: {token: string; os: string}) => void;
    onNotification?: (notification: any) => void;
    permissions?: PushNotificationPermissions;
    popInitialNotification?: boolean;
    requestPermissions?: boolean;
  }

  interface LocalNotification {
    id?: string;
    title?: string;
    message?: string;
    date?: Date;
    soundName?: string;
    playSound?: boolean;
    vibrate?: boolean;
    vibration?: number;
    userInfo?: Record<string, any>;
    importance?: string;
    priority?: string;
  }

  interface LocalNotificationSchedule extends LocalNotification {
    date: Date;
  }

  const PushNotification: {
    configure: (options: PushNotificationOptions) => void;
    localNotification: (notification: LocalNotification) => void;
    localNotificationSchedule: (notification: LocalNotificationSchedule) => void;
    cancelLocalNotifications: (options: {id?: string}) => void;
    cancelAllLocalNotifications: () => void;
  };

  export default PushNotification;
}

