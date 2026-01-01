/**
 * Location Selection Screen - Material Neubrutomorphism
 *
 * Allows users to manually select their state and city for prayer time calculations.
 * This is shown when location permission is denied or unavailable.
 */

import React, {useState, useMemo} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography, colors, borderRadius, brutalistShadows} from '@constants/theme';
import {useNavigation} from '@react-navigation/native';
import {NeubrutalCard, NeubrutalButton} from '@components/index';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MANUAL_LOCATION_STORAGE_KEY = '@salah_companion:manual_location';

export interface ManualLocation {
  state: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

// Major US States and Cities with coordinates and timezones
const LOCATION_DATA: Record<string, {cities: Record<string, {lat: number; lng: number; tz: string}>}> = {
  'Alabama': {
    cities: {
      'Birmingham': {lat: 33.5207, lng: -86.8025, tz: 'America/Chicago'},
      'Montgomery': {lat: 32.3668, lng: -86.3000, tz: 'America/Chicago'},
      'Mobile': {lat: 30.6954, lng: -88.0399, tz: 'America/Chicago'},
    },
  },
  'Alaska': {
    cities: {
      'Anchorage': {lat: 61.2181, lng: -149.9003, tz: 'America/Anchorage'},
      'Fairbanks': {lat: 64.8378, lng: -147.7164, tz: 'America/Anchorage'},
    },
  },
  'Arizona': {
    cities: {
      'Phoenix': {lat: 33.4484, lng: -112.0740, tz: 'America/Phoenix'},
      'Tucson': {lat: 32.2226, lng: -110.9747, tz: 'America/Phoenix'},
    },
  },
  'California': {
    cities: {
      'Los Angeles': {lat: 34.0522, lng: -118.2437, tz: 'America/Los_Angeles'},
      'San Francisco': {lat: 37.7749, lng: -122.4194, tz: 'America/Los_Angeles'},
      'San Diego': {lat: 32.7157, lng: -117.1611, tz: 'America/Los_Angeles'},
      'Sacramento': {lat: 38.5816, lng: -121.4944, tz: 'America/Los_Angeles'},
      'Oakland': {lat: 37.8044, lng: -122.2712, tz: 'America/Los_Angeles'},
    },
  },
  'Colorado': {
    cities: {
      'Denver': {lat: 39.7392, lng: -104.9903, tz: 'America/Denver'},
      'Colorado Springs': {lat: 38.8339, lng: -104.8214, tz: 'America/Denver'},
    },
  },
  'Connecticut': {
    cities: {
      'Hartford': {lat: 41.7658, lng: -72.6734, tz: 'America/New_York'},
      'New Haven': {lat: 41.3083, lng: -72.9279, tz: 'America/New_York'},
    },
  },
  'Florida': {
    cities: {
      'Miami': {lat: 25.7617, lng: -80.1918, tz: 'America/New_York'},
      'Tampa': {lat: 27.9506, lng: -82.4572, tz: 'America/New_York'},
      'Orlando': {lat: 28.5383, lng: -81.3792, tz: 'America/New_York'},
      'Jacksonville': {lat: 30.3322, lng: -81.6557, tz: 'America/New_York'},
    },
  },
  'Georgia': {
    cities: {
      'Atlanta': {lat: 33.7490, lng: -84.3880, tz: 'America/New_York'},
      'Savannah': {lat: 32.0809, lng: -81.0912, tz: 'America/New_York'},
    },
  },
  'Illinois': {
    cities: {
      'Chicago': {lat: 41.8781, lng: -87.6298, tz: 'America/Chicago'},
      'Springfield': {lat: 39.7817, lng: -89.6501, tz: 'America/Chicago'},
    },
  },
  'Massachusetts': {
    cities: {
      'Boston': {lat: 42.3601, lng: -71.0589, tz: 'America/New_York'},
      'Worcester': {lat: 42.2626, lng: -71.8023, tz: 'America/New_York'},
    },
  },
  'Michigan': {
    cities: {
      'Detroit': {lat: 42.3314, lng: -83.0458, tz: 'America/Detroit'},
      'Grand Rapids': {lat: 42.9634, lng: -85.6681, tz: 'America/Detroit'},
    },
  },
  'New Jersey': {
    cities: {
      'Newark': {lat: 40.7357, lng: -74.1724, tz: 'America/New_York'},
      'Jersey City': {lat: 40.7178, lng: -74.0431, tz: 'America/New_York'},
    },
  },
  'New York': {
    cities: {
      'New York City': {lat: 40.7128, lng: -74.0060, tz: 'America/New_York'},
      'Buffalo': {lat: 42.8864, lng: -78.8784, tz: 'America/New_York'},
      'Albany': {lat: 42.6526, lng: -73.7562, tz: 'America/New_York'},
    },
  },
  'North Carolina': {
    cities: {
      'Charlotte': {lat: 35.2271, lng: -80.8431, tz: 'America/New_York'},
      'Raleigh': {lat: 35.7796, lng: -78.6382, tz: 'America/New_York'},
      'Greensboro': {lat: 36.0726, lng: -79.7920, tz: 'America/New_York'},
    },
  },
  'Ohio': {
    cities: {
      'Columbus': {lat: 39.9612, lng: -82.9988, tz: 'America/New_York'},
      'Cleveland': {lat: 41.4993, lng: -81.6944, tz: 'America/New_York'},
      'Cincinnati': {lat: 39.1031, lng: -84.5120, tz: 'America/New_York'},
    },
  },
  'Pennsylvania': {
    cities: {
      'Philadelphia': {lat: 39.9526, lng: -75.1652, tz: 'America/New_York'},
      'Pittsburgh': {lat: 40.4406, lng: -79.9959, tz: 'America/New_York'},
    },
  },
  'Texas': {
    cities: {
      'Houston': {lat: 29.7604, lng: -95.3698, tz: 'America/Chicago'},
      'Dallas': {lat: 32.7767, lng: -96.7970, tz: 'America/Chicago'},
      'Austin': {lat: 30.2672, lng: -97.7431, tz: 'America/Chicago'},
      'San Antonio': {lat: 29.4241, lng: -98.4936, tz: 'America/Chicago'},
    },
  },
  'Washington': {
    cities: {
      'Seattle': {lat: 47.6062, lng: -122.3321, tz: 'America/Los_Angeles'},
      'Spokane': {lat: 47.6588, lng: -117.4260, tz: 'America/Los_Angeles'},
    },
  },
};

const STATES = Object.keys(LOCATION_DATA).sort();

export const LocationSelectionScreen: React.FC = () => {
  const {currentTheme} = useTheme();
  const navigation = useNavigation();
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  const availableCities = useMemo(() => {
    if (!selectedState || !LOCATION_DATA[selectedState]) {
      return [];
    }
    return Object.keys(LOCATION_DATA[selectedState].cities).sort();
  }, [selectedState]);

  const handleContinue = async () => {
    if (!selectedState || !selectedCity) {
      return;
    }

    const cityData = LOCATION_DATA[selectedState].cities[selectedCity];
    if (!cityData) {
      return;
    }

    const manualLocation: ManualLocation = {
      state: selectedState,
      city: selectedCity,
      latitude: cityData.lat,
      longitude: cityData.lng,
      timezone: cityData.tz,
    };

    // Store manual location
    await AsyncStorage.setItem(MANUAL_LOCATION_STORAGE_KEY, JSON.stringify(manualLocation));

    // Navigate back or to next screen
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Mark permissions as completed
      await AsyncStorage.setItem('@salah_companion:permissions_completed', 'true');
      (navigation as any).reset({
        index: 0,
        routes: [],
      });
    }
  };

