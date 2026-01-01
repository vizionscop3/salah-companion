/**
 * Main App Navigator
 *
 * Sets up the root navigation structure for the app.
 */

import React, {useState, useEffect, useCallback, useRef} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens directly (lazy loading removed to fix loading issues)
import {HomeScreen} from '@screens/home/HomeScreen';
import {PrayerTimesScreen} from '@screens/prayer-times/PrayerTimesScreen';
import {LearningScreen} from '@screens/learning/LearningScreen';
import {ProfileScreen} from '@screens/profile/ProfileScreen';
import {GuidedSalahScreen} from '@screens/guided-salah/GuidedSalahScreen';
import {LoginScreen} from '@screens/auth/LoginScreen';
import {RegisterScreen} from '@screens/auth/RegisterScreen';
import {SettingsScreen} from '@screens/settings/SettingsScreen';
import {OnboardingScreen} from '@screens/onboarding/OnboardingScreen';
import {PermissionsOnboardingScreen} from '@screens/onboarding/PermissionsOnboardingScreen';
import {LocationSelectionScreen} from '@screens/onboarding/LocationSelectionScreen';
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
import {PremiumSubscriptionScreen} from '@screens/premium/PremiumSubscriptionScreen';
import {QuranScreen} from '@screens/quran/QuranScreen';
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
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="PrayerTimes"
        component={PrayerTimesScreen}
        options={{
          tabBarLabel: 'Prayer Time',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="clock-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Learning"
        component={LearningScreen}
        options={{
          tabBarLabel: 'Learning',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="book-open-variant" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Quran"
        component={QuranScreen}
        options={{
          tabBarLabel: 'Quran',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="book-multiple" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Root App Navigator
 */
export const AppNavigator: React.FC = () => {
  const {isAuthenticated, loading, user, isGuest, setGuestMode} = useAuth();
  const [permissionsCompleted, setPermissionsCompleted] = useState<boolean | null>(null);
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [permissionsTimeout, setPermissionsTimeout] = useState(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to check permissions status (reusable)
  const checkPermissionsStatus = useCallback(async (): Promise<boolean> => {
    try {
      const completed = await AsyncStorage.getItem('@salah_companion:permissions_completed');
      const isCompleted = completed === 'true';
      
      console.log('🔍 Permissions check result:', { completed, isCompleted });
      
      setPermissionsCompleted(isCompleted);
      setCheckingPermissions(false);
      
      return isCompleted;
    } catch (error) {
      console.error('❌ Error checking permissions:', error);
      // Default to false (show permissions screen) on error
      setPermissionsCompleted(false);
      setCheckingPermissions(false);
      return false;
    }
  }, []);

  // Check if permissions onboarding is completed
  useEffect(() => {
    let isMounted = true;
    
    // Initial check with timeout protection
    const initialCheck = async () => {
      try {
        await Promise.race([
          checkPermissionsStatus(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 1500)
          ),
        ]);
      } catch (error) {
        console.warn('⚠️ Initial permissions check timeout or error:', error);
        if (isMounted) {
          setPermissionsCompleted(false);
          setCheckingPermissions(false);
        }
      }
    };
    
    initialCheck();
    
    // Poll every 200ms to catch when permissions are marked as completed (faster response)
    // Only poll if permissions are not completed yet
    checkIntervalRef.current = setInterval(async () => {
      if (isMounted) {
        const completed = await checkPermissionsStatus();
        if (completed && checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
      }
    }, 200); // Reduced from 500ms to 200ms for faster response
    
    return () => {
      isMounted = false;
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [checkPermissionsStatus]); // Include checkPermissionsStatus in dependencies

  // Also check permissions when on permissions screen (for immediate response)
  useEffect(() => {
    // If we're showing permissions screen, check more frequently
    if (permissionsCompleted === false) {
      const quickCheck = setInterval(async () => {
        const completed = await checkPermissionsStatus();
        if (completed) {
          clearInterval(quickCheck);
        }
      }, 100); // Very fast polling when on permissions screen
      
      return () => clearInterval(quickCheck);
    }
  }, [permissionsCompleted, checkPermissionsStatus]);

  // Add timeout for loading state to prevent blank screen (1 second max)
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.warn('AppNavigator: Loading timeout (1s) - proceeding');
        setLoadingTimeout(true);
      }, 1000);
      
      return () => clearTimeout(timeout);
    } else {
      setLoadingTimeout(false);
    }
  }, [loading]);

  // After permissions, enable guest mode if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !loading && permissionsCompleted) {
      setGuestMode(true);
    }
  }, [isAuthenticated, loading, permissionsCompleted, setGuestMode]);
  
  // Add timeout for permissions check - ALWAYS fire after 1.5s to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Force show permissions screen if we're still checking or permissions are null
      console.warn('⏱️ Permissions check timeout (1.5s) - forcing permissions screen');
      setPermissionsTimeout(true);
      setCheckingPermissions(false);
      // Only set to false if still null (don't override if already set)
      if (permissionsCompleted === null) {
        setPermissionsCompleted(false);
      }
    }, 1500); // 1.5 second max - ALWAYS fire
    
    return () => clearTimeout(timeout);
  }, []); // Run once on mount - unconditional timeout

  // Debug logging
  useEffect(() => {
    console.log('📊 AppNavigator State:', {
      checkingPermissions,
      permissionsCompleted,
      permissionsTimeout,
      loading,
      loadingTimeout,
      isAuthenticated,
    });
  }, [checkingPermissions, permissionsCompleted, permissionsTimeout, loading, loadingTimeout, isAuthenticated]);

  // Show loading only if checking permissions and haven't timed out
  if (checkingPermissions && !permissionsTimeout && permissionsCompleted === null) {
    console.log('⏳ Showing loading screen...');
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.default}}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  // Show permissions onboarding if permissions are NOT completed (true)
  // This covers: false, null, undefined, or timed out
  // This ensures we ALWAYS have a path forward - no infinite loading
  if (permissionsCompleted !== true) {
    console.log('📱 Showing permissions screen...', { 
      permissionsCompleted, 
      permissionsTimeout, 
      checkingPermissions 
    });
    return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen
          name="PermissionsOnboarding"
          component={PermissionsOnboardingScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="LocationSelection"
          component={LocationSelectionScreen}
          options={{
            headerShown: true,
            title: 'Select Location',
            headerStyle: {
              backgroundColor: colors.surface.secondary,
              borderBottomWidth: 3,
              borderBottomColor: colors.primary.main,
            },
            headerTintColor: colors.text.primary,
            headerTitleStyle: {
              fontFamily: 'Poppins',
              fontWeight: '700',
            },
          }}
        />
      </Stack.Navigator>
    );
  }
  
  // After timeout, treat as not authenticated (guest mode)
  const effectiveIsAuthenticated = loadingTimeout ? false : isAuthenticated;


  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      {!effectiveIsAuthenticated ? (
        // Guest mode - show main app without login
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
            component={LetterPracticeScreen as any}
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
            component={WordPracticeScreen as any}
            options={{
              headerShown: true,
              title: 'Word Practice',
            }}
          />
          <Stack.Screen
            name="AyahPractice"
            component={AyahPracticeScreen as any}
            options={{
              headerShown: true,
              title: 'Ayah Practice',
            }}
          />
          <Stack.Screen
            name="SurahPractice"
            component={SurahPracticeScreen as any}
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
            name="PremiumSubscription"
            component={PremiumSubscriptionScreen}
            options={{
              headerShown: true,
              title: 'Premium Subscription',
            }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              headerShown: true,
              title: 'Sign In',
            }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{
              headerShown: true,
              title: 'Create Account',
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
                component={LetterPracticeScreen as any}
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
                component={WordPracticeScreen as any}
                options={{
                  headerShown: true,
                  title: 'Word Practice',
                }}
              />
              <Stack.Screen
                name="AyahPractice"
                component={AyahPracticeScreen as any}
                options={{
                  headerShown: true,
                  title: 'Ayah Practice',
                }}
              />
              <Stack.Screen
                name="SurahPractice"
                component={SurahPracticeScreen as any}
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

