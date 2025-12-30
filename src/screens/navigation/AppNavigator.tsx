/**
 * Main App Navigator
 *
 * Sets up the root navigation structure for the app.
 */

import React, {lazy, Suspense} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

// Lazy load heavy screens for better performance
const HomeScreen = lazy(() => import('@screens/home/HomeScreen').then(m => ({default: m.HomeScreen})));
const PrayerTimesScreen = lazy(() => import('@screens/prayer-times/PrayerTimesScreen').then(m => ({default: m.PrayerTimesScreen})));
const LearningScreen = lazy(() => import('@screens/learning/LearningScreen').then(m => ({default: m.LearningScreen})));
const ProfileScreen = lazy(() => import('@screens/profile/ProfileScreen').then(m => ({default: m.ProfileScreen})));
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
import {SurahLibraryScreen} from '@screens/learning/SurahLibraryScreen';
import {AzanEducationScreen} from '@screens/learning/AzanEducationScreen';
import {HolidayEducationScreen} from '@screens/learning/HolidayEducationScreen';
import {WordBuildingScreen} from '@screens/learning/pronunciation/WordBuildingScreen';
import {TajweedRulesScreen} from '@screens/learning/recitation/TajweedRulesScreen';
import {MemorizationScreen} from '@screens/learning/memorization/MemorizationScreen';
import {LeaderboardScreen} from '@screens/social/LeaderboardScreen';
import {RamadanScreen} from '@screens/ramadan/RamadanScreen';
import {EditProfileScreen} from '@screens/profile/EditProfileScreen';
import {useAuth} from '@context/AuthContext';
import {ActivityIndicator, View, StyleSheet} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, spacing, borderRadius, brutalistShadows} from '@constants/theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Main Tab Navigator - Material Neubrutomorphism
 */
const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: colors.surface.secondary,
          borderTopWidth: 3,
          borderTopColor: colors.primary.main,
          borderRadius: borderRadius.lg,
          borderTopLeftRadius: borderRadius.lg,
          borderTopRightRadius: borderRadius.lg,
          height: 70,
          paddingBottom: spacing.sm,
          paddingTop: spacing.sm,
          ...brutalistShadows.medium,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          fontFamily: 'Poppins',
        },
        tabBarIconStyle: {
          marginTop: spacing.xs,
        },
      }}>
      <Tab.Screen
        name="Home"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}>
        {props => (
          <Suspense
            fallback={
              <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="large" />
              </View>
            }>
            <HomeScreen {...props} />
          </Suspense>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="PrayerTimes"
        options={{
          tabBarLabel: 'Prayer Time',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="clock-outline" size={size} color={color} />
          ),
        }}>
        {props => (
          <Suspense
            fallback={
              <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="large" />
              </View>
            }>
            <PrayerTimesScreen {...props} />
          </Suspense>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Learning"
        options={{
          tabBarLabel: 'Learning',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="book-open-variant" size={size} color={color} />
          ),
        }}>
        {props => (
          <Suspense
            fallback={
              <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="large" />
              </View>
            }>
            <LearningScreen {...props} />
          </Suspense>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Profile"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}>
        {props => (
          <Suspense
            fallback={
              <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="large" />
              </View>
            }>
            <ProfileScreen {...props} />
          </Suspense>
        )}
      </Tab.Screen>
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
              <Stack.Screen
                name="SurahLibrary"
                component={SurahLibraryScreen}
                options={{
                  headerShown: true,
                  title: 'Surah Library',
                }}
              />
              <Stack.Screen
                name="AzanEducation"
                component={AzanEducationScreen}
                options={{
                  headerShown: true,
                  title: 'Azan Education',
                }}
              />
              <Stack.Screen
                name="HolidayEducation"
                component={HolidayEducationScreen}
                options={{
                  headerShown: true,
                  title: 'Holiday Education',
                }}
              />
              <Stack.Screen
                name="WordBuilding"
                component={WordBuildingScreen}
                options={{
                  headerShown: true,
                  title: 'Word Building',
                }}
              />
              <Stack.Screen
                name="TajweedRules"
                component={TajweedRulesScreen}
                options={{
                  headerShown: true,
                  title: 'Tajweed Rules',
                }}
              />
              <Stack.Screen
                name="Memorization"
                component={MemorizationScreen}
                options={{
                  headerShown: true,
                  title: 'Memorization',
                }}
              />
              <Stack.Screen
                name="Leaderboard"
                component={LeaderboardScreen}
                options={{
                  headerShown: true,
                  title: 'Leaderboards',
                }}
              />
              <Stack.Screen
                name="Ramadan"
                component={RamadanScreen}
                options={{
                  headerShown: true,
                  title: 'Ramadan Mode',
                }}
              />
              <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{
                  headerShown: true,
                  title: 'Edit Profile',
                }}
              />
            </>
          )}
        </>
      )}
    </Stack.Navigator>
  );
};

