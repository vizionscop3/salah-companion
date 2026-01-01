/**
 * Permissions Onboarding Screen
 *
 * First-time installation permission requests.
 * Requests all necessary permissions before allowing app usage.
 */

import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, Platform, Linking, ViewStyle} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography, colors, borderRadius, brutalistShadows} from '@constants/theme';
import {useNavigation} from '@react-navigation/native';
import {NeubrutalButton} from '@components/NeubrutalButton';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {requestLocationPermission} from '@services/location/locationService';
import PushNotification from 'react-native-push-notification';
import {PermissionsAndroid} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PERMISSIONS_STORAGE_KEY = '@salah_companion:permissions_completed';

interface PermissionItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  required: boolean;
  granted: boolean;
  requesting: boolean;
}

export const PermissionsOnboardingScreen: React.FC = () => {
  const {currentTheme} = useTheme();
  const navigation = useNavigation();
  const [permissions, setPermissions] = useState<PermissionItem[]>([
    {
      id: 'location',
      title: 'Location Access',
      description: 'Calculate accurate prayer times based on your location',
      icon: 'map-marker',
      required: false,
      granted: false,
      requesting: false,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Receive prayer time reminders and Azan alerts',
      icon: 'bell',
      required: false,
      granted: false,
      requesting: false,
    },
  ]);

  useEffect(() => {
    checkExistingPermissions();
  }, []);

  const checkExistingPermissions = async () => {
    // Check if permissions were already completed
    const completed = await AsyncStorage.getItem(PERMISSIONS_STORAGE_KEY);
    if (completed === 'true') {
      // AppNavigator will detect this and show main app
      // No navigation needed here
      return;
    }

    // Check current permission status
    const updatedPermissions = await Promise.all(
      permissions.map(async (permission) => {
        if (permission.id === 'location') {
          if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.check(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            );
            return {...permission, granted};
          }
          return {...permission, granted: true}; // iOS handled via Info.plist
        }
        if (permission.id === 'notifications') {
          // Check notification permission status
          // PushNotification checks are async, default to false for now
          return {...permission, granted: false};
        }
        return permission;
      }),
    );
    setPermissions(updatedPermissions);
  };

  const requestPermission = async (permissionId: string) => {
    setPermissions((prev) =>
      prev.map((p) => (p.id === permissionId ? {...p, requesting: true} : p)),
    );

    try {
      if (permissionId === 'location') {
        // Add a small delay to ensure UI updates before showing permission dialog
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const granted = await requestLocationPermission();
        
        // Update permission state immediately
        setPermissions((prev) =>
          prev.map((p) =>
            p.id === permissionId ? {...p, granted, requesting: false} : p,
          ),
        );
        
        // Re-check permission status after a delay (in case user grants via system dialog)
        // This handles cases where the permission dialog might take time to show
        setTimeout(async () => {
          if (Platform.OS === 'android') {
            try {
              const checkResult = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
              );
              setPermissions((prev) =>
                prev.map((p) =>
                  p.id === permissionId ? {...p, granted: checkResult} : p,
                ),
              );
            } catch (checkError) {
              console.error('Error checking location permission:', checkError);
            }
          }
        }, 1000);
      } else if (permissionId === 'notifications') {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Notification Permission',
              message:
                'Salah Companion needs notification access to send prayer time reminders.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
          setPermissions((prev) =>
            prev.map((p) =>
              p.id === permissionId ? {...p, granted: isGranted, requesting: false} : p,
            ),
          );
        } else {
          // iOS - Configure PushNotification to request permissions
          PushNotification.configure({
            requestPermissions: true,
            onRegister: () => {},
            onNotification: () => {},
          });
          // Note: iOS permissions are requested automatically via configure
          // We assume granted for now (actual permission check would require native module)
          setPermissions((prev) =>
            prev.map((p) =>
              p.id === permissionId ? {...p, granted: true, requesting: false} : p,
            ),
          );
        }
      }
    } catch (error) {
      console.error(`Error requesting ${permissionId} permission:`, error);
      setPermissions((prev) =>
        prev.map((p) => (p.id === permissionId ? {...p, requesting: false} : p)),
      );
    }
  };

  const handleContinue = async () => {
    try {
      // Mark permissions as completed (even if some were denied)
      await AsyncStorage.setItem(PERMISSIONS_STORAGE_KEY, 'true');
      console.log('✅ Permissions marked as completed');
      
      // Force AppNavigator to re-check by resetting navigation
      // This ensures immediate transition to main app
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        // If we can't go back, reset navigation to trigger AppNavigator re-evaluation
        (navigation as any).reset({
          index: 0,
          routes: [],
        });
      }
    } catch (error) {
      console.error('❌ Error saving permissions completion:', error);
    }
  };

  const handleSkip = async () => {
    try {
      // Allow skipping - app works without permissions
      await AsyncStorage.setItem(PERMISSIONS_STORAGE_KEY, 'true');
      console.log('✅ Permissions skipped and marked as completed');
      
      // Force AppNavigator to re-check by resetting navigation
      // This ensures immediate transition to main app
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        // If we can't go back, reset navigation to trigger AppNavigator re-evaluation
        (navigation as any).reset({
          index: 0,
          routes: [],
        });
      }
    } catch (error) {
      console.error('❌ Error saving permissions skip:', error);
    }
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Salah Companion</Text>
          <Text style={styles.subtitle}>
            We need a few permissions to provide the best experience
          </Text>
        </View>

        <View style={styles.permissionsList}>
          {permissions.map((permission) => (
            <View key={permission.id} style={styles.permissionCard}>
              <View style={styles.permissionHeader}>
                <MaterialCommunityIcons
                  name={permission.icon}
                  size={32}
                  color={permission.granted ? colors.success.main : colors.primary.main}
                />
                <View style={styles.permissionInfo}>
                  <Text style={styles.permissionTitle}>{permission.title}</Text>
                  <Text style={styles.permissionDescription}>{permission.description}</Text>
                </View>
                {permission.granted ? (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={24}
                    color={colors.success.main}
                  />
                ) : null}
              </View>

              {!permission.granted && (
                <View style={styles.permissionActions}>
                  <NeubrutalButton
                    title={permission.requesting ? 'Requesting...' : 'Grant Permission'}
                    onPress={() => requestPermission(permission.id)}
                    variant="primary"
                    size="small"
                    disabled={permission.requesting}
                    style={styles.permissionButton}
                  />
                  {permission.id === 'location' && (
                    <NeubrutalButton
                      title="Select Manually"
                      onPress={() => {
                        (navigation as any).navigate('LocationSelection');
                      }}
                      variant="outline"
                      size="small"
                      style={StyleSheet.flatten([styles.permissionButton, styles.manualLocationButton])}
                      icon={
                        <MaterialCommunityIcons
                          name="map-marker"
                          size={16}
                          color={colors.primary.main}
                        />
                      }
                    />
                  )}
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.infoCard}>
          <MaterialCommunityIcons
            name="information"
            size={24}
            color={colors.primary.main}
          />
          <Text style={styles.infoText}>
            You can use the app without these permissions. You can change them later in
            Settings.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <NeubrutalButton
          title="Continue"
          onPress={handleContinue}
          variant="primary"
          size="large"
          style={styles.continueButton}
        />
        <NeubrutalButton
          title="Skip for Now"
          onPress={handleSkip}
          variant="secondary"
          size="medium"
          style={styles.skipButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    fontFamily: 'Poppins',
  },
  subtitle: {
    ...typography.body1,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  permissionsList: {
    gap: spacing.md,
  },
  permissionCard: {
    backgroundColor: colors.surface.secondary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    borderColor: colors.primary.main,
    ...brutalistShadows.medium,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitle: {
    ...typography.h5,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    fontFamily: 'Poppins',
  },
  permissionDescription: {
    ...typography.body2,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  permissionActions: {
    marginTop: spacing.sm,
  },
  permissionButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  manualLocationButton: {
    marginTop: spacing.xs,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface.tertiary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primary.main,
    gap: spacing.sm,
  },
  infoText: {
    ...typography.body2,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.surface.secondary,
    borderTopWidth: 3,
    borderTopColor: colors.primary.main,
  },
  continueButton: {
    width: '100%',
  },
  skipButton: {
    width: '100%',
  },
});

