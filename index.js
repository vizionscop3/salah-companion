/**
 * @format
 */

// Polyfill for crypto (required for bcryptjs)
import 'react-native-get-random-values';

// Ensure MaterialCommunityIcons is available globally before app loads
// This fixes the "Requiring unknown module 'undefined'" error in react-native-paper
// Import both the default export and named exports to ensure proper module resolution
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Make it available globally for react-native-paper's dynamic requires
if (typeof global !== 'undefined') {
  global.MaterialCommunityIcons = MaterialCommunityIcons;
}

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);

