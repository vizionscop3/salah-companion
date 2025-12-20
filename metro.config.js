const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    extraNodeModules: {
      // Polyfill Node.js crypto module for bcryptjs
      // Use our custom polyfill instead of react-native-crypto
      crypto: path.resolve(__dirname, 'src/utils/crypto-polyfill.js'),
    },
    // Ensure index.js is used as entry point
    sourceExts: ['js', 'json', 'ts', 'tsx', 'jsx'],
  },
  // Explicitly set the entry file
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

