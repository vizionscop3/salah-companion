/**
 * Prayer Times Screen - Material Neubrutomorphism
 *
 * Displays all prayer times for the day with Material Neubrutomorphism design.
 * Features hero section, prayer tabs, and prayer list.
 */

import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ActivityIndicator} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography, colors, borderRadius, brutalistShadows} from '@constants/theme';
import {formatPrayerTime} from '@services/prayer/prayerTimeService';
import {usePrayerTimes} from '@hooks/usePrayerTimes';
import {NeubrutalCard, NeubrutalButton} from '@components/index';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const PRAYER_RAKAHS: Record<string, number> = {
  fajr: 2,
  dhuhr: 4,
  asr: 4,
  maghrib: 3,
  isha: 4,
};

const PRAYER_ICONS: Record<string, string> = {
  fajr: '🌙',
  dhuhr: '☀️',
  asr: '🌤️',
  maghrib: '🌅',
  isha: '🌙',
  jummah: '🕌',
};

const PRAYER_COLORS: Record<string, string> = {
  fajr: colors.accent.purple,
  dhuhr: colors.accent.gold,
  asr: colors.accent.rose,
  maghrib: colors.accent.rose,
  isha: colors.accent.blue,
  jummah: colors.primary.main,
};

type TabType = 'Prayer' | 'Adhaan' | 'Iqamah' | 'Alarm';

