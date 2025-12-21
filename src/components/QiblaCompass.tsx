/**
 * Qibla Compass Component
 *
 * Interactive compass showing Qibla direction with device orientation.
 */

import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Animated, Dimensions} from 'react-native';
import {Card, Button, ActivityIndicator} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography, colors, elevation} from '@constants/theme';
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

const {width} = Dimensions.get('window');
const COMPASS_SIZE = Math.min(width - spacing.xl * 2, 300);

export interface QiblaCompassProps {
  showDistance?: boolean;
}

export const QiblaCompass: React.FC<QiblaCompassProps> = ({showDistance = true}) => {
  const {currentTheme} = useTheme();
  const [location, setLocation] = useState<Location | null>(null);
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compassRotation] = useState(new Animated.Value(0));

  useEffect(() => {
    initializeCompass();
    return () => {
      // Cleanup if needed
    };
  }, []);

  useEffect(() => {
    if (qiblaBearing !== null && deviceHeading !== null) {
      // Calculate relative angle: Qibla direction relative to device heading
      const relativeAngle = (qiblaBearing - deviceHeading + 360) % 360;
      Animated.timing(compassRotation, {
        toValue: relativeAngle,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [qiblaBearing, deviceHeading]);

  const initializeCompass = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request location permission
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setError('Location permission is required to show Qibla direction. Please enable location access in settings.');
        setLoading(false);
        return; // Don't throw - just show error message
      }

      // Get current location
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);

      // Calculate Qibla bearing
      const bearing = calculateQiblaFromLocation(currentLocation);
      setQiblaBearing(bearing);

      // Calculate distance
      if (showDistance) {
        const dist = calculateDistanceToKaaba(
          currentLocation.latitude,
          currentLocation.longitude,
        );
        setDistance(dist);
      }

      // Initialize device heading (simplified - in production, use device magnetometer)
      // For now, we'll use a placeholder. In production, integrate with react-native-sensors
      // or similar library for magnetometer access
      setDeviceHeading(0);

      setLoading(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to initialize compass';
      setError(errorMessage);
      setLoading(false);
      // Don't log as error - this is expected if permission is denied
      console.warn('Compass initialization warning:', err);
    }
  };

  const handleRefresh = () => {
    initializeCompass();
  };

  if (loading) {
    return (
      <Card style={[styles.card, elevation[2]]}>
        <Card.Content style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.colors.primary} />
          <Text style={[styles.loadingText, {color: currentTheme.colors.text}]}>
            Initializing compass...
          </Text>
        </Card.Content>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={[styles.card, elevation[2]]}>
        <Card.Content style={styles.errorContainer}>
          <Text style={[styles.errorText, {color: currentTheme.colors.error}]}>
            {error}
          </Text>
          <Button mode="contained" onPress={handleRefresh} style={styles.retryButton}>
            Retry
          </Button>
        </Card.Content>
      </Card>
    );
  }

  const compassDirection = qiblaBearing !== null ? getCompassDirection(qiblaBearing) : 'N';
  const arrowRotation = compassRotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Card style={[styles.card, elevation[2]]}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: currentTheme.colors.text}]}>
            Qibla Direction
          </Text>
          {qiblaBearing !== null && (
            <Text style={[styles.bearing, {color: currentTheme.colors.primary}]}>
              {Math.round(qiblaBearing)}° {compassDirection}
            </Text>
          )}
        </View>

        {/* Compass */}
        <View style={styles.compassContainer}>
          <View style={[styles.compass, {width: COMPASS_SIZE, height: COMPASS_SIZE}]}>
            {/* Compass background circle */}
            <View style={styles.compassCircle}>
              {/* Cardinal directions */}
              <Text style={[styles.direction, styles.north]}>N</Text>
              <Text style={[styles.direction, styles.east]}>E</Text>
              <Text style={[styles.direction, styles.south]}>S</Text>
              <Text style={[styles.direction, styles.west]}>W</Text>

              {/* Qibla arrow */}
              <Animated.View
                style={[
                  styles.arrowContainer,
                  {
                    transform: [{rotate: arrowRotation}],
                  },
                ]}>
                <View style={styles.arrow}>
                  <View style={[styles.arrowHead, {borderBottomColor: colors.primary.main}]} />
                  <View style={styles.arrowShaft} />
                </View>
              </Animated.View>

              {/* Center dot */}
              <View style={styles.centerDot} />
            </View>
          </View>
        </View>

        {/* Distance */}
        {showDistance && distance !== null && (
          <View style={styles.distanceContainer}>
            <Text style={[styles.distanceLabel, {color: currentTheme.colors.text}]}>
              Distance to Kaaba
            </Text>
            <Text style={[styles.distanceValue, {color: currentTheme.colors.primary}]}>
              {distance.toFixed(0)} km
            </Text>
          </View>
        )}

        {/* Refresh button */}
        <Button
          mode="outlined"
          onPress={handleRefresh}
          icon="refresh"
          style={styles.refreshButton}>
          Refresh
        </Button>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface.main,
  },
  content: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body1,
    marginTop: spacing.md,
  },
  errorContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  errorText: {
    ...typography.body1,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    marginTop: spacing.sm,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h4,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  bearing: {
    ...typography.h5,
    fontWeight: '700',
  },
  compassContainer: {
    marginVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compass: {
    position: 'relative',
  },
  compassCircle: {
    width: '100%',
    height: '100%',
    borderRadius: COMPASS_SIZE / 2,
    borderWidth: 3,
    borderColor: colors.primary.main,
    backgroundColor: colors.surface.elevated,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  direction: {
    ...typography.h6,
    fontWeight: '700',
    position: 'absolute',
    color: colors.text.primary,
  },
  north: {
    top: spacing.sm,
  },
  east: {
    right: spacing.sm,
  },
  south: {
    bottom: spacing.sm,
  },
  west: {
    left: spacing.sm,
  },
  arrowContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    width: 4,
    height: '40%',
    position: 'absolute',
    alignItems: 'center',
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    position: 'absolute',
    top: 0,
  },
  arrowShaft: {
    width: 4,
    height: '60%',
    backgroundColor: colors.primary.main,
    marginTop: 30,
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary.main,
    position: 'absolute',
  },
  distanceContainer: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  distanceLabel: {
    ...typography.body2,
    opacity: 0.7,
    marginBottom: spacing.xs,
  },
  distanceValue: {
    ...typography.h5,
    fontWeight: '700',
  },
  refreshButton: {
    marginTop: spacing.md,
  },
});

