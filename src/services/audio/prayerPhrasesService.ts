/**
 * Prayer Phrases Audio Service
 * 
 * Manages downloading, caching, and playing non-Quranic prayer phrases.
 * These include: Takbir, Ruku, Sujud, Tashahhud, Salam, and other prayer phrases.
 * Falls back to TTS (Text-to-Speech) when audio files are not available.
 */

import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
import {Platform} from 'react-native';

export type PrayerPhrase = 
  | 'takbir' 
  | 'ruku' 
  | 'sujud' 
  | 'tashahhud' 
  | 'salam'
  | 'subhan_rabbial_ala'
  | 'subhan_rabbial_azeem'
  | 'sami_allahu_liman_hamidah'
  | 'rabbana_lakal_hamd';

export interface PrayerPhraseSource {
  phrase: PrayerPhrase;
  arabicText: string;
  transliteration: string;
  translation: string;
  url?: string; // Remote URL (optional)
  localFile?: string; // Local file name (optional)
  description: string;
}

/**
 * Prayer phrases configuration with Arabic text and audio sources
 */
const PRAYER_PHRASES: Record<PrayerPhrase, PrayerPhraseSource> = {
  takbir: {
    phrase: 'takbir',
    arabicText: 'الله أكبر',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
    localFile: 'takbir.mp3',
    description: 'Opening declaration',
  },
  ruku: {
    phrase: 'ruku',
    arabicText: 'سبحان ربي العظيم',
    transliteration: 'Subhan Rabbi al-Azeem',
    translation: 'Glory be to my Lord, the Great',
    localFile: 'ruku.mp3',
    description: 'Recitation in bowing position',
  },
  sujud: {
    phrase: 'sujud',
    arabicText: 'سبحان ربي الأعلى',
    transliteration: 'Subhan Rabbi al-A\'la',
    translation: 'Glory be to my Lord, the Most High',
    localFile: 'sujud.mp3',
    description: 'Recitation in prostration position',
  },
  tashahhud: {
    phrase: 'tashahhud',
    arabicText: 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ',
    transliteration: 'At-tahiyyatu lillahi was-salawatu wat-tayyibatu',
    translation: 'All greetings, prayers, and good things are for Allah',
    localFile: 'tashahhud.mp3',
    description: 'Testimony of faith',
  },
  salam: {
    phrase: 'salam',
    arabicText: 'السلام عليكم ورحمة الله',
    transliteration: 'As-salamu alaykum wa rahmatullah',
    translation: 'Peace be upon you and the mercy of Allah',
    localFile: 'salam.mp3',
    description: 'Greeting to end prayer',
  },
  subhan_rabbial_ala: {
    phrase: 'subhan_rabbial_ala',
    arabicText: 'سبحان ربي الأعلى',
    transliteration: 'Subhan Rabbi al-A\'la',
    translation: 'Glory be to my Lord, the Most High',
    localFile: 'subhan_rabbial_ala.mp3',
    description: 'Prostration recitation (alternative)',
  },
  subhan_rabbial_azeem: {
    phrase: 'subhan_rabbial_azeem',
    arabicText: 'سبحان ربي العظيم',
    transliteration: 'Subhan Rabbi al-Azeem',
    translation: 'Glory be to my Lord, the Great',
    localFile: 'subhan_rabbial_azeem.mp3',
    description: 'Bowing recitation (alternative)',
  },
  sami_allahu_liman_hamidah: {
    phrase: 'sami_allahu_liman_hamidah',
    arabicText: 'سمع الله لمن حمده',
    transliteration: 'Sami\'allahu liman hamidah',
    translation: 'Allah hears those who praise Him',
    localFile: 'sami_allahu_liman_hamidah.mp3',
    description: 'Rising from bowing',
  },
  rabbana_lakal_hamd: {
    phrase: 'rabbana_lakal_hamd',
    arabicText: 'ربنا ولك الحمد',
    transliteration: 'Rabbana wa lakal hamd',
    translation: 'Our Lord, to You is all praise',
    localFile: 'rabbana_lakal_hamd.mp3',
    description: 'After rising from bowing',
  },
};

