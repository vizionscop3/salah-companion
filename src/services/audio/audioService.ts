/**
 * Audio Service
 *
 * Generic audio playback service for recitations and guided salah audio.
 * Now supports both local files and API-fetched audio.
 */

import Sound from 'react-native-sound';
import {Platform} from 'react-native';
import {playQuranicAudio, getFullSurahAudio, isAudioCached} from './quranicAudioService';
import {getAudioMapping, isQuranicRecitation} from './audioMapping';
import {playPhrase, getPhraseInfo, type PrayerPhrase} from './prayerPhrasesService';
import {
  hasSparkTTSAudio,
  playSparkTTSPhrase,
  hasSparkTTSQuranAyah,
  playSparkTTSQuranAyah,
} from './sparkTTSAudioService';

/**
 * Audio Service Class
 */
class AudioService {
  private currentSound: Sound | null = null;

  /**
   * Initialize the service
   */
  initialize() {
    // Configure sound category for iOS
    if (Platform.OS === 'ios') {
      Sound.setCategory('Playback', true);
    }
  }

  /**
   * Play audio from file or API
   * @param fileName Audio file name (without extension) or step ID for API audio
   * @param volume Volume level (0-100)
   * @param onComplete Callback when playback completes
   * @param useApi Whether to use API for Quranic recitations
   */
  async playAudio(
    fileName: string,
    volume: number = 80,
    onComplete?: () => void,
    useApi: boolean = true,
  ): Promise<void> {
    // Check if this is a Quranic recitation that should use API
    if (useApi && isQuranicRecitation(fileName)) {
      try {
        const mapping = getAudioMapping(fileName);
        if (mapping && mapping.type === 'full_surah') {
          // Try Spark-TTS first (if available)
          if (await hasSparkTTSQuranAyah(mapping.surah, mapping.ayah)) {
            await playSparkTTSQuranAyah(mapping.surah, mapping.ayah, volume);
            if (onComplete) {
              onComplete();
            }
            return;
          }
          // Fall back to API
          const filePath = await getFullSurahAudio(mapping.surah, 'alafasy');
          await this.playAudioFromPath(filePath, volume, onComplete);
          return;
        } else if (mapping) {
          // Try Spark-TTS first (if available)
          if (await hasSparkTTSQuranAyah(mapping.surah, mapping.ayah)) {
            await playSparkTTSQuranAyah(mapping.surah, mapping.ayah, volume);
            if (onComplete) {
              onComplete();
            }
            return;
          }
          // Fall back to API
          await playQuranicAudio(mapping.surah, mapping.ayah, 'alafasy', volume);
          if (onComplete) {
            onComplete();
          }
          return;
        }
      } catch (error) {
        // Silent fallback - log for debugging but don't show user error
        if (__DEV__) {
          console.warn('API audio failed, falling back to local file:', error);
        }
        // Fall through to local file playback
      }
    }

    // Check if this is a prayer phrase (non-Quranic)
    const phraseMapping: Record<string, PrayerPhrase> = {
      takbir: 'takbir',
      ruku: 'ruku',
      sujud: 'sujud',
      tashahhud: 'tashahhud',
      salam: 'salam',
      subhan_rabbial_ala: 'subhan_rabbial_ala',
      subhan_rabbial_azeem: 'subhan_rabbial_azeem',
      sami_allahu_liman_hamidah: 'sami_allahu_liman_hamidah',
      rabbana_lakal_hamd: 'rabbana_lakal_hamd',
    };

    if (phraseMapping[fileName]) {
      try {
        // Try Spark-TTS audio first (if available)
        if (await hasSparkTTSAudio(fileName)) {
          await playSparkTTSPhrase(fileName, volume);
          if (onComplete) {
            onComplete();
          }
          return;
        }
        // Fall back to regular phrase service
        await playPhrase(phraseMapping[fileName], volume);
        if (onComplete) {
          onComplete();
        }
        return;
      } catch (error) {
        // Silent fallback - log for debugging but don't show user error
        if (__DEV__) {
          console.warn('Phrase audio service failed, falling back to local file:', error);
        }
        // Fall through to local file playback
      }
    }

    // Fallback to local file playback
    try {
      return await this.playAudioFromFile(fileName, volume, onComplete);
    } catch (error) {
      // Silent failure - audio is optional, don't disrupt user experience
      if (__DEV__) {
        console.warn('Local audio file playback failed:', error);
      }
      // Still call onComplete to prevent UI from getting stuck
      if (onComplete) {
        onComplete();
      }
      // Return silently without throwing
      return;
    }
  }

  /**
   * Play audio from local file
   */
  private async playAudioFromFile(
    fileName: string,
    volume: number,
    onComplete?: () => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Stop any currently playing sound
      this.stopAudio();

      // Create new sound instance
      // For guided salah, audio files should be in the same location as Azan files
      const sound = new Sound(fileName, Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          // Silent failure - log only in dev mode
          if (__DEV__) {
            console.warn('Error loading audio file:', fileName, error);
          }
          reject(error);
          return;
        }

        // Set volume (0.0 to 1.0)
        sound.setVolume(volume / 100);

        // Play audio
        sound.play((success) => {
          if (success) {
            if (__DEV__) {
              console.log('Audio played successfully:', fileName);
            }
            if (onComplete) {
              onComplete();
            }
            resolve();
          } else {
            // Silent failure - log only in dev mode
            if (__DEV__) {
              console.warn('Error playing audio file:', fileName);
            }
            reject(new Error('Failed to play audio'));
          }
          sound.release();
        });

        this.currentSound = sound;
      });
    });
  }

  /**
   * Play audio from file path (for cached API audio)
   */
  private async playAudioFromPath(
    filePath: string,
    volume: number,
    onComplete?: () => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stopAudio();

      const sound = new Sound(filePath, '', (error) => {
        if (error) {
          // Silent failure - log only in dev mode
          if (__DEV__) {
            console.warn('Error loading audio from path:', filePath, error);
          }
          reject(error);
          return;
        }

        sound.setVolume(volume / 100);
        sound.play((success) => {
          if (success) {
            if (onComplete) {
              onComplete();
            }
            resolve();
          } else {
            // Silent failure - log only in dev mode
            if (__DEV__) {
              console.warn('Error playing audio from path:', filePath);
            }
            reject(new Error('Failed to play audio'));
          }
          sound.release();
        });

        this.currentSound = sound;
      });
    });
  }

  /**
   * Stop currently playing audio
   */
  stopAudio() {
    if (this.currentSound) {
      this.currentSound.stop();
      this.currentSound.release();
      this.currentSound = null;
    }
  }

  /**
   * Check if audio is currently playing
   */
  isPlaying(): boolean {
    return this.currentSound !== null && this.currentSound.isPlaying();
  }
}

// Export singleton instance
export const audioService = new AudioService();
export default audioService;

