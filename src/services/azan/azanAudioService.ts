/**
 * Azan Audio Service
 * 
 * Manages downloading, caching, and playing Azan audio from remote URLs or local files.
 * Supports multiple Azan voices with automatic caching for offline use.
 */

import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
import {Platform} from 'react-native';

export type AzanVoice = 'makkah' | 'madinah' | 'qatami' | 'alafasy';

export interface AzanAudioSource {
  voice: AzanVoice;
  url?: string; // Remote URL (optional)
  localFile?: string; // Local file name (optional)
  description: string;
}

/**
 * Azan audio sources configuration
 * Users can provide their own URLs or use local files
 */
const AZAN_AUDIO_SOURCES: Record<AzanVoice, AzanAudioSource> = {
  makkah: {
    voice: 'makkah',
    localFile: 'azan_makkah.mp3',
    description: 'Masjid al-Haram, Makkah',
    // url: 'https://example.com/azan/makkah.mp3', // Add URL if available
  },
  madinah: {
    voice: 'madinah',
    localFile: 'azan_madinah.mp3',
    description: 'Masjid an-Nabawi, Madinah',
    // url: 'https://example.com/azan/madinah.mp3', // Add URL if available
  },
  qatami: {
    voice: 'qatami',
    localFile: 'azan_qatami.mp3',
    description: 'Sheikh Nasser Al-Qatami',
    // url: 'https://example.com/azan/qatami.mp3', // Add URL if available
  },
  alafasy: {
    voice: 'alafasy',
    localFile: 'azan_alafasy.mp3',
    description: 'Sheikh Mishary Rashid Alafasy',
    // url: 'https://example.com/azan/alafasy.mp3', // Add URL if available
  },
};

/**
 * Get cache directory for Azan audio files
 */
function getCacheDirectory(): string {
  const cacheDir = Platform.OS === 'ios' 
    ? `${RNFS.DocumentDirectoryPath}/azan_cache`
    : `${RNFS.DocumentDirectoryPath}/azan_cache`;
  
  // Ensure directory exists
  RNFS.mkdir(cacheDir).catch(() => {
    // Directory might already exist, ignore error
  });
  
  return cacheDir;
}

/**
 * Get cached file path for a voice
 */
function getCachedFilePath(voice: AzanVoice): string {
  const cacheDir = getCacheDirectory();
  return `${cacheDir}/${voice}.mp3`;
}

/**
 * Check if audio file is cached
 */
export async function isAzanCached(voice: AzanVoice): Promise<boolean> {
  try {
    const filePath = getCachedFilePath(voice);
    const exists = await RNFS.exists(filePath);
    return exists;
  } catch (error) {
    console.error(`Error checking cache for ${voice}:`, error);
    return false;
  }
}

/**
 * Download and cache Azan audio from URL
 */
export async function downloadAndCacheAzan(
  voice: AzanVoice,
  url: string,
): Promise<string> {
  try {
    const source = AZAN_AUDIO_SOURCES[voice];
    if (!source.url && !url) {
      throw new Error(`No URL provided for ${voice} Azan`);
    }

    const audioUrl = url || source.url;
    if (!audioUrl) {
      throw new Error(`No audio source available for ${voice}`);
    }

    const filePath = getCachedFilePath(voice);
    const downloadResult = await RNFS.downloadFile({
      fromUrl: audioUrl,
      toFile: filePath,
    }).promise;

    if (downloadResult.statusCode === 200) {
      console.log(`Azan audio cached for ${voice}`);
      return filePath;
    } else {
      throw new Error(`Failed to download Azan audio: ${downloadResult.statusCode}`);
    }
  } catch (error) {
    console.error(`Error downloading Azan audio for ${voice}:`, error);
    throw error;
  }
}

/**
 * Get Azan audio file path (local file, cached, or download)
 */