/**
 * Get cache directory for prayer phrases audio files
 */
function getCacheDirectory(): string {
  const cacheDir = Platform.OS === 'ios' 
    ? `${RNFS.DocumentDirectoryPath}/prayer_phrases_cache`
    : `${RNFS.DocumentDirectoryPath}/prayer_phrases_cache`;
  
  // Ensure directory exists
  RNFS.mkdir(cacheDir).catch(() => {
    // Directory might already exist, ignore error
  });
  
  return cacheDir;
}

/**
 * Get cached file path for a phrase
 */
function getCachedFilePath(phrase: PrayerPhrase): string {
  const cacheDir = getCacheDirectory();
  return `${cacheDir}/${phrase}.mp3`;
}

/**
 * Check if audio file is cached
 */
export async function isPhraseCached(phrase: PrayerPhrase): Promise<boolean> {
  try {
    const filePath = getCachedFilePath(phrase);
    const exists = await RNFS.exists(filePath);
    return exists;
  } catch (error) {
    console.error(`Error checking cache for ${phrase}:`, error);
    return false;
  }
}

/**
 * Download and cache prayer phrase audio from URL
 */
export async function downloadAndCachePhrase(
  phrase: PrayerPhrase,
  url: string,
): Promise<string> {
  try {
    const source = PRAYER_PHRASES[phrase];
    if (!url) {
      throw new Error(`No URL provided for ${phrase} phrase`);
    }

    const filePath = getCachedFilePath(phrase);
    const downloadResult = await RNFS.downloadFile({
      fromUrl: url,
      toFile: filePath,
    }).promise;

    if (downloadResult.statusCode === 200) {
      console.log(`Prayer phrase audio cached for ${phrase}`);
      return filePath;
    } else {
      throw new Error(`Failed to download phrase audio: ${downloadResult.statusCode}`);
    }
  } catch (error) {
    console.error(`Error downloading phrase audio for ${phrase}:`, error);
    throw error;
  }
}

/**
 * Get prayer phrase audio file path (local file, cached, or download)
 */
export async function getPhraseAudioPath(phrase: PrayerPhrase): Promise<string> {
  const source = PRAYER_PHRASES[phrase];

  // First, try local file from bundle
  if (source.localFile) {
    // Check if local file exists (this will be handled by Sound library)
    return source.localFile;
  }

  // Second, try cached file
  const cachedPath = getCachedFilePath(phrase);
  const isCached = await isPhraseCached(phrase);
  if (isCached) {
    return cachedPath;
  }

  // Third, try to download if URL is available
  if (source.url) {
    try {
      const downloadedPath = await downloadAndCachePhrase(phrase, source.url);
      return downloadedPath;
    } catch (error) {
      console.warn(`Failed to download phrase for ${phrase}, falling back to local file`);
    }
  }

  // Fallback to local file name (will fail gracefully if not found)
  return source.localFile || `${phrase}.mp3`;
}

/**
 * Play prayer phrase audio from file path
 */
