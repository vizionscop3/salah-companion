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
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="GuidedSalah"
        component={GuidedSalahScreen}
        options={{
          headerShown: true,
          title: 'Guided Prayer',
        }}
      />
    </Stack.Navigator>
  );
};

