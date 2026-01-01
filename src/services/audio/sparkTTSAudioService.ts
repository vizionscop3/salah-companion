/**
 * Spark-TTS Audio Service
 *
 * Service for playing pre-generated Arabic audio files created using Spark-TTS.
 * These files are stored in assets/audio/ and provide high-quality Arabic TTS.
 * 
 * Note: Since Metro bundler doesn't support dynamic require() calls,
 * this service uses file system paths to check for and load audio files.
 */

import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
import {Platform} from 'react-native';

// Enable playback in silence mode
Sound.setCategory('Playback', true);

/**
 * Get the file system path for a Spark-TTS audio file
 * For bundled assets, we'll need to copy them to the document directory first
 * or use a static mapping. For now, this returns null to indicate files aren't available yet.
 */
const getAudioFilePath = async (
  category: string,
  fileName: string,
): Promise<string | null> => {
  // For now, Spark-TTS files aren't generated yet, so return null
  // Once files are generated, we can check the document directory or bundled assets
  // This will be implemented when audio files are actually generated
  return null;
};

/**
 * Get the file system path for a Quran ayah audio file
 */
const getQuranAyahFilePath = async (
  surah: number,
  ayah: number,
): Promise<string | null> => {
  // For now, Spark-TTS files aren't generated yet, so return null
  // Once files are generated, we can check the document directory or bundled assets
  return null;
};

/**
 * Check if Spark-TTS audio file exists for a prayer phrase
 */
export async function hasSparkTTSAudio(phraseId: string): Promise<boolean> {
  const audioPath = await getAudioFilePath('prayers', phraseId);
  return audioPath !== null;
}

/**
 * Play Spark-TTS generated audio for a prayer phrase
 */
export async function playSparkTTSPhrase(
  phraseId: string,
  volume: number = 80,
): Promise<void> {
  const audioPath = await getAudioFilePath('prayers', phraseId);
  
  if (!audioPath) {
    throw new Error(`No Spark-TTS audio found for phrase: ${phraseId}`);
  }

  return new Promise((resolve, reject) => {
    const sound = new Sound(audioPath, '', (error) => {
      if (error) {
        if (__DEV__) {
          console.warn('Error loading Spark-TTS audio:', phraseId, error);
        }
        reject(error);
        return;
      }

      sound.setVolume(volume / 100);
      sound.play((success) => {
        if (success) {
          if (__DEV__) {
            console.log('Spark-TTS audio played successfully:', phraseId);
          }
          sound.release();
          resolve();
        } else {
          sound.release();
          reject(new Error('Failed to play Spark-TTS audio'));
        }
      });
    });
  });
}

/**
 * Play Spark-TTS generated audio for an Azan phrase
 */
export async function playSparkTTSAzan(
  phraseId: string,
  volume: number = 80,
): Promise<void> {
  const audioPath = await getAudioFilePath('azan', phraseId);
  
  if (!audioPath) {
    throw new Error(`No Spark-TTS audio found for Azan phrase: ${phraseId}`);
  }

  return new Promise((resolve, reject) => {
    const sound = new Sound(audioPath, '', (error) => {
      if (error) {
        if (__DEV__) {
          console.warn('Error loading Spark-TTS Azan audio:', phraseId, error);
        }
        reject(error);
        return;
      }

      sound.setVolume(volume / 100);
      sound.play((success) => {
        if (success) {
          if (__DEV__) {
            console.log('Spark-TTS Azan audio played successfully:', phraseId);
          }
          sound.release();
          resolve();
        } else {
          sound.release();
          reject(new Error('Failed to play Spark-TTS Azan audio'));
        }
      });
    });
  });
}

/**
 * Play Spark-TTS generated audio for a Quran ayah
 */
export async function playSparkTTSQuranAyah(
  surah: number,
  ayah: number,
  volume: number = 80,
): Promise<void> {
  const audioPath = await getQuranAyahFilePath(surah, ayah);
  
  if (!audioPath) {
    throw new Error(`No Spark-TTS audio found for Surah ${surah}, Ayah ${ayah}`);
  }

  return new Promise((resolve, reject) => {
    const sound = new Sound(audioPath, '', (error) => {
      if (error) {
        if (__DEV__) {
          console.warn('Error loading Spark-TTS Quran audio:', surah, ayah, error);
        }
        reject(error);
        return;
      }

      sound.setVolume(volume / 100);
      sound.play((success) => {
        if (success) {
          if (__DEV__) {
            console.log('Spark-TTS Quran audio played successfully:', surah, ayah);
          }
          sound.release();
          resolve();
        } else {
          sound.release();
          reject(new Error('Failed to play Spark-TTS Quran audio'));
        }
      });
    });
  });
}

/**
 * Check if Spark-TTS audio is available for a Quran ayah
 */
export async function hasSparkTTSQuranAyah(surah: number, ayah: number): Promise<boolean> {
  const audioPath = await getQuranAyahFilePath(surah, ayah);
  return audioPath !== null;
}