  const handleSkip = async () => {
    // Allow skipping - app will use default location
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      await AsyncStorage.setItem('@salah_companion:permissions_completed', 'true');
      (navigation as any).reset({
        index: 0,
        routes: [],
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={60}
            color={colors.primary.main}
            style={styles.headerIcon}
          />
          <Text style={styles.title}>Select Your Location</Text>
          <Text style={styles.subtitle}>
            Choose your state and city to calculate accurate prayer times
          </Text>
        </View>

        {/* State Selection */}
        <NeubrutalCard style={styles.selectionCard} shadowSize="medium">
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="map"
                size={24}
                color={colors.primary.main}
              />
              <Text style={styles.cardTitle}>State</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.optionsScrollView}
              contentContainerStyle={styles.optionsContainer}>
              {STATES.map((state) => {
                const isSelected = selectedState === state;
                return (
                  <TouchableOpacity
                    key={state}
                    onPress={() => {
                      setSelectedState(state);
                      setSelectedCity(''); // Reset city when state changes
                    }}
                    style={[
                      styles.optionChip,
                      isSelected && styles.optionChipSelected,
                    ]}
                    activeOpacity={0.7}>
                    <Text
                      style={[
                        styles.optionChipText,
                        isSelected && styles.optionChipTextSelected,
                      ]}>
                      {state}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </NeubrutalCard>

        {/* City Selection */}
        {selectedState && availableCities.length > 0 && (
          <NeubrutalCard style={styles.selectionCard} shadowSize="medium">
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons
                  name="city"
                  size={24}
                  color={colors.primary.main}
                />
                <Text style={styles.cardTitle}>City</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.optionsScrollView}
                contentContainerStyle={styles.optionsContainer}>
                {availableCities.map((city) => {
                  const isSelected = selectedCity === city;
                  return (
                    <TouchableOpacity
                      key={city}
                      onPress={() => setSelectedCity(city)}
                      style={[
                        styles.optionChip,
                        isSelected && styles.optionChipSelected,
                      ]}
                      activeOpacity={0.7}>
                      <Text
                        style={[
                          styles.optionChipText,
                          isSelected && styles.optionChipTextSelected,
                        ]}>
                        {city}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </NeubrutalCard>
        )}

        {/* Selected Location Display */}
        {selectedState && selectedCity && (
          <NeubrutalCard style={styles.selectedCard} shadowSize="small">
            <View style={styles.selectedContent}>
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color={colors.success.main}
              />
              <View style={styles.selectedText}>
                <Text style={styles.selectedLabel}>Selected Location</Text>
                <Text style={styles.selectedValue}>
                  {selectedCity}, {selectedState}
                </Text>
              </View>
            </View>
          </NeubrutalCard>
        )}
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <NeubrutalButton
          title="Continue"
          onPress={handleContinue}
          variant="primary"
          size="large"
          disabled={!selectedState || !selectedCity}
          style={styles.footerButton}
        />
        <NeubrutalButton
          title="Skip for now"
          onPress={handleSkip}
          variant="secondary"
          size="large"
          style={styles.footerButton}
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
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  headerIcon: {
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  subtitle: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    fontFamily: 'Poppins',
  },
  selectionCard: {
    padding: spacing.lg,
    backgroundColor: colors.surface.secondary,
    borderColor: colors.primary.main,
    borderWidth: 3,
    borderRadius: borderRadius.lg,
  },
  cardContent: {
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  cardTitle: {
    ...typography.h5,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: 'Poppins',
  },
  optionsScrollView: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  optionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface.tertiary,
    borderWidth: 2,
    borderColor: colors.surface.tertiary,
    ...brutalistShadows.small,
  },
  optionChipSelected: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  optionChipText: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text.secondary,
    fontFamily: 'Poppins',
  },
  optionChipTextSelected: {
    fontWeight: '700',
    color: colors.background.default,
  },
  selectedCard: {
    padding: spacing.md,
    backgroundColor: colors.surface.secondary,
    borderColor: colors.success.main,
    borderWidth: 3,
    borderRadius: borderRadius.md,
  },
  selectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  selectedText: {
    flex: 1,
    gap: spacing.xs,
  },
  selectedLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontFamily: 'Poppins',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedValue: {
    ...typography.h6,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: 'Poppins',
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 3,
    borderTopColor: colors.border.primary,
    backgroundColor: colors.surface.secondary,
    gap: spacing.sm,
  },
  footerButton: {
    width: '100%',
  },
});

