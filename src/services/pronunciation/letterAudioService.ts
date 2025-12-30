/**
 * Letter Audio Service
 * 
 * Provides audio playback for Arabic letters using TTS (Text-to-Speech) or pre-recorded audio.
 * Supports both on-device TTS and API-based TTS for high-quality pronunciation.
 */

import {Platform} from 'react-native';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
import axios from 'axios';

// Arabic letter names for TTS
const ARABIC_LETTER_NAMES: Record<string, string> = {
  ba: 'باء',
  ta: 'تاء',
  tha: 'ثاء',
  jeem: 'جيم',
  ha: 'هاء',
  dal: 'دال',
  ra: 'راء',
  zay: 'زاي',
  seen: 'سين',
  sheen: 'شين',
  faa: 'فاء',
  qaf: 'قاف',
  kaf: 'كاف',
  lam: 'لام',
  meem: 'ميم',
  noon: 'نون',
  waw: 'واو',
  ya: 'ياء',
  ha_modified: 'حاء',
  kha: 'خاء',
  ayn: 'عين',
  ghayn: 'غين',
  sad: 'صاد',
  dad: 'ضاد',
  ta_emphatic: 'طاء',
  za_emphatic: 'ظاء',
};

// TTS API configuration (using a free/open TTS service)
// In production, you might use: Google Cloud TTS, AWS Polly, or Azure TTS
const TTS_API_URL = 'https://api.voicerss.org/'; // Example - replace with your preferred TTS service
const TTS_API_KEY = process.env.TTS_API_KEY || ''; // Set in .env

/**
 * Get letter audio using TTS API
 * Falls back to on-device TTS if API is not available
 */
async function getLetterAudioFromAPI(letterId: string): Promise<string | null> {
  const letterName = ARABIC_LETTER_NAMES[letterId];
  if (!letterName) {
    return null;
  }

  // Check cache first
  const cacheDir = `${RNFS.DocumentDirectoryPath}/letter_audio`;
  await RNFS.mkdir(cacheDir).catch(() => {});
  const cachedPath = `${cacheDir}/${letterId}.mp3`;

  if (await RNFS.exists(cachedPath)) {
    return cachedPath;
  }

  try {
    // Example API call (adjust based on your TTS provider)
    // For Google Cloud TTS, AWS Polly, or Azure, you'd use their SDKs
    // This is a placeholder structure
    
    if (TTS_API_KEY) {
      // Example: VoiceRSS API
      const response = await axios.get(TTS_API_URL, {
        params: {
          key: TTS_API_KEY,
          hl: 'ar',
          src: letterName,
          c: 'MP3',
          f: '44khz_16bit_mono',
        },
        responseType: 'arraybuffer',
      });

      // Save to cache
      await RNFS.writeFile(cachedPath, Buffer.from(response.data).toString('base64'), 'base64');
      return cachedPath;
    }
  } catch (error) {
    console.warn(`TTS API failed for letter ${letterId}, using fallback:`, error);
  }

  return null;
}

/**
 * Play letter audio using TTS or cached file
 */
export async function playLetterAudioTTS(
  letterId: string,
  volume: number = 80,
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Try to get audio from API/cache first
    getLetterAudioFromAPI(letterId)
      .then(cachedPath => {
        if (cachedPath) {
          // Play cached audio
          const sound = new Sound(cachedPath, '', (error) => {
            if (error) {
              console.warn(`Error loading cached audio for ${letterId}:`, error);
              // Fall through to device TTS
              playDeviceTTS(letterId, volume).then(resolve).catch(reject);
              return;
            }

            sound.setVolume(volume / 100);
            sound.play((success) => {
              if (success) {
                console.log(`Played TTS audio for letter ${letterId}`);
              }
              sound.release();
              resolve();
            });
          });
        } else {
          // Fall back to device TTS
          playDeviceTTS(letterId, volume).then(resolve).catch(reject);
        }
      })
      .catch(() => {
        // Fall back to device TTS
        playDeviceTTS(letterId, volume).then(resolve).catch(reject);
      });
  });
}

/**
 * Play letter audio using device TTS
 * Note: Requires react-native-tts package (to be installed)
 */
async function playDeviceTTS(letterId: string, volume: number): Promise<void> {
  const letterName = ARABIC_LETTER_NAMES[letterId];
  if (!letterName) {
    throw new Error(`Letter name not found for ${letterId}`);
  }

  try {
    // Try to use react-native-tts if available
    // This is a dynamic import to avoid errors if package is not installed
    const Tts = require('react-native-tts');
    
    // Configure TTS
    await Tts.setDefaultLanguage('ar-SA'); // Arabic (Saudi Arabia)
    await Tts.setDefaultRate(0.5); // Slower for clarity
    await Tts.setDefaultPitch(1.0);
    
    // Speak the letter name
    await Tts.speak(letterName);
    
    // Wait for speech to complete
    return new Promise((resolve) => {
      Tts.addEventListener('tts-finish', () => {
        resolve();
      });
    });
  } catch (error) {
    console.warn('Device TTS not available, using fallback:', error);
    // Final fallback: Just resolve (silent failure)
    // In production, you might want to show a message to the user
    return Promise.resolve();
  }
}

/**
 * Pre-load letter audio for offline use
 */
export async function preloadLetterAudio(letterIds: string[]): Promise<void> {
  console.log(`Preloading audio for ${letterIds.length} letters...`);
  
  for (const letterId of letterIds) {
    try {
      await getLetterAudioFromAPI(letterId);
    } catch (error) {
      console.warn(`Failed to preload audio for ${letterId}:`, error);
    }
  }
  
  console.log('Letter audio preloading complete');
}

/**
 * Clear letter audio cache
 */
export async function clearLetterAudioCache(): Promise<void> {
  const cacheDir = `${RNFS.DocumentDirectoryPath}/letter_audio`;
  try {
    const files = await RNFS.readDir(cacheDir);
    for (const file of files) {
      await RNFS.unlink(file.path);
    }
    console.log('Letter audio cache cleared');
  } catch (error) {
    console.warn('Error clearing letter audio cache:', error);
  }
}


















