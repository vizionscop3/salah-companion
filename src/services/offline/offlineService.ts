/**
 * Offline Service
 *
 * Manages offline mode capabilities including caching and offline-first operations.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
// @ts-ignore - NetInfo types may not be available
import NetInfo from '@react-native-community/netinfo';

export interface OfflineCache {
  surahs: string[]; // Cached surah numbers
  audioFiles: string[]; // Cached audio file paths
  lastSync: Date | null;
  cacheSize: number; // In bytes
}

/**
 * Check if device is online
 */
export async function isOnline(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  } catch (error) {
    console.error('Error checking network status:', error);
    return false; // Assume offline on error
  }
}

/**
 * Get offline cache status
 */
export async function getOfflineCacheStatus(): Promise<OfflineCache> {
  try {
    const cacheKey = '@salah_companion:offline_cache';
    const cacheData = await AsyncStorage.getItem(cacheKey);
    
    if (cacheData) {
      const parsed = JSON.parse(cacheData);
      return {
        ...parsed,
        lastSync: parsed.lastSync ? new Date(parsed.lastSync) : null,
      };
    }

    return {
      surahs: [],
      audioFiles: [],
      lastSync: null,
      cacheSize: 0,
    };
  } catch (error) {
    console.error('Error getting offline cache status:', error);
    return {
      surahs: [],
      audioFiles: [],
      lastSync: null,
      cacheSize: 0,
    };
  }
}

/**
 * Mark surah as cached
 */
export async function markSurahCached(surahNumber: number): Promise<void> {
  try {
    const cache = await getOfflineCacheStatus();
    if (!cache.surahs.includes(surahNumber.toString())) {
      cache.surahs.push(surahNumber.toString());
      cache.lastSync = new Date();
      await saveOfflineCache(cache);
    }
  } catch (error) {
    console.error('Error marking surah as cached:', error);
  }
}

/**
 * Mark audio file as cached
 */
export async function markAudioCached(filePath: string): Promise<void> {
  try {
    const cache = await getOfflineCacheStatus();
    if (!cache.audioFiles.includes(filePath)) {
      cache.audioFiles.push(filePath);
      cache.lastSync = new Date();
      await saveOfflineCache(cache);
    }
  } catch (error) {
    console.error('Error marking audio as cached:', error);
  }
}

/**
 * Check if surah is cached
 */
export async function isSurahCached(surahNumber: number): Promise<boolean> {
  try {
    const cache = await getOfflineCacheStatus();
    return cache.surahs.includes(surahNumber.toString());
  } catch (error) {
    console.error('Error checking surah cache:', error);
    return false;
  }
}

/**
 * Check if audio file is cached
 */
export async function isAudioCached(filePath: string): Promise<boolean> {
  try {
    const cache = await getOfflineCacheStatus();
    return cache.audioFiles.includes(filePath);
  } catch (error) {
    console.error('Error checking audio cache:', error);
    return false;
  }
}

/**
 * Clear offline cache
 */
export async function clearOfflineCache(): Promise<void> {
  try {
    const cacheKey = '@salah_companion:offline_cache';
    await AsyncStorage.removeItem(cacheKey);
  } catch (error) {
    console.error('Error clearing offline cache:', error);
    throw error;
  }
}

/**
 * Get cache size estimate
 */
export async function getCacheSizeEstimate(): Promise<number> {
  try {
    const cache = await getOfflineCacheStatus();
    // Rough estimate: each surah ~50KB, each audio file ~200KB
    const surahSize = cache.surahs.length * 50 * 1024;
    const audioSize = cache.audioFiles.length * 200 * 1024;
    return surahSize + audioSize;
  } catch (error) {
    console.error('Error estimating cache size:', error);
    return 0;
  }
}

/**
 * Save offline cache
 */
async function saveOfflineCache(cache: OfflineCache): Promise<void> {
  try {
    const cacheKey = '@salah_companion:offline_cache';
    const cacheSize = await getCacheSizeEstimate();
    const cacheToSave = {
      ...cache,
      cacheSize,
      lastSync: cache.lastSync?.toISOString() || null,
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheToSave));
  } catch (error) {
    console.error('Error saving offline cache:', error);
    throw error;
  }
}

/**
 * Enable offline mode (pre-download essential content)
 */
export async function enableOfflineMode(): Promise<void> {
  try {
    // Download essential surahs (Al-Fatiha, Al-Ikhlas, Al-Falaq, An-Nas)
    const essentialSurahs = [1, 112, 113, 114];
    
    for (const surahNumber of essentialSurahs) {
      try {
        // This would trigger actual download in production
        await markSurahCached(surahNumber);
      } catch (error) {
        console.error(`Error caching surah ${surahNumber}:`, error);
      }
    }
  } catch (error) {
    console.error('Error enabling offline mode:', error);
    throw error;
  }
}

/**
 * Check if offline mode is enabled
 */
export async function isOfflineModeEnabled(): Promise<boolean> {
  try {
    const cache = await getOfflineCacheStatus();
    return cache.surahs.length > 0;
  } catch (error) {
    console.error('Error checking offline mode:', error);
    return false;
  }
}