export const PrayerTimesScreen: React.FC = () => {
  const {currentTheme} = useTheme();
  const {prayerTimes, nextPrayer, loading, error, refresh} = usePrayerTimes();
  const [activeTab, setActiveTab] = useState<TabType>('Prayer');

  if (loading && !prayerTimes) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Calculating prayer times...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !prayerTimes) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <NeubrutalButton title="Retry" onPress={refresh} size="small" />
        </View>
      </SafeAreaView>
    );
  }

  if (!prayerTimes) {
    return null;
  }

  // Validate prayer times are valid Date objects
  const isValidDate = (date: Date | null | undefined): date is Date => {
    return date instanceof Date && !isNaN(date.getTime());
  };

  // Filter out invalid prayer times
  const validPrayers = [
    {name: 'Fajr', key: 'fajr' as const, time: prayerTimes.fajr},
    {name: 'Dhuhr', key: 'dhuhr' as const, time: prayerTimes.dhuhr},
    {name: 'Asr', key: 'asr' as const, time: prayerTimes.asr},
    {name: 'Maghrib', key: 'maghrib' as const, time: prayerTimes.maghrib},
    {name: 'Isha', key: 'isha' as const, time: prayerTimes.isha},
  ].filter(prayer => isValidDate(prayer.time));

  // If no valid prayers, show error
  if (validPrayers.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Invalid prayer times. Please refresh.</Text>
          <NeubrutalButton title="Retry" onPress={refresh} size="small" />
        </View>
      </SafeAreaView>
    );
  }

  const prayers = validPrayers;

  // Calculate Iqamah time (example: 20 minutes after Adhan)
  const calculateIqamah = (adhanTime: Date) => {
    if (!isValidDate(adhanTime)) {
      return '--:--';
    }
    const iqamahTime = new Date(adhanTime.getTime() + 20 * 60 * 1000);
    return formatPrayerTime(iqamahTime);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}>
        {/* Hero Section */}
        <NeubrutalCard style={styles.heroCard} borderWidth={0} shadowSize="large">
          <LinearGradient
            colors={[colors.surface.secondary, colors.surface.tertiary]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.heroGradient}>
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <Text style={styles.locationName}>Al-aksa</Text>
              <View style={styles.sunTimes}>
                <View style={styles.sunTime}>
                  <MaterialCommunityIcons name="weather-sunny" size={16} color={colors.accent.gold} />
                  <Text style={styles.sunTimeText}>
                    Sunrise: {prayerTimes.sunrise && prayerTimes.sunrise instanceof Date && !isNaN(prayerTimes.sunrise.getTime()) 
                      ? formatPrayerTime(prayerTimes.sunrise) 
                      : '--:--'}
                  </Text>
                </View>
                <View style={styles.sunTime}>
                  <MaterialCommunityIcons name="weather-night" size={16} color={colors.accent.blue} />
                  <Text style={styles.sunTimeText}>
                    Sunset: {prayerTimes.maghrib && prayerTimes.maghrib instanceof Date && !isNaN(prayerTimes.maghrib.getTime())
                      ? formatPrayerTime(prayerTimes.maghrib)
                      : '--:--'}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Tab Navigation */}
          <View style={styles.tabsContainer}>
            {(['Prayer', 'Adhaan', 'Iqamah', 'Alarm'] as TabType[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.tabTextActive,
                  ]}>
                  {tab}
                </Text>
                {activeTab === tab && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            ))}
          </View>
        </NeubrutalCard>

        {/* Prayer Times List */}
        <View style={styles.prayerList}>
          {prayers.map((prayer, index) => {
            // Extra safety check - skip if time is invalid
            if (!prayer.time || !(prayer.time instanceof Date) || isNaN(prayer.time.getTime())) {
              return null;
            }
            const isNext = nextPrayer?.prayer === prayer.key;
            const isPassed = prayer.time < new Date();
            const prayerColor = PRAYER_COLORS[prayer.key];
            const prayerIcon = PRAYER_ICONS[prayer.key];

            return (
              <NeubrutalCard
                key={prayer.key}
                style={[
                  styles.prayerItem,
                  isNext && styles.prayerItemActive,
                ]}
                shadowSize="medium"
                onPress={undefined}>
                <View style={styles.prayerItemContent}>
                  <View style={[styles.prayerIcon, {borderColor: prayerColor}]}>
                    <Text style={styles.prayerIconEmoji}>{prayerIcon}</Text>
                  </View>

                  <View style={styles.prayerInfo}>
                    <Text style={styles.prayerName}>{prayer.name}</Text>
                    <View style={styles.prayerTimesRow}>
                      <Text style={[styles.time, styles.adhanTime]}>
                        {formatPrayerTime(prayer.time)}
                      </Text>
                      <Text style={styles.timeSeparator}>•</Text>
                      <Text style={[styles.time, styles.iqamahTime]}>
                        {calculateIqamah(prayer.time)}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.prayerAction}>
                    <MaterialCommunityIcons
                      name="volume-high"
                      size={20}
                      color={colors.text.secondary}
                    />
                  </TouchableOpacity>
                </View>
                {isNext && <View style={[styles.activeIndicator, {backgroundColor: prayerColor}]} />}
              </NeubrutalCard>
            );
          })}
        </View>
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body1,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    ...typography.body1,
    color: colors.error.main,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  heroCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  heroGradient: {
    height: 240,
    position: 'relative',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 35, 50, 0.8)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    padding: spacing.lg,
    justifyContent: 'flex-end',
    height: '100%',
  },
  locationName: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    fontFamily: 'Poppins',
  },
  sunTimes: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  sunTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sunTimeText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface.tertiary,
    borderTopWidth: 2,
    borderTopColor: 'rgba(61, 217, 197, 0.2)',
  },
  tab: {
    flex: 1,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabActive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    ...typography.body2,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary.main,
    ...brutalistShadows.small,
  },
  prayerList: {
    gap: spacing.sm,
  },
  prayerItem: {
    padding: spacing.md,
    backgroundColor: colors.surface.secondary,
    borderColor: colors.border.primary,
  },
  prayerItemActive: {
    backgroundColor: `rgba(61, 217, 197, 0.1)`,
    borderColor: colors.primary.main,
  },
  prayerItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  prayerIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    backgroundColor: colors.surface.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    ...brutalistShadows.small,
  },
  prayerIconEmoji: {
    fontSize: 24,
  },
  prayerInfo: {
    flex: 1,
  },
  prayerName: {
    ...typography.h6,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
    fontFamily: 'Poppins',
  },
  prayerTimesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  time: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  adhanTime: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  iqamahTime: {
    color: colors.text.secondary,
  },
  timeSeparator: {
    color: colors.text.muted,
  },
  prayerAction: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface.elevated,
    borderWidth: 2,
    borderColor: 'rgba(61, 217, 197, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderRadius: borderRadius.sm,
  },
});