export async function getAzanAudioPath(voice: AzanVoice): Promise<string> {
  const source = AZAN_AUDIO_SOURCES[voice];

  // First, try local file from bundle
  if (source.localFile) {
    // Check if local file exists (this will be handled by Sound library)
    return source.localFile;
  }

  // Second, try cached file
  const cachedPath = getCachedFilePath(voice);
  const isCached = await isAzanCached(voice);
  if (isCached) {
    return cachedPath;
  }

  // Third, try to download if URL is available
  if (source.url) {
    try {
      const downloadedPath = await downloadAndCacheAzan(voice, source.url);
      return downloadedPath;
    } catch (error) {
      console.warn(`Failed to download Azan for ${voice}, falling back to local file`);
    }
  }

  // Fallback to local file name (will fail gracefully if not found)
  return source.localFile || `azan_${voice}.mp3`;
}

/**
 * Play Azan audio from file path
 */
export async function playAzanAudio(
  filePath: string,
  volume: number = 80,
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if it's a local bundle file or a file path
    const isLocalBundle = !filePath.includes('/') && !filePath.startsWith('file://');
    
    const sound = new Sound(
      isLocalBundle ? filePath : filePath.replace('file://', ''),
      isLocalBundle ? Sound.MAIN_BUNDLE : '',
      (error) => {
        if (error) {
          console.error('Error loading Azan sound:', error);
          reject(error);
          return;
        }

        sound.setVolume(volume / 100);
        sound.play((success) => {
          if (success) {
            console.log('Azan played successfully');
          } else {
            console.error('Error playing Azan');
            reject(new Error('Failed to play Azan'));
          }
          sound.release();
          resolve();
        });
      }
    );
  });
}

/**
 * Play Azan with automatic source resolution
 * Uses the enhanced audio service with caching support
 */
export async function playAzan(
  voice: AzanVoice,
  volume: number = 80,
): Promise<void> {
  try {
    const filePath = await getAzanAudioPath(voice);
    // playAzanAudio handles the Sound instance internally
    await playAzanAudio(filePath, volume);
  } catch (error) {
    console.error(`Error playing Azan ${voice}:`, error);
    throw error;
  }
}

/**
 * Clear Azan cache
 */
export async function clearAzanCache(): Promise<void> {
  try {
    const cacheDir = getCacheDirectory();
    const files = await RNFS.readdir(cacheDir);
    
    await Promise.all(
      files
        .filter(file => file.endsWith('.mp3'))
        .map(file => RNFS.unlink(`${cacheDir}/${file}`))
    );
    
    console.log('Azan cache cleared');
  } catch (error) {
    console.error('Error clearing Azan cache:', error);
    throw error;
  }
}

/**
 * Get cache size
 */
export async function getAzanCacheSize(): Promise<number> {
  try {
    const cacheDir = getCacheDirectory();
    const files = await RNFS.readdir(cacheDir);
    
    let totalSize = 0;
    for (const file of files) {
      if (file.endsWith('.mp3')) {
        const stats = await RNFS.stat(`${cacheDir}/${file}`);
        totalSize += stats.size || 0;
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('Error calculating cache size:', error);
    return 0;
  }
}

/**
 * Pre-cache all Azan voices (if URLs are available)
 */
export async function preCacheAllAzan(): Promise<void> {
  const voices: AzanVoice[] = ['makkah', 'madinah', 'qatami', 'alafasy'];
  
  await Promise.allSettled(
    voices.map(async voice => {
      const source = AZAN_AUDIO_SOURCES[voice];
      if (source.url) {
        try {
          const isCached = await isAzanCached(voice);
          if (!isCached) {
            await downloadAndCacheAzan(voice, source.url);
          }
        } catch (error) {
          console.warn(`Failed to pre-cache ${voice}:`, error);
        }
      }
    })
  );
}

/**
 * Get Azan source information
 */
export function getAzanSource(voice: AzanVoice): AzanAudioSource {
  return AZAN_AUDIO_SOURCES[voice];
}

/**
 * Update Azan source URL (for custom sources)
 */
export function updateAzanSource(voice: AzanVoice, url: string): void {
  if (AZAN_AUDIO_SOURCES[voice]) {
    AZAN_AUDIO_SOURCES[voice].url = url;
  }
}