export async function playPhraseAudio(
  filePath: string,
  volume: number = 80,
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Check if it's a local bundle file or a file path
      const isLocalBundle = !filePath.includes('/') && !filePath.startsWith('file://');
      
      const sound = new Sound(
        isLocalBundle ? filePath : filePath.replace('file://', ''),
        isLocalBundle ? Sound.MAIN_BUNDLE : '',
        (error) => {
          if (error) {
            // Only log in dev mode - audio is optional
            if (__DEV__) {
              console.warn('Error loading phrase sound:', error);
            }
            // Release sound if it was created
            try {
              sound.release();
            } catch (e) {
              // Ignore release errors
            }
            reject(error);
            return;
          }

          try {
            sound.setVolume(volume / 100);
            sound.play((success) => {
              if (success) {
                if (__DEV__) {
                  console.log('Prayer phrase played successfully');
                }
              } else {
                // Only log in dev mode
                if (__DEV__) {
                  console.warn('Error playing phrase');
                }
                // Don't reject - just resolve silently
                // Audio is optional, don't disrupt user experience
              }
              try {
                sound.release();
              } catch (e) {
                // Ignore release errors
              }
              resolve();
            });
          } catch (playError) {
            // Handle play errors gracefully
            if (__DEV__) {
              console.warn('Error setting up sound playback:', playError);
            }
            try {
              sound.release();
            } catch (e) {
              // Ignore release errors
            }
            resolve(); // Resolve instead of reject - audio is optional
          }
        }
      );
    } catch (initError) {
      // Handle initialization errors gracefully
      if (__DEV__) {
        console.warn('Error initializing sound:', initError);
      }
      reject(initError);
    }
  });
}

/**
 * Play prayer phrase using TTS as fallback
 */
async function playPhraseWithTTS(phrase: PrayerPhrase, volume: number): Promise<void> {
  try {
    // Try to load TTS module - check if it's available
    let Tts;
    try {
      Tts = require('react-native-tts');
      // Check if TTS is properly initialized and methods exist
      if (!Tts || typeof Tts.setDefaultLanguage !== 'function') {
        throw new Error('TTS module not properly initialized');
      }
    } catch (moduleError) {
      if (__DEV__) {
        console.warn('TTS module not available:', moduleError);
      }
      throw new Error('TTS not available');
    }

    const source = PRAYER_PHRASES[phrase];
    if (!source || !source.arabicText) {
      throw new Error(`No Arabic text found for phrase: ${phrase}`);
    }
    
    // Configure TTS for Arabic - check if methods exist before calling
    if (typeof Tts.setDefaultLanguage === 'function') {
      await Tts.setDefaultLanguage('ar-SA');
    }
    if (typeof Tts.setDefaultRate === 'function') {
      await Tts.setDefaultRate(0.5); // Slower for clarity
    }
    if (typeof Tts.setDefaultPitch === 'function') {
      await Tts.setDefaultPitch(1.0);
    }
    
    // Check if speak method exists
    if (typeof Tts.speak !== 'function') {
      throw new Error('TTS speak method not available');
    }
    
    // Speak the Arabic text
    await Tts.speak(source.arabicText);
    
    // Wait for speech to complete
    return new Promise((resolve) => {
      // Set up timeout first to ensure we always resolve
      const timeout = setTimeout(() => {
        try {
          if (finishListener) Tts.removeEventListener('tts-finish', finishListener);
          if (errorListener) Tts.removeEventListener('tts-error', errorListener);
        } catch (e) {
          // Ignore cleanup errors
        }
        resolve();
      }, 10000); // 10 second timeout
      
      let finishListener: any = null;
      let errorListener: any = null;
      
      // Set up event listeners if available
      if (typeof Tts.addEventListener === 'function') {
        finishListener = Tts.addEventListener('tts-finish', () => {
          clearTimeout(timeout);
          try {
            if (finishListener) Tts.removeEventListener('tts-finish', finishListener);
            if (errorListener) Tts.removeEventListener('tts-error', errorListener);
          } catch (e) {
            // Ignore cleanup errors
          }
          resolve();
        });
        
        errorListener = Tts.addEventListener('tts-error', (error: any) => {
          clearTimeout(timeout);
          try {
            if (finishListener) Tts.removeEventListener('tts-finish', finishListener);
            if (errorListener) Tts.removeEventListener('tts-error', errorListener);
          } catch (e) {
            // Ignore cleanup errors
          }
          // Resolve instead of reject - audio is optional
          if (__DEV__) {
            console.warn('TTS error during playback:', error);
          }
          resolve();
        });
      } else {
        // If event listeners aren't available, just resolve after a short delay
        setTimeout(() => {
          clearTimeout(timeout);
          resolve();
        }, 2000);
      }
    });
  } catch (error) {
    // Don't throw - audio is optional, just log in dev mode
    if (__DEV__) {
      console.warn('TTS not available for phrase:', error);
    }
    // Return silently - don't disrupt user experience
    return Promise.resolve();
  }
}

