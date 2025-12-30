/**
 * Surah Library Screen
 *
 * Browse and explore surahs with translations, transliterations, and audio.
 */

import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Card, Title, Paragraph, Searchbar, Chip} from 'react-native-paper';
import {useTheme} from '@context/ThemeContext';
import {spacing, typography} from '@constants/theme';
import {useNavigation} from '@react-navigation/native';
import {getSurah, COMMON_SURAHS, getSurahInfo} from '@services/recitation/quranicTextService';
import {islamicSpacing, islamicShadows, islamicBorderRadius} from '@constants/islamicTheme';
import {LoadingState, ErrorState} from '@components/index';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export const SurahLibraryScreen: React.FC = () => {
  const {currentTheme} = useTheme();
  const navigation = useNavigation();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'meccan' | 'medinan' | 'common'>('all');

  useEffect(() => {
    loadSurahs();
  }, []);

  useEffect(() => {
    if (surahs.length > 0) {
      filterSurahs();
    }
  }, [searchQuery, selectedFilter, surahs]);

  const loadSurahs = async () => {
    try {
      setLoading(true);
      // Get all Juz Amma surahs (last 37 surahs - surahs 78-114)
      // COMMON_SURAHS already contains all 37 surahs from Juz Amma
      const surahsList: Surah[] = await Promise.all(
        COMMON_SURAHS.map(async (surah: any) => {
          try {
            // Try to get surah info to get accurate ayah count and revelation type
            const surahInfo = await getSurahInfo(surah.number).catch(() => null);
            return {
              number: surah.number,
              name: surahInfo?.name || surah.name || `Surah ${surah.number}`,
              englishName: surahInfo?.englishName || surah.englishName || `Surah ${surah.number}`,
              englishNameTranslation: surah.englishNameTranslation || '',
              numberOfAyahs: surahInfo?.numberOfAyahs || 0,
              revelationType: 'Meccan' as 'Meccan' | 'Medinan', // Most Juz Amma surahs are Meccan
            };
          } catch {
            // Fallback if API call fails
            return {
              number: surah.number,
              name: surah.name || `Surah ${surah.number}`,
              englishName: surah.englishName || `Surah ${surah.number}`,
              englishNameTranslation: surah.englishNameTranslation || '',
              numberOfAyahs: 0,
              revelationType: 'Meccan' as 'Meccan' | 'Medinan',
            };
          }
        }),
      );

      setSurahs(surahsList);
      setFilteredSurahs(surahsList);
      setError(null);
    } catch (err) {
      console.error('Error loading surahs:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load surahs. Please try again later.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filterSurahs = useCallback(() => {
    let filtered = [...surahs];

    // Apply filter
    if (selectedFilter === 'meccan') {
      filtered = filtered.filter(s => s.revelationType === 'Meccan');
    } else if (selectedFilter === 'medinan') {
      filtered = filtered.filter(s => s.revelationType === 'Medinan');
    } else if (selectedFilter === 'common') {
      const commonNumbers = COMMON_SURAHS.map((s: any) => s.number);
      filtered = filtered.filter((s: Surah) => commonNumbers.includes(s.number));
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        surah =>
          surah.name.toLowerCase().includes(query) ||
          surah.englishName.toLowerCase().includes(query) ||
          surah.englishNameTranslation.toLowerCase().includes(query) ||
          surah.number.toString().includes(query),
      );
    }

    setFilteredSurahs(filtered);
  }, [surahs, selectedFilter, searchQuery]);

  const handleSurahPress = useCallback(async (surahNumber: number) => {
    try {
      // Navigate to surah practice screen
      (navigation as any).navigate('SurahPractice', {
        surahNumber,
      });
    } catch (error) {
      console.error('Error navigating to surah:', error);
      // Show user-friendly error message
      Alert.alert(
        'Navigation Error',
        'Unable to open surah practice. Please try again.',
      );
    }
  }, [navigation]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingState
          message="Loading surahs..."
          fullScreen={true}
          size="large"
        />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}>
          <ErrorState
            title="Unable to Load Surahs"
            message={error}
            onRetry={loadSurahs}
            retryLabel="Retry"
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: currentTheme.colors.text}]}>
            Surah Library
          </Text>
          <Text style={[styles.subtitle, {color: currentTheme.colors.text}]}>
            Explore the Quran with translations and audio
          </Text>
        </View>

        {/* Search Bar */}
        <Searchbar
          placeholder="Search surahs..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          <Chip
            selected={selectedFilter === 'all'}
            onPress={() => setSelectedFilter('all')}
            style={styles.chip}
            selectedColor={currentTheme.colors.primary}>
            All
          </Chip>
          <Chip
            selected={selectedFilter === 'common'}
            onPress={() => setSelectedFilter('common')}
            style={styles.chip}
            selectedColor={currentTheme.colors.primary}>
            Common
          </Chip>
          <Chip
            selected={selectedFilter === 'meccan'}
            onPress={() => setSelectedFilter('meccan')}
            style={styles.chip}
            selectedColor={currentTheme.colors.primary}>
            Meccan
          </Chip>
          <Chip
            selected={selectedFilter === 'medinan'}
            onPress={() => setSelectedFilter('medinan')}
            style={styles.chip}
            selectedColor={currentTheme.colors.primary}>
            Medinan
          </Chip>
        </View>

        {/* Surahs List */}
        {filteredSurahs.length === 0 ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={[styles.emptyText, {color: currentTheme.colors.text}]}>
                No surahs found. Try a different search or filter.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          filteredSurahs.map(surah => (
            <TouchableOpacity
              key={surah.number}
              onPress={() => handleSurahPress(surah.number)}
              activeOpacity={0.7}>
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.surahHeader}>
                    <View style={styles.surahNumber}>
                      <Text
                        style={[
                          styles.surahNumberText,
                          {color: currentTheme.colors.primary},
                        ]}>
                        {surah.number}
                      </Text>
                    </View>
                    <View style={styles.surahInfo}>
                      <Title style={styles.surahName}>{surah.name}</Title>
                      <Paragraph style={styles.surahEnglishName}>
                        {surah.englishName}
                      </Paragraph>
                      {surah.englishNameTranslation && (
                        <Paragraph style={styles.surahTranslation}>
                          {surah.englishNameTranslation}
                        </Paragraph>
                      )}
                      <View style={styles.surahMeta}>
                        <Chip
                          icon="book-open-page-variant"
                          style={styles.metaChip}
                          textStyle={styles.metaChipText}>
                          {surah.numberOfAyahs} Ayahs
                        </Chip>
                        <Chip
                          icon="map-marker"
                          style={styles.metaChip}
                          textStyle={styles.metaChipText}>
                          {surah.revelationType}
                        </Chip>
                      </View>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body2,
    opacity: 0.7,
  },
  searchbar: {
    marginBottom: spacing.md,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  chip: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  card: {
    marginBottom: spacing.md,
    ...islamicShadows.medium,
    borderRadius: islamicBorderRadius.large,
    backgroundColor: '#FFFFFF',
  },
  surahHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  surahNumber: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    ...islamicShadows.small,
  },
  surahNumberText: {
    ...typography.h4,
    fontWeight: 'bold',
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  surahEnglishName: {
    ...typography.body1,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  surahTranslation: {
    ...typography.body2,
    opacity: 0.7,
    marginBottom: spacing.sm,
  },
  surahMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  metaChip: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
    height: 28,
  },
  metaChipText: {
    fontSize: 12,
  },
  emptyText: {
    ...typography.body1,
    textAlign: 'center',
    padding: spacing.lg,
  },
});
