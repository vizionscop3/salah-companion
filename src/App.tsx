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

import {ThemeProvider} from '@context/ThemeContext';
import {AuthProvider} from '@context/AuthContext';
import {AppNavigator} from '@screens/navigation/AppNavigator';
import {theme} from '@constants/theme';
import {initializeNotifications} from '@services/notifications/notificationService';

const App: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    // Initialize notification service
    initializeNotifications();
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <PaperProvider theme={theme.light}>
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
