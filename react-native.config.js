module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts/'],
  dependencies: {
    '@react-native-google-signin/google-signin': {
      platforms: {
        ios: null, // Disable iOS auto-linking for Google Sign-In
      },
    },
  },
};
