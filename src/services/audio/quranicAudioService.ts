/**
 * Quranic Audio Service
 *
 * Fetches Quranic audio from multiple sources with local caching.
 * Priority order:
 * 1. Hugging Face datasets (Buraaq/quran-md-ayahs, Buraaq/quran-md-words)
 * 2. Al-Quran Cloud API
 * 3. Quran.com API
 */

import axios from 'axios';
import RNFS from 'react-native-fs';
import {Platform} from 'react-native';
import Sound from 'react-native-sound';
import {
  downloadAyahAudio,
  playAyahAudio as playHFAyahAudio,
  isAyahAudioCached,
  downloadWordAudio,
  playWordAudio as playHFWordAudio,
  isWordAudioCached,
} from './huggingFaceAudioService';

export type Reciter = 'alafasy' | 'abdul_basit' | 'mishary' | 'saad_al_ghamdi';

export interface AudioSource {
  name: string;
  apiUrl: string;
  reciterMapping: Record<Reciter, string>;
}

// Al-Quran Cloud API configuration
const AL_QURAN_CLOUD: AudioSource = {
  name: 'Al-Quran Cloud',
  apiUrl: 'https://api.alquran.cloud/v1',
  reciterMapping: {
    alafasy: 'ar.alafasy',
    abdul_basit: 'ar.abdulbasitmurattal',
    mishary: 'ar.mishaariraashid',
    saad_al_ghamdi: 'ar.saadsaalim',
  },
};

// Quran.com API configuration (alternative)
const QURAN_COM: AudioSource = {
  name: 'Quran.com',
  apiUrl: 'https://api.quran.com/api/v4',
  reciterMapping: {
    alafasy: '1', // Reciter ID
    abdul_basit: '2',
    mishary: '3',
    saad_al_ghamdi: '4',
  },
};

// Current API source (can be switched)
const CURRENT_SOURCE = AL_QURAN_CLOUD;

/**
 * Get cache directory path
 */
function getCacheDirectory(): string {
  return Platform.OS === 'ios'
    ? RNFS.DocumentDirectoryPath
    : RNFS.DocumentDirectoryPath;
}

/**
 * Get cached file path
 */
function getCachedFilePath(surah: number, ayah: number, reciter: Reciter): string {
  const cacheDir = getCacheDirectory();
  return `${cacheDir}/audio_${surah}_${ayah}_${reciter}.mp3`;
}

/**
 * Check if audio file is cached
 */
export async function isAudioCached(
  surah: number,
  ayah: number,
  reciter: Reciter,
): Promise<boolean> {
  const filePath = getCachedFilePath(surah, ayah, reciter);
  return RNFS.exists(filePath);
}

/**
 * Download and cache audio file
 * Tries Hugging Face dataset first, then falls back to APIs
 */
export async function downloadAndCacheAudio(
  surah: number,
  ayah: number,
  reciter: Reciter,
): Promise<string> {
  // First, try Hugging Face dataset
  try {
    const hfPath = await downloadAyahAudio(surah, ayah);
    if (hfPath) {
      return hfPath;
    }
  } catch (error) {
    console.warn('Hugging Face audio not available, trying API fallback:', error);
  }

  // Fallback to API-based download
  const cachedPath = getCachedFilePath(surah, ayah, reciter);

  // Check if already cached
  if (await isAudioCached(surah, ayah, reciter)) {
    return cachedPath;
  }

  try {
    // Get audio URL from API
    const audioUrl = await getAudioUrl(surah, ayah, reciter);

    // Download audio file
    const downloadResult = await RNFS.downloadFile({
      fromUrl: audioUrl,
      toFile: cachedPath,
    }).promise;

    if (downloadResult.statusCode === 200) {
      return cachedPath;
    } else {
      throw new Error(`Download failed with status ${downloadResult.statusCode}`);
    }
  } catch (error) {
    console.error('Error downloading audio:', error);
    throw error;
  }
}

/**
 * Get audio URL from API
 */
