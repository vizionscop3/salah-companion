const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');
const fs = require('fs');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    ...defaultConfig.resolver,
    extraNodeModules: {
      ...defaultConfig.resolver?.extraNodeModules,
      // Polyfill Node.js crypto module for bcryptjs
      // Use our custom polyfill instead of react-native-crypto
      crypto: path.resolve(__dirname, 'src/utils/crypto-polyfill.js'),
    },
    // Ensure index.js is used as entry point
    sourceExts: ['js', 'json', 'ts', 'tsx', 'jsx'],
    // Resolve index.android to index.js
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === './index.android' || moduleName === 'index.android') {
        return {
          filePath: path.resolve(__dirname, 'index.js'),
          type: 'sourceFile',
        };
      }
      // Use default resolution
      return context.resolveRequest(context, moduleName, platform);
    },
  },
  // Explicitly set the entry file
  transformer: {
    ...defaultConfig.transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  // Explicitly set watchFolders and projectRoot
  watchFolders: [path.resolve(__dirname)],
  projectRoot: path.resolve(__dirname),
};

module.exports = mergeConfig(defaultConfig, config);

