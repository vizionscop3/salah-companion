/**
 * Audio Recording Service
 * 
 * Handles audio recording for recitation practice using react-native-audio-recorder-player.
 */

import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {Platform, PermissionsAndroid} from 'react-native';
import RNFS from 'react-native-fs';

const audioRecorderPlayer = new AudioRecorderPlayer();

/**
 * Get the recording directory path
 */
function getRecordingDirectory(): string {
  return `${RNFS.DocumentDirectoryPath}/recordings`;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  currentPosition: number;
  duration: number;
  filePath?: string;
}

class RecordingService {
  private recordingState: RecordingState = {
    isRecording: false,
    isPaused: false,
    currentPosition: 0,
    duration: 0,
  };

  private recordingPath?: string;
  private positionInterval?: NodeJS.Timeout;

  /**
   * Request recording permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'Salah Companion needs access to your microphone to record recitations.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (error) {
        console.error('Error requesting permissions:', error);
        return false;
      }
    }
    // iOS permissions are handled via Info.plist
    return true;
  }

  /**
   * Start recording
   */
  async startRecording(filePath: string): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission denied');
      }

      // Ensure directory exists
      const dir = filePath.includes('/') 
        ? filePath.substring(0, filePath.lastIndexOf('/'))
        : getRecordingDirectory();
      await RNFS.mkdir(dir).catch(() => {
        // Directory might already exist
      });

      // If filePath doesn't include full path, prepend directory
      const fullPath = filePath.startsWith('/') || filePath.startsWith('file://')
        ? filePath
        : `${dir}/${filePath}`;

      const audioSet = {
        AudioEncoderAndroid: Platform.select({
          android: 3, // AAC
          ios: undefined,
        }),
        AudioSourceAndroid: Platform.select({
          android: 1, // MIC
          ios: undefined,
        }),
        AVEncoderAudioQualityKeyIOS: 127, // High quality
        AVNumberOfChannelsKeyIOS: 2,
        AVFormatIDKeyIOS: Platform.select({
          ios: 'm4a' as any, // Type assertion needed for audio format
          android: undefined,
        }),
      };

      const uri = await audioRecorderPlayer.startRecorder(fullPath, audioSet);
      this.recordingPath = uri;
      this.recordingPath = uri;
      this.recordingState = {
        isRecording: true,
        isPaused: false,
        currentPosition: 0,
        duration: 0,
        filePath: uri,
      };

      // Start position tracking
      // Note: getCurrentPosition may not be available during recording
      // Using a simple timer-based approach instead
      this.positionInterval = setInterval(() => {
        // Position tracking during recording is approximate
        // The actual duration will be set when recording stops
        this.recordingState.currentPosition += 100;
        this.recordingState.duration += 100;
      }, 100);
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  /**
   * Pause recording
   */
  async pauseRecording(): Promise<void> {
    try {
      await audioRecorderPlayer.pauseRecorder();
      this.recordingState.isPaused = true;
      if (this.positionInterval) {
        clearInterval(this.positionInterval);
      }
    } catch (error) {
      console.error('Error pausing recording:', error);
      throw error;
    }
  }

  /**
   * Resume recording
   */
  async resumeRecording(): Promise<void> {
    try {
      await audioRecorderPlayer.resumeRecorder();
      this.recordingState.isPaused = false;

      // Resume position tracking
      // Note: getCurrentPosition may not be available during recording
      this.positionInterval = setInterval(() => {
        this.recordingState.currentPosition += 100;
        this.recordingState.duration += 100;
      }, 100);
    } catch (error) {
      console.error('Error resuming recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording
   */
  async stopRecording(): Promise<string> {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();

      if (this.positionInterval) {
        clearInterval(this.positionInterval);
      }

      this.recordingState = {
        isRecording: false,
        isPaused: false,
        currentPosition: 0,
        duration: 0,
        filePath: result,
      };

      return result;
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error;
    }
  }

  /**
   * Get current recording state
   */
  getRecordingState(): RecordingState {
    return {...this.recordingState};
  }

  /**
   * Format time in milliseconds to MM:SS
   */
  formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Play recorded audio
   */
  async playRecording(filePath: string): Promise<void> {
    try {
      await audioRecorderPlayer.startPlayer(filePath);
    } catch (error) {
      console.error('Error playing recording:', error);
      throw error;
    }
  }

  /**
   * Pause playback
   */
  async pausePlayback(): Promise<void> {
    try {
      await audioRecorderPlayer.pausePlayer();
    } catch (error) {
      console.error('Error pausing playback:', error);
      throw error;
    }
  }

  /**
   * Stop playback
   */
  async stopPlayback(): Promise<void> {
    try {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
    } catch (error) {
      console.error('Error stopping playback:', error);
      throw error;
    }
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.positionInterval) {
      clearInterval(this.positionInterval);
    }
    audioRecorderPlayer.removeRecordBackListener();
    audioRecorderPlayer.removePlayBackListener();
  }
}

export const recordingService = new RecordingService();
export default recordingService;

