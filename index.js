/**
 * @format
 */

// Polyfill for crypto (required for bcryptjs)
import 'react-native-get-random-values';

// Ensure MaterialCommunityIcons is available globally before app loads
// This fixes the "Requiring unknown module 'undefined'" error in react-native-paper
import 'react-native-vector-icons/MaterialCommunityIcons';

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);

