/**
 * Hugging Face Quran Audio Service
 * 
 * Downloads and caches Quranic audio from Hugging Face datasets:
 * - Buraaq/quran-md-ayahs: Verse-level recitations (187,080 samples)
 * - Buraaq/quran-md-words: Individual word pronunciations (77,429 samples)
 * 
 * Uses Hugging Face Hub API to access dataset files directly.
 */

import axios from 'axios';
import RNFS from 'react-native-fs';
import {Platform} from 'react-native';
import Sound from 'react-native-sound';

// Hugging Face dataset identifiers
const AYAH_DATASET = 'Buraaq/quran-md-ayahs';
const WORD_DATASET = 'Buraaq/quran-md-words';

// Hugging Face Hub API base URL
const HF_API_BASE = 'https://huggingface.co/datasets';
const HF_CDN_BASE = 'https://cdn-lfs.huggingface.co';

/**
 * Get cache directory for Hugging Face audio files
 */
function getCacheDirectory(): string {
  const cacheDir = Platform.OS === 'ios'
    ? `${RNFS.DocumentDirectoryPath}/hf_audio_cache`
    : `${RNFS.DocumentDirectoryPath}/hf_audio_cache`;
  
  // Ensure directory exists
  RNFS.mkdir(cacheDir).catch(() => {
    // Directory might already exist, ignore error
  });
  
  return cacheDir;
}

/**
 * Get cached file path for ayah audio
 */
function getAyahCachePath(surah: number, ayah: number, reciter?: string): string {
  const cacheDir = getCacheDirectory();
  const reciterSuffix = reciter ? `_${reciter}` : '';
  return `${cacheDir}/ayah_${surah}_${ayah}${reciterSuffix}.mp3`;
}

/**
 * Get cached file path for word audio
 */
function getWordCachePath(surah: number, ayah: number, wordIndex: number): string {
  const cacheDir = getCacheDirectory();
  return `${cacheDir}/word_${surah}_${ayah}_${wordIndex}.mp3`;
}

/**
 * Check if ayah audio is cached
 */
export async function isAyahAudioCached(
  surah: number,
  ayah: number,
  reciter?: string,
): Promise<boolean> {
  const filePath = getAyahCachePath(surah, ayah, reciter);
  return RNFS.exists(filePath);
}

/**
 * Check if word audio is cached
 */
export async function isWordAudioCached(
  surah: number,
  ayah: number,
  wordIndex: number,
): Promise<boolean> {
  const filePath = getWordCachePath(surah, ayah, wordIndex);
  return RNFS.exists(filePath);
}

/**
 * Get dataset file URL from Hugging Face
 * Uses Hugging Face Hub API to resolve file paths
 */
async function getDatasetFileUrl(
  dataset: string,
  filePath: string,
): Promise<string> {
  try {
    // Hugging Face Hub API endpoint for getting file URLs
    // Format: /datasets/{dataset}/resolve/main/{file_path}
    const apiUrl = `${HF_API_BASE}/${dataset}/resolve/main/${filePath}`;
    
    // First, try to get the file info to resolve the actual CDN URL
    const response = await axios.head(apiUrl, {
      maxRedirects: 5,
      validateStatus: (status) => status < 400 || status === 404,
    });

    // If we get a redirect, follow it
    if (response.status === 301 || response.status === 302) {
      return response.headers.location || apiUrl;
    }

    // Return the API URL (will redirect to CDN)
    return apiUrl;
  } catch (error) {
    console.error(`Error resolving file URL for ${dataset}/${filePath}:`, error);
    throw error;
  }
}

/**
 * Construct file path in dataset for ayah audio
 * Based on typical Hugging Face dataset structure
 */
function getAyahFilePath(surah: number, ayah: number, reciter?: string): string {
  // Format: audio/{surah}/{ayah}.mp3 or audio/{reciter}/{surah}/{ayah}.mp3
  if (reciter) {
    return `audio/${reciter}/${surah}/${ayah}.mp3`;
  }
  return `audio/${surah}/${ayah}.mp3`;
}

/**
 * Construct file path in dataset for word audio
 */