async function getAudioUrl(
  surah: number,
  ayah: number,
  reciter: Reciter,
): Promise<string> {
  const reciterId = CURRENT_SOURCE.reciterMapping[reciter];

  try {
    if (CURRENT_SOURCE.name === 'Al-Quran Cloud') {
      // Al-Quran Cloud API format: /ayah/{surah}:{ayah}/{reciter}
      // For full surah, we'll get the first ayah and can concatenate
      const response = await axios.get(
        `${CURRENT_SOURCE.apiUrl}/ayah/${surah}:${ayah}/${reciterId}`,
      );
      
      if (response.data && response.data.data && response.data.data.audio) {
        return response.data.data.audio;
      }
      throw new Error('Invalid API response format');
    } else {
      // Quran.com API format (alternative)
      // Note: This is a placeholder - verify actual API structure
      const response = await axios.get(
        `${CURRENT_SOURCE.apiUrl}/recitations/${reciterId}/by_ayah/${surah}_${ayah}`,
      );
      return response.data.audio_file?.url || response.data.audio_url;
    }
  } catch (error) {
    console.error(`Error fetching audio URL for ${surah}:${ayah}:`, error);
    throw new Error(`Failed to get audio URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get full surah audio (for Al-Fatiha, Al-Ikhlas, etc.)
 * Downloads all ayahs and combines or uses surah endpoint if available
 */
export async function getFullSurahAudio(
  surah: number,
  reciter: Reciter = 'alafasy',
): Promise<string> {
  // For now, we'll use the first ayah as a starting point
  // In production, you might want to:
  // 1. Use a surah-specific endpoint if available
  // 2. Download all ayahs and combine
  // 3. Use a pre-combined surah audio file
  
  const cachedPath = `${getCacheDirectory()}/surah_${surah}_${reciter}.mp3`;
  
  // Check if already cached
  if (await RNFS.exists(cachedPath)) {
    return cachedPath;
  }

  // Try to get surah audio (some APIs support this)
  try {
    // Al-Quran Cloud: Try surah endpoint
    const response = await axios.get(
      `${CURRENT_SOURCE.apiUrl}/surah/${surah}/${CURRENT_SOURCE.reciterMapping[reciter]}`,
    );
    
    if (response.data?.data?.ayahs?.[0]?.audio) {
      const audioUrl = response.data.data.ayahs[0].audio;
      const downloadResult = await RNFS.downloadFile({
        fromUrl: audioUrl,
        toFile: cachedPath,
      }).promise;

      if (downloadResult.statusCode === 200) {
        return cachedPath;
      }
    }
  } catch (error) {
    console.log('Surah endpoint not available, using first ayah:', error);
  }

  // Fallback: Use first ayah
  return downloadAndCacheAudio(surah, 1, reciter);
}

/**
 * Play cached audio file
 */
export async function playCachedAudio(
  filePath: string,
  volume: number = 80,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const sound = new Sound(filePath, '', (error) => {
      if (error) {
        console.error('Error loading audio:', error);
        reject(error);
        return;
      }

      sound.setVolume(volume / 100);
      sound.play((success) => {
        if (success) {
          resolve();
        } else {
          reject(new Error('Failed to play audio'));
        }
        sound.release();
      });
    });
  });
}

/**
 * Get audio for specific surah and ayah
 * Downloads and caches if needed, then plays
 * Tries Hugging Face first, then falls back to APIs
 */
export async function playQuranicAudio(
  surah: number,
  ayah: number,
  reciter: Reciter = 'alafasy',
  volume: number = 80,
): Promise<void> {
  try {
    // First, try Hugging Face dataset
    try {
      await playHFAyahAudio(surah, ayah, volume);
      return;
    } catch (error) {
      console.warn('Hugging Face audio playback failed, trying API fallback:', error);
    }

    // Fallback to API-based download and play
    const filePath = await downloadAndCacheAudio(surah, ayah, reciter);
    await playCachedAudio(filePath, volume);
  } catch (error) {
    console.error('Error playing Quranic audio:', error);
    throw error;
  }
}

/**
 * Pre-download and cache audio files
 */
export async function preCacheAudio(
  items: Array<{surah: number; ayah: number; reciter?: Reciter}>,
): Promise<void> {
  const promises = items.map(({surah, ayah, reciter = 'alafasy'}) =>
    downloadAndCacheAudio(surah, ayah, reciter).catch((error) => {
      console.error(`Failed to cache ${surah}:${ayah}:`, error);
    }),
  );

  await Promise.all(promises);
}

/**
 * Clear audio cache
 */
export async function clearAudioCache(): Promise<void> {
  const cacheDir = getCacheDirectory();
  const files = await RNFS.readDir(cacheDir);
  const audioFiles = files.filter(file => file.name.startsWith('audio_'));

  for (const file of audioFiles) {
    await RNFS.unlink(file.path);
  }
}

/**
 * Get cache size
 */
export async function getCacheSize(): Promise<number> {
  const cacheDir = getCacheDirectory();
  const files = await RNFS.readDir(cacheDir);
  const audioFiles = files.filter(file => file.name.startsWith('audio_'));

  let totalSize = 0;
  for (const file of audioFiles) {
    const stat = await RNFS.stat(file.path);
    totalSize += stat.size;
  }

  return totalSize;
}

/**
 * Play word-level audio from Hugging Face dataset
 * Useful for word-by-word recitation practice
 */
export async function playWordAudio(
  surah: number,
  ayah: number,
  wordIndex: number,
  volume: number = 80,
): Promise<void> {
  try {
    // Use Hugging Face word dataset
    await playHFWordAudio(surah, ayah, wordIndex, volume);
  } catch (error) {
    console.error('Error playing word audio:', error);
    throw error;
  }
}

/**
 * Download and cache word audio
 */
export async function downloadWordAudioFile(
  surah: number,
  ayah: number,
  wordIndex: number,
): Promise<string> {
  try {
    return await downloadWordAudio(surah, ayah, wordIndex);
  } catch (error) {
    console.error('Error downloading word audio:', error);
    throw error;
  }
}

/**
 * Check if word audio is cached
 */
export async function isWordAudioCachedFile(
  surah: number,
  ayah: number,
  wordIndex: number,
): Promise<boolean> {
  return isWordAudioCached(surah, ayah, wordIndex);
}

