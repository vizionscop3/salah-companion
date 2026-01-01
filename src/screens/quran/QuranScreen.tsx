/**
 * Quran Screen - Material Neubrutomorphism
 *
 * Full Quran reading experience with Arabic text, transliteration, and English translation.
 * Users can read the complete Quran from beginning to end.
 */

import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '@context/ThemeContext';
import {
  spacing,
  typography,
  colors,
  borderRadius,
  brutalistShadows,
} from '@constants/theme';
import {islamicTypography} from '@constants/islamicTheme';
import {getSurah, getAyahTransliteration, getAyahTranslations} from '@services/recitation/quranicTextService';
import {
  getInternetArchiveSurah,
  isInternetArchiveAvailable,
} from '@services/quran/internetArchiveQuranService';
import {NeubrutalCard} from '@components/index';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface AyahDisplay {
  number: number;
  arabic: string;
  transliteration: string;
  translation: string;
}

interface SurahDisplay {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  ayahs: AyahDisplay[];
  loaded: boolean;
}

const TOTAL_SURAHS = 114;

export const QuranScreen: React.FC = () => {
  const {currentTheme} = useTheme();
  const [surahs, setSurahs] = useState<Map<number, SurahDisplay>>(new Map());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentSurah, setCurrentSurah] = useState<number>(1);
  const [loadingSurah, setLoadingSurah] = useState<number | null>(null);

  useEffect(() => {
    loadSurah(currentSurah);
  }, [currentSurah]);

  const loadSurah = async (surahNumber: number) => {
    // Check if already loaded
    if (surahs.has(surahNumber) && surahs.get(surahNumber)?.loaded) {
      return;
    }

    try {
      setLoadingSurah(surahNumber);
      
      // Try Internet Archive first (has Tajwid, transliteration, and translation)
      const archiveAvailable = await isInternetArchiveAvailable();
      if (archiveAvailable) {
        try {
          const archiveSurah = await getInternetArchiveSurah(surahNumber);
          if (archiveSurah && archiveSurah.ayahs.length > 0) {
            const surahDisplay: SurahDisplay = {
              number: archiveSurah.number,
              name: archiveSurah.name,
              englishName: archiveSurah.englishName,
              englishNameTranslation: archiveSurah.englishName,
              numberOfAyahs: archiveSurah.ayahs.length,
              revelationType: 'Meccan', // Default, can be enhanced later
              ayahs: archiveSurah.ayahs.map((ayah) => ({
                number: ayah.ayah,
                arabic: ayah.arabic,
                transliteration: ayah.transliteration,
                translation: ayah.translation,
              })),
              loaded: true,
            };

            setSurahs((prev) => {
              const updated = new Map(prev);
              updated.set(surahNumber, surahDisplay);
              return updated;
            });
            
            if (__DEV__) {
              console.log(`✅ Loaded surah ${surahNumber} from Internet Archive`);
            }
            return;
          }
        } catch (archiveError) {
          if (__DEV__) {
            console.warn(`Internet Archive failed for surah ${surahNumber}, using fallback:`, archiveError);
          }
        }
      }
      
      // Fallback to existing service
      const surahData = await getSurah(surahNumber);
      
      // Fetch transliteration and translation for each ayah
      const ayahsWithData: AyahDisplay[] = await Promise.all(
        surahData.ayahs.map(async (ayah) => {
          const [transliteration, translations] = await Promise.all([
            getAyahTransliteration(surahNumber, ayah.numberInSurah).catch(() => ''),
            getAyahTranslations(surahNumber, ayah.numberInSurah, 'en').catch(() => []),
          ]);

          return {
            number: ayah.numberInSurah,
            arabic: ayah.text,
            transliteration: transliteration || '',
            translation: translations.length > 0 ? translations[0].text : '',
          };
        }),
      );

      const surahDisplay: SurahDisplay = {
        number: surahData.number,
        name: surahData.name,
        englishName: surahData.englishName,
        englishNameTranslation: surahData.englishNameTranslation,
        numberOfAyahs: surahData.numberOfAyahs,
        revelationType: surahData.revelationType,
        ayahs: ayahsWithData,
        loaded: true,
      };

      setSurahs((prev) => {
        const updated = new Map(prev);
        updated.set(surahNumber, surahDisplay);
        return updated;
      });
      
      if (__DEV__) {
        console.log(`✅ Loaded surah ${surahNumber} from fallback service`);
      }
    } catch (error) {
      if (__DEV__) {
        console.error(`Error loading surah ${surahNumber}:`, error);
      }
    } finally {
      setLoadingSurah(null);
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Reload current surah
    setSurahs((prev) => {
      const updated = new Map(prev);
      updated.delete(currentSurah);
      return updated;
    });
    await loadSurah(currentSurah);
    setRefreshing(false);
  }, [currentSurah]);

  const navigateToSurah = (surahNumber: number) => {
    if (surahNumber >= 1 && surahNumber <= TOTAL_SURAHS) {
      setCurrentSurah(surahNumber);
      loadSurah(surahNumber);
    }
  };

  const currentSurahData = surahs.get(currentSurah);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background.default}]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>The Holy Quran</Text>
        <Text style={styles.headerSubtitle}>
          {currentSurahData
            ? `${currentSurahData.englishName} (${currentSurahData.name})`
            : 'Loading...'}
        </Text>
      </View>

      {/* Surah Navigation */}
      <View style={styles.navigationContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.surahList}>
          {Array.from({length: TOTAL_SURAHS}, (_, i) => i + 1).map((num) => (
            <TouchableOpacity
              key={num}
              onPress={() => navigateToSurah(num)}
              style={[
                styles.surahButton,
                currentSurah === num && styles.surahButtonActive,
              ]}>
              <Text
                style={[
                  styles.surahButtonText,
                  currentSurah === num && styles.surahButtonTextActive,
                ]}>
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {loadingSurah === currentSurah && !currentSurahData ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={styles.loadingText}>Loading Surah...</Text>
          </View>
        ) : currentSurahData ? (
          <View style={styles.surahContainer}>
            {/* Surah Header Card */}
            <NeubrutalCard style={styles.surahHeaderCard}>
              <View style={styles.surahHeader}>
                <View style={styles.surahHeaderLeft}>
                  <Text style={styles.surahNumber}>Surah {currentSurahData.number}</Text>
                  <Text style={styles.surahNameArabic}>{currentSurahData.name}</Text>
                  <Text style={styles.surahNameEnglish}>
                    {currentSurahData.englishName}
                  </Text>
                  <Text style={styles.surahNameTranslation}>
                    {currentSurahData.englishNameTranslation}
                  </Text>
                </View>
                <View style={styles.surahHeaderRight}>
                  <View
                    style={[
                      styles.revelationBadge,
                      currentSurahData.revelationType === 'Meccan'
                        ? styles.revelationBadgeMeccan
                        : styles.revelationBadgeMedinan,
                    ]}>
                    <Text style={styles.revelationBadgeText}>
                      {currentSurahData.revelationType}
                    </Text>
                  </View>
                  <Text style={styles.ayahCount}>
                    {currentSurahData.numberOfAyahs} Ayahs
                  </Text>
                </View>
              </View>
            </NeubrutalCard>

            {/* Ayahs */}
            {currentSurahData.ayahs.map((ayah) => (
              <NeubrutalCard key={ayah.number} style={styles.ayahCard}>
                <View style={styles.ayahHeader}>
                  <View style={styles.ayahNumberBadge}>
                    <Text style={styles.ayahNumberText}>{ayah.number}</Text>
                  </View>
                </View>

                {/* Arabic Text */}
                <Text style={styles.arabicText}>{ayah.arabic}</Text>

                {/* Transliteration */}
                {ayah.transliteration && (
                  <View style={styles.transliterationContainer}>
                    <Text style={styles.transliterationLabel}>Transliteration:</Text>
                    <Text style={styles.transliterationText}>
                      {ayah.transliteration}
                    </Text>
                  </View>
                )}

                {/* Translation */}
                {ayah.translation && (
                  <View style={styles.translationContainer}>
                    <Text style={styles.translationLabel}>Translation:</Text>
                    <Text style={styles.translationText}>{ayah.translation}</Text>
                  </View>
                )}
              </NeubrutalCard>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="book-open-variant"
              size={64}
              color={colors.text.secondary}
            />
            <Text style={styles.emptyText}>Select a Surah to begin reading</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface.secondary,
    borderBottomWidth: 3,
    borderBottomColor: colors.primary.main,
    ...brutalistShadows.medium,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  navigationContainer: {
    backgroundColor: colors.surface.primary,
    borderBottomWidth: 2,
    borderBottomColor: colors.border.primary,
    paddingVertical: spacing.sm,
  },
  surahList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  surahButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface.secondary,
    borderWidth: 2,
    borderColor: colors.border.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
    ...brutalistShadows.small,
  },
  surahButtonActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.dark,
  },
  surahButtonText: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '600',
  },
  surahButtonTextActive: {
    color: colors.primary.contrastText,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body1,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  surahContainer: {
    padding: spacing.md,
  },
  surahHeaderCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  surahHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  surahHeaderLeft: {
    flex: 1,
  },
  surahHeaderRight: {
    alignItems: 'flex-end',
  },
  surahNumber: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  surahNameArabic: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'right',
    fontFamily: islamicTypography.arabic.quranic || 'Amiri', // Arabic font
  },
  surahNameEnglish: {
    ...typography.h3,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  surahNameTranslation: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  revelationBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
    borderWidth: 2,
    ...brutalistShadows.small,
  },
  revelationBadgeMeccan: {
    backgroundColor: colors.success.light,
    borderColor: colors.success.main,
  },
  revelationBadgeMedinan: {
    backgroundColor: colors.warning.light,
    borderColor: colors.warning.main,
  },
  revelationBadgeText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  ayahCount: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  ayahCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  ayahHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.md,
  },
  ayahNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary.dark,
    ...brutalistShadows.small,
  },
  ayahNumberText: {
    ...typography.caption,
    color: colors.primary.contrastText,
    fontWeight: '700',
  },
  arabicText: {
    ...typography.h3,
    color: colors.text.primary,
    textAlign: 'right',
    marginBottom: spacing.md,
    lineHeight: 36,
    fontFamily: islamicTypography.arabic.quranic || 'Amiri', // Arabic font
  },
  transliterationContainer: {
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.surface.secondary,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border.secondary,
  },
  transliterationLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  transliterationText: {
    ...typography.body1,
    color: colors.text.primary,
    fontStyle: 'italic',
  },
  translationContainer: {
    padding: spacing.sm,
    backgroundColor: colors.surface.secondary,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border.secondary,
  },
  translationLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  translationText: {
    ...typography.body1,
    color: colors.text.primary,
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body1,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
});