function getWordFilePath(surah: number, ayah: number, wordIndex: number): string {
  // Format: audio/{surah}/{ayah}/{word_index}.mp3
  return `audio/${surah}/${ayah}/${wordIndex}.mp3`;
}

/**
 * Download and cache ayah audio from Hugging Face dataset
 */
export async function downloadAyahAudio(
  surah: number,
  ayah: number,
  reciter?: string,
): Promise<string> {
  const cachedPath = getAyahCachePath(surah, ayah, reciter);

  // Check if already cached
  if (await isAyahAudioCached(surah, ayah, reciter)) {
    return cachedPath;
  }

  try {
    // Get file path in dataset
    const filePath = getAyahFilePath(surah, ayah, reciter);
    
    // Get file URL from Hugging Face
    const fileUrl = await getDatasetFileUrl(AYAH_DATASET, filePath);

    // Download audio file
    const downloadResult = await RNFS.downloadFile({
      fromUrl: fileUrl,
      toFile: cachedPath,
      headers: {
        'User-Agent': 'SalahCompanion/1.0',
      },
    }).promise;

    if (downloadResult.statusCode === 200) {
      console.log(`Ayah audio cached: ${surah}:${ayah}`);
      return cachedPath;
    } else {
      throw new Error(`Download failed with status ${downloadResult.statusCode}`);
    }
  } catch (error) {
    console.error(`Error downloading ayah audio for ${surah}:${ayah}:`, error);
    
    // Try alternative file path structure
    try {
      const altPath = `data/${surah}/${ayah}.mp3`;
      const altUrl = await getDatasetFileUrl(AYAH_DATASET, altPath);
      
      const downloadResult = await RNFS.downloadFile({
        fromUrl: altUrl,
        toFile: cachedPath,
        headers: {
          'User-Agent': 'SalahCompanion/1.0',
        },
      }).promise;

      if (downloadResult.statusCode === 200) {
        return cachedPath;
      }
    } catch (altError) {
      console.warn('Alternative path also failed:', altError);
    }
    
    throw error;
  }
}

/**
 * Download and cache word audio from Hugging Face dataset
 */
export async function downloadWordAudio(
  surah: number,
  ayah: number,
  wordIndex: number,
): Promise<string> {
  const cachedPath = getWordCachePath(surah, ayah, wordIndex);

  // Check if already cached
  if (await isWordAudioCached(surah, ayah, wordIndex)) {
    return cachedPath;
  }

  try {
    // Get file path in dataset
    const filePath = getWordFilePath(surah, ayah, wordIndex);
    
    // Get file URL from Hugging Face
    const fileUrl = await getDatasetFileUrl(WORD_DATASET, filePath);

    // Download audio file
    const downloadResult = await RNFS.downloadFile({
      fromUrl: fileUrl,
      toFile: cachedPath,
      headers: {
        'User-Agent': 'SalahCompanion/1.0',
      },
    }).promise;

    if (downloadResult.statusCode === 200) {
      console.log(`Word audio cached: ${surah}:${ayah}:${wordIndex}`);
      return cachedPath;
    } else {
      throw new Error(`Download failed with status ${downloadResult.statusCode}`);
    }
  } catch (error) {
    console.error(`Error downloading word audio for ${surah}:${ayah}:${wordIndex}:`, error);
    throw error;
  }
}

/**
 * Play ayah audio from cache or download
 */
export async function playAyahAudio(
  surah: number,
  ayah: number,
  volume: number = 80,
  reciter?: string,
): Promise<void> {
  try {
    const filePath = await downloadAyahAudio(surah, ayah, reciter);
    
    return new Promise((resolve, reject) => {
      const sound = new Sound(filePath, '', (error) => {
        if (error) {
          console.error('Error loading ayah audio:', error);
          reject(error);
          return;
        }

        sound.setVolume(volume / 100);
        sound.play((success) => {
          if (success) {
            resolve();
          } else {
            reject(new Error('Failed to play ayah audio'));
          }
          sound.release();
        });
      });
    });
  } catch (error) {
    console.error('Error playing ayah audio:', error);
    throw error;
  }
}

/**
 * Play word audio from cache or download
 */
