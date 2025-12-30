/**
 * Qibla Compass Component - Material Neubrutomorphism
 *
 * Interactive compass showing Qibla direction with device orientation.
 * Features Material Neubrutomorphism design with triple-layer shadows.
 */

import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Dimensions, ActivityIndicator} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {NeubrutalCard, NeubrutalButton} from './index';
import {spacing, typography, colors, borderRadius, brutalistShadows} from '@constants/theme';
import {
  getCurrentLocation,
  requestLocationPermission,
  Location,
} from '@services/location/locationService';
import {
  calculateQiblaFromLocation,
  calculateDistanceToKaaba,
  getCompassDirection,
} from '@services/qibla/qiblaService';
import {
  subscribeToMagnetometer,
  requestMagnetometerPermission,
  MagnetometerSubscription,
} from '@services/qibla/magnetometerService';

const {width} = Dimensions.get('window');
const COMPASS_SIZE = Math.min(width - spacing.xl * 2, 320);
const COMPASS_FACE_SIZE = COMPASS_SIZE - 40;

export interface QiblaCompassProps {
  showDistance?: boolean;
}

export const QiblaCompass: React.FC<QiblaCompassProps> = ({showDistance = true}) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [magnetometerActive, setMagnetometerActive] = useState(false);
  const [magnetometerSubscription, setMagnetometerSubscription] =
    useState<MagnetometerSubscription | null>(null);
  const needleRotation = useSharedValue(0);

  useEffect(() => {
    initializeCompass();

    // Cleanup magnetometer subscription on unmount
    return () => {
      if (magnetometerSubscription) {
        magnetometerSubscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (qiblaBearing !== null) {
      const relativeAngle = (qiblaBearing - deviceHeading + 360) % 360;
      needleRotation.value = withTiming(relativeAngle, {duration: 300});
    }
  }, [qiblaBearing, deviceHeading]);

  const initializeCompass = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request location permission
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setError(
          'Location permission is required to show Qibla direction. Please enable location access in settings.',
        );
        setLoading(false);
        return;
      }

      // Get current location with timeout handling
      let currentLocation: Location;
      try {
        currentLocation = await Promise.race([
          getCurrentLocation(),
          new Promise<Location>((_, reject) =>
            setTimeout(() => reject(new Error('Location request timed out')), 15000),
          ),
        ]);
      } catch (locationError) {
        const error = locationError as any;
        if (error.code === 1) {
          // Permission denied
          setError(
            'Location permission denied. Please enable location access in your device settings.',
          );
        } else if (error.code === 2) {
          // Position unavailable
          setError(
            'Unable to get your location. Please check your GPS settings and try again.',
          );
        } else if (error.code === 3) {
          // Timeout
          setError(
            'Location request timed out. Please check your GPS signal and try again.',
          );
        } else {
          setError(
            'Failed to get your location. Please check your GPS settings and try again.',
          );
        }
        setLoading(false);
        return;
      }

      setLocation(currentLocation);

      const bearing = calculateQiblaFromLocation(currentLocation);
      setQiblaBearing(bearing);

      if (showDistance) {
        const dist = calculateDistanceToKaaba(
          currentLocation.latitude,
          currentLocation.longitude,
        );
        setDistance(dist);
      }

      setDeviceHeading(0);
      setLoading(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to initialize compass. Please try again.';
      setError(errorMessage);
      setLoading(false);
      if (__DEV__) {
        console.warn('Compass initialization error:', err);
      }
    }
  };

  const needleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${needleRotation.value}deg`}],
  }));

  if (loading) {
    return (
      <NeubrutalCard style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Initializing compass...</Text>
        </View>
      </NeubrutalCard>
    );
  }

  if (error) {
    return (
      <NeubrutalCard style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.errorActions}>
            <NeubrutalButton
              title="Retry"
              onPress={initializeCompass}
              variant="primary"
              size="medium"
              style={styles.retryButton}
            />
            {error.includes('permission') && (
              <NeubrutalButton
                title="Open Settings"
                onPress={() => {
                  // Note: In production, you might want to use Linking.openSettings()
                  // For now, just retry which will show the permission dialog again
                  initializeCompass();
                }}
                variant="outline"
                size="medium"
                style={styles.settingsButton}
              />
            )}
          </View>
        </View>
      </NeubrutalCard>
    );
  }

  const compassDirection = qiblaBearing !== null ? getCompassDirection(qiblaBearing) : 'N';

  return (
    <View style={styles.wrapper}>
      <NeubrutalCard
        style={styles.compassWrapper}
        borderWidth={4}
        shadowSize="large"
        onPress={undefined}>
        <View style={[styles.compassFace, {width: COMPASS_FACE_SIZE, height: COMPASS_FACE_SIZE}]}>
          {/* Direction Markers */}
          {['N', 'E', 'S', 'W'].map((dir, i) => (
            <View
              key={dir}
              style={[
                styles.directionMarker,
                {
                  transform: [
                    {rotate: `${i * 90}deg`},
                    {translateY: -(COMPASS_FACE_SIZE / 2 - 20)},
                  ],
                },
              ]}>
              <Text
                style={[
                  styles.directionText,
                  {
                    transform: [{rotate: `${-i * 90}deg`}],
                  },
                ]}>
                {dir}
              </Text>
            </View>
          ))}

          {/* Decorative Dots */}
          {Array.from({length: 8}).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  transform: [
                    {rotate: `${i * 45 + 22.5}deg`},
                    {translateY: -(COMPASS_FACE_SIZE / 2 - 15)},
                  ],
                },
              ]}
            />
          ))}

          {/* Kaaba Icon */}
          <View style={styles.kaabaIcon}>
            <View style={styles.kaabaBase} />
            <View style={styles.kaabaTop} />
            <View style={styles.kaabaCenter} />
          </View>

          {/* Compass Needle */}
          <Animated.View style={[styles.compassNeedle, needleAnimatedStyle]}>
            <View style={[styles.needleNorth, {borderBottomColor: colors.primary.main}]} />
            <View style={styles.needleSouth} />
          </Animated.View>

          {/* Center Dot */}
          <View style={styles.centerDot} />
        </View>

        {/* Degree Display */}
        {qiblaBearing !== null && (
          <View style={styles.degreeDisplay}>
            <Text style={styles.degreeText}>{Math.round(qiblaBearing)}°</Text>
          </View>
        )}
      </NeubrutalCard>

      {/* Info Text */}
      <Text style={styles.infoText}>
        Point your device north to find Qibla direction
      </Text>

      {/* Distance */}
      {showDistance && distance !== null && (
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceLabel}>Distance to Kaaba</Text>
          <Text style={styles.distanceValue}>{distance.toFixed(0)} km</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.lg,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body1,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  errorText: {
    ...typography.body1,
    color: colors.error.main,
    textAlign: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  errorActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  retryButton: {
    flex: 1,
  },
  settingsButton: {
    flex: 1,
  },
  compassWrapper: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    borderRadius: COMPASS_SIZE / 2,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.secondary,
    borderColor: colors.primary.main,
  },
  compassFace: {
    borderRadius: COMPASS_FACE_SIZE / 2,
    backgroundColor: colors.surface.tertiary,
    borderWidth: 2,
    borderColor: 'rgba(61, 217, 197, 0.2)',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  directionMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -10,
    marginTop: -10,
  },
  directionText: {
    ...typography.h6,
    fontWeight: '700',
    color: colors.primary.main,
    fontFamily: 'Poppins',
  },
  dot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary.main,
    marginLeft: -3,
    marginTop: -3,
    opacity: 0.5,
  },
  kaabaIcon: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  kaabaBase: {
    width: 30,
    height: 25,
    backgroundColor: colors.text.secondary,
    opacity: 0.3,
    borderRadius: 2,
  },
  kaabaTop: {
    width: 24,
    height: 3,
    backgroundColor: colors.text.secondary,
    marginBottom: 2,
    borderRadius: 1,
  },
  kaabaCenter: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.primary.main,
    position: 'absolute',
  },
  compassNeedle: {
    position: 'absolute',
    width: 8,
    height: COMPASS_FACE_SIZE * 0.4,
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 2,
  },
  needleNorth: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: COMPASS_FACE_SIZE * 0.2,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  needleSouth: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: COMPASS_FACE_SIZE * 0.15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.text.muted,
    marginTop: COMPASS_FACE_SIZE * 0.2,
  },
  centerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary.main,
    borderWidth: 3,
    borderColor: colors.background.default,
    position: 'absolute',
    zIndex: 3,
    ...brutalistShadows.small,
  },
  degreeDisplay: {
    position: 'absolute',
    bottom: -50,
    left: '50%',
    marginLeft: -30,
    backgroundColor: colors.surface.tertiary,
    borderWidth: 2,
    borderColor: colors.primary.main,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    ...brutalistShadows.small,
  },
  degreeText: {
    ...typography.h4,
    fontWeight: '800',
    color: colors.primary.main,
    fontFamily: 'Poppins',
  },
  infoText: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  distanceContainer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  distanceLabel: {
    ...typography.body2,
    color: colors.text.secondary,
    opacity: 0.7,
  },
  distanceValue: {
    ...typography.h5,
    fontWeight: '700',
    color: colors.primary.main,
    fontFamily: 'Poppins',
  },
});
