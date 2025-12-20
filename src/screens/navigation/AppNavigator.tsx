/**
 * Main App Navigator
 *
 * Sets up the root navigation structure for the app.
 */

import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {HomeScreen} from '@screens/home/HomeScreen';
import {PrayerTimesScreen} from '@screens/prayer-times/PrayerTimesScreen';
import {LearningScreen} from '@screens/learning/LearningScreen';
import {ProfileScreen} from '@screens/profile/ProfileScreen';
import {GuidedSalahScreen} from '@screens/guided-salah/GuidedSalahScreen';
import {LoginScreen} from '@screens/auth/LoginScreen';
import {RegisterScreen} from '@screens/auth/RegisterScreen';
import {SettingsScreen} from '@screens/settings/SettingsScreen';
import {OnboardingScreen} from '@screens/onboarding/OnboardingScreen';
import {PronunciationAcademyScreen} from '@screens/learning/pronunciation/PronunciationAcademyScreen';
import {LetterPracticeScreen} from '@screens/learning/pronunciation/LetterPracticeScreen';
import {RecitationPracticeScreen} from '@screens/learning/recitation/RecitationPracticeScreen';
import {WordPracticeScreen} from '@screens/learning/recitation/WordPracticeScreen';
import {AyahPracticeScreen} from '@screens/learning/recitation/AyahPracticeScreen';
import {SurahPracticeScreen} from '@screens/learning/recitation/SurahPracticeScreen';
import {useAuth} from '@context/AuthContext';
import {ActivityIndicator, View} from 'react-native';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Main Tab Navigator
 */
const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1976D2',
        tabBarInactiveTintColor: '#757575',
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="PrayerTimes"
        component={PrayerTimesScreen}
        options={{
          tabBarLabel: 'Prayer Times',
        }}
      />
      <Tab.Screen
        name="Learning"
        component={LearningScreen}
        options={{
          tabBarLabel: 'Learning',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Root App Navigator
 */
export const AppNavigator: React.FC = () => {
  const {isAuthenticated, loading, user} = useAuth();

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{
              headerShown: false,
            }}
          />
        </>
      ) : (
        <>
          {!user?.onboardingCompleted ? (
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{
                headerShown: false,
              }}
            />
          ) : (
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen
                name="GuidedSalah"
                component={GuidedSalahScreen}
                options={{
                  headerShown: true,
                  title: 'Guided Prayer',
                }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                  headerShown: true,
                  title: 'Settings',
                }}
              />
              <Stack.Screen
                name="PronunciationAcademy"
                component={PronunciationAcademyScreen}
                options={{
                  headerShown: true,
                  title: 'Pronunciation Academy',
                }}
              />
              <Stack.Screen
                name="LetterPractice"
                component={LetterPracticeScreen}
                options={{
                  headerShown: true,
                  title: 'Letter Practice',
                }}
              />
              <Stack.Screen
                name="RecitationPractice"
                component={RecitationPracticeScreen}
                options={{
                  headerShown: true,
                  title: 'Recitation Practice',
                }}
              />
              <Stack.Screen
                name="RecitationMode"
                component={RecitationPracticeScreen}
                options={{
                  headerShown: true,
                  title: 'Practice Mode',
                }}
              />
              <Stack.Screen
                name="WordPractice"
                component={WordPracticeScreen}
                options={{
                  headerShown: true,
                  title: 'Word Practice',
                }}
              />
              <Stack.Screen
                name="AyahPractice"
                component={AyahPracticeScreen}
                options={{
                  headerShown: true,
                  title: 'Ayah Practice',
                }}
              />
              <Stack.Screen
                name="SurahPractice"
                component={SurahPracticeScreen}
                options={{
                  headerShown: true,
                  title: 'Surah Practice',
                }}
              />
            </>
          )}
        </>
      )}
    </Stack.Navigator>
  );
};

