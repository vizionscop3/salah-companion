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
jest.mock('react-native-sound', () => ({
  setCategory: jest.fn(),
  setIsEnabled: jest.fn(),
  enable: jest.fn(),
  enableInSilentMode: jest.fn(),
  enableAsync: jest.fn(),
  enableInSilentModeAsync: jest.fn(),
  setActive: jest.fn(),
  setActiveAsync: jest.fn(),
  setMode: jest.fn(),
  setModeAsync: jest.fn(),
  setSpeakerphoneOn: jest.fn(),
  setSpeakerphoneOnAsync: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
  removeSubscription: jest.fn(),
}));

