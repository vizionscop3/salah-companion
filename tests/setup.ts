import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock react-native-sound
jest.mock('react-native-sound', () => {
  return jest.fn().mockImplementation((source: string, basePath: string, callback?: (error: Error | null) => void) => {
    const sound: any = {
      play: jest.fn((callback?: (success: boolean) => void) => {
        if (callback) {
          callback(true);
        }
        return sound;
      }),
      stop: jest.fn(() => sound),
      release: jest.fn(() => sound),
      setVolume: jest.fn(() => sound),
      isPlaying: jest.fn(() => false),
    };
    if (callback) {
      callback(null);
    }
    return sound;
  });
});

// Mock react-native-fs to avoid NativeEventEmitter errors in tests
jest.mock('react-native-fs', () => {
  const fs = {
    DocumentDirectoryPath: '/tmp',
    exists: jest.fn(async () => true),
    mkdir: jest.fn(async () => true),
    unlink: jest.fn(async () => true),
    readdir: jest.fn(async () => []),
    stat: jest.fn(async () => ({size: 0})),
    downloadFile: jest.fn(() => ({
      promise: Promise.resolve({statusCode: 200}),
    })),
  };
  return fs;
});

// Mock Prisma Client
const createMockPrismaClient = () => ({
  prayerRecord: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  userProgress: {
    findFirst: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  },
  userAchievement: {
    count: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
  recitationPractice: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  pronunciationProgress: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  achievement: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
});

jest.mock('@services/database/prismaClient', () => {
  const mockPrisma = createMockPrismaClient();
  return {
    prisma: mockPrisma,
    prismaClient: mockPrisma,
    default: mockPrisma,
  };
});

// Mock react-native-push-notification
jest.mock('react-native-push-notification', () => ({
  configure: jest.fn(),
  localNotificationSchedule: jest.fn(),
  cancelLocalNotifications: jest.fn(),
  cancelAllLocalNotifications: jest.fn(),
}));

// Mock @react-native-community/geolocation
jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn((success) => {
    success({
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10,
        altitude: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    });
  }),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
  setConfiguration: jest.fn(),
  requestAuthorization: jest.fn(),
}));