/**
 * Play prayer phrase with automatic source resolution
 * Falls back to TTS if audio file is not available
 */
export async function playPhrase(
  phrase: PrayerPhrase,
  volume: number = 80,
): Promise<void> {
  try {
    // First, try to play from audio file
    const filePath = await getPhraseAudioPath(phrase);
    await playPhraseAudio(filePath, volume);
  } catch (error) {
    // Silent fallback - log only in dev mode
    if (__DEV__) {
      console.warn(`Audio file not available for ${phrase}, trying TTS:`, error);
    }
    
    // Fallback to TTS
    try {
      await playPhraseWithTTS(phrase, volume);
    } catch (ttsError) {
      // Silent failure - audio is optional, don't disrupt user experience
      if (__DEV__) {
        console.warn(`Error playing phrase ${phrase} with TTS:`, ttsError);
      }
      // Return silently without throwing - audio is optional
      return;
    }
  }
}

/**
 * Get phrase information
 */
export function getPhraseInfo(phrase: PrayerPhrase): PrayerPhraseSource {
  return PRAYER_PHRASES[phrase];
}

/**
 * Get all phrases
 */
export function getAllPhrases(): PrayerPhraseSource[] {
  return Object.values(PRAYER_PHRASES);
}

/**
 * Get phrases by category (if needed in future)
 */
export function getPhrasesByCategory(): Record<string, PrayerPhraseSource[]> {
  return {
    positions: [
      PRAYER_PHRASES.takbir,
      PRAYER_PHRASES.ruku,
      PRAYER_PHRASES.sujud,
    ],
    testimonies: [
      PRAYER_PHRASES.tashahhud,
      PRAYER_PHRASES.salam,
    ],
    supplications: [
      PRAYER_PHRASES.subhan_rabbial_ala,
      PRAYER_PHRASES.subhan_rabbial_azeem,
      PRAYER_PHRASES.sami_allahu_liman_hamidah,
      PRAYER_PHRASES.rabbana_lakal_hamd,
    ],
  };
}

/**
 * Clear phrase cache
 */
export async function clearPhraseCache(): Promise<void> {
  try {
    const cacheDir = getCacheDirectory();
    const files = await RNFS.readdir(cacheDir);
    
    await Promise.all(
      files
        .filter(file => file.endsWith('.mp3'))
        .map(file => RNFS.unlink(`${cacheDir}/${file}`))
    );
    
    console.log('Prayer phrase cache cleared');
  } catch (error) {
    console.error('Error clearing phrase cache:', error);
    throw error;
  }
}

/**
 * Get cache size
 */
export async function getPhraseCacheSize(): Promise<number> {
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
    console.error('Error calculating phrase cache size:', error);
    return 0;
  }
}

/**
 * Pre-cache all phrases (if URLs are available)
 */
export async function preCacheAllPhrases(): Promise<void> {
  const phrases: PrayerPhrase[] = Object.keys(PRAYER_PHRASES) as PrayerPhrase[];
  
  await Promise.allSettled(
    phrases.map(async phrase => {
      const source = PRAYER_PHRASES[phrase];
      if (source.url) {
        try {
          const isCached = await isPhraseCached(phrase);
          if (!isCached) {
            await downloadAndCachePhrase(phrase, source.url);
          }
        } catch (error) {
          console.warn(`Failed to pre-cache ${phrase}:`, error);
        }
      }
    })
  );
}

/**
 * Update phrase source URL (for custom sources)
 */
export function updatePhraseSource(phrase: PrayerPhrase, url: string): void {
  if (PRAYER_PHRASES[phrase]) {
    PRAYER_PHRASES[phrase].url = url;
  }
}