export async function playWordAudio(
  surah: number,
  ayah: number,
  wordIndex: number,
  volume: number = 80,
): Promise<void> {
  try {
    const filePath = await downloadWordAudio(surah, ayah, wordIndex);
    
    return new Promise((resolve, reject) => {
      const sound = new Sound(filePath, '', (error) => {
        if (error) {
          console.error('Error loading word audio:', error);
          reject(error);
          return;
        }

        sound.setVolume(volume / 100);
        sound.play((success) => {
          if (success) {
            resolve();
          } else {
            reject(new Error('Failed to play word audio'));
          }
          sound.release();
        });
      });
    });
  } catch (error) {
    console.error('Error playing word audio:', error);
    throw error;
  }
}

/**
 * Pre-cache multiple ayah audio files
 */
export async function preCacheAyahAudio(
  items: Array<{surah: number; ayah: number; reciter?: string}>,
): Promise<void> {
  console.log(`Pre-caching ${items.length} ayah audio files...`);
  
  const promises = items.map(({surah, ayah, reciter}) =>
    downloadAyahAudio(surah, ayah, reciter).catch((error) => {
      console.error(`Failed to cache ${surah}:${ayah}:`, error);
    }),
  );

  await Promise.allSettled(promises);
  console.log('Ayah audio pre-caching complete');
}

/**
 * Pre-cache multiple word audio files
 */
export async function preCacheWordAudio(
  items: Array<{surah: number; ayah: number; wordIndex: number}>,
): Promise<void> {
  console.log(`Pre-caching ${items.length} word audio files...`);
  
  const promises = items.map(({surah, ayah, wordIndex}) =>
    downloadWordAudio(surah, ayah, wordIndex).catch((error) => {
      console.error(`Failed to cache word ${surah}:${ayah}:${wordIndex}:`, error);
    }),
  );

  await Promise.allSettled(promises);
  console.log('Word audio pre-caching complete');
}

/**
 * Clear Hugging Face audio cache
 */
export async function clearHFAudioCache(): Promise<void> {
  try {
    const cacheDir = getCacheDirectory();
    const files = await RNFS.readDir(cacheDir);
    
    await Promise.all(
      files
        .filter(file => file.name.endsWith('.mp3'))
        .map(file => RNFS.unlink(file.path))
    );
    
    console.log('Hugging Face audio cache cleared');
  } catch (error) {
    console.error('Error clearing HF audio cache:', error);
    throw error;
  }
}

/**
 * Get Hugging Face audio cache size
 */
export async function getHFAudioCacheSize(): Promise<number> {
  try {
    const cacheDir = getCacheDirectory();
    const files = await RNFS.readDir(cacheDir);
    const audioFiles = files.filter(file => file.name.endsWith('.mp3'));
    
    let totalSize = 0;
    for (const file of audioFiles) {
      const stats = await RNFS.stat(file.path);
      totalSize += stats.size || 0;
    }
    
    return totalSize;
  } catch (error) {
    console.error('Error calculating HF audio cache size:', error);
    return 0;
  }
}

/**
 * Get cache statistics
 */
export async function getHFAudioCacheStats(): Promise<{
  totalFiles: number;
  totalSize: number;
  ayahFiles: number;
  wordFiles: number;
}> {
  try {
    const cacheDir = getCacheDirectory();
    const files = await RNFS.readDir(cacheDir);
    const audioFiles = files.filter(file => file.name.endsWith('.mp3'));
    
    let totalSize = 0;
    let ayahFiles = 0;
    let wordFiles = 0;
    
    for (const file of audioFiles) {
      const stats = await RNFS.stat(file.path);
      totalSize += stats.size || 0;
      
      if (file.name.startsWith('ayah_')) {
        ayahFiles++;
      } else if (file.name.startsWith('word_')) {
        wordFiles++;
      }
    }
    
    return {
      totalFiles: audioFiles.length,
      totalSize,
      ayahFiles,
      wordFiles,
    };
  } catch (error) {
    console.error('Error getting HF audio cache stats:', error);
    return {
      totalFiles: 0,
      totalSize: 0,
      ayahFiles: 0,
      wordFiles: 0,
    };
  }
}
