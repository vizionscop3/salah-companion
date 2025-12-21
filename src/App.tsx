/**
 * Salah Companion - Main App Component
 *
 * This is the root component of the application.
 * It sets up navigation, theme, and global providers.
 */

import React, {useEffect} from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {PaperProvider} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {ThemeProvider} from '@context/ThemeContext';
import {AuthProvider} from '@context/AuthContext';
import {AppNavigator} from '@screens/navigation/AppNavigator';
import {theme} from '@constants/theme';
import {initializeNotifications} from '@services/notifications/notificationService';
// TODO: Re-enable Google Sign-In after configuration
// import {initializeGoogleSignIn} from '@services/auth/authService';

const App: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    // Initialize notification service (non-blocking)
    try {
      initializeNotifications();
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      // Don't block app startup if notifications fail
    }

    // TODO: Re-enable Google Sign-In after configuration
    // Initialize Google Sign-In (non-blocking)
    // try {
    //   initializeGoogleSignIn();
    // } catch (error) {
    //   console.error('Failed to initialize Google Sign-In:', error);
    //   // Don't block app startup if Google Sign-In fails
    // }
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <PaperProvider
          theme={theme.light}
          settings={{
            icon: (props) => <MaterialCommunityIcons {...props} />,
          }}>
          <AuthProvider>
            <ThemeProvider>
              <NavigationContainer>
                <StatusBar
                  barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                  backgroundColor={theme.light.colors.primary}
                />
                <AppNavigator />
              </NavigationContainer>
            </ThemeProvider>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
