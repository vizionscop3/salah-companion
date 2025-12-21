/**
 * Speech Recognition Service
 * 
 * Provides speech recognition for pronunciation accuracy analysis.
 * Supports both on-device recognition and cloud-based APIs.
 * Can analyze both real-time speech and recorded audio files.
 */

import {Platform, PermissionsAndroid} from 'react-native';
import RNFS from 'react-native-fs';
import axios from 'axios';

export interface SpeechRecognitionResult {
  text: string;
  confidence: number; // 0-1
  isFinal: boolean;
}

export interface PronunciationAnalysis {
  accuracy: number; // 0-100
  transcribedText: string;
  referenceText: string;
  phonemeMatches: PhonemeMatch[];
  issues: string[];
  suggestions: string[];
}

export interface PhonemeMatch {
  phoneme: string;
  matched: boolean;
  confidence: number;
  position: number;
}

class SpeechRecognitionService {
  private isListening: boolean = false;
  private recognitionInstance: any = null;
  
  // API configuration for cloud-based speech recognition
  private readonly WHISPER_API_URL = process.env.OPENAI_WHISPER_API_URL || 'https://api.openai.com/v1/audio/transcriptions';
  private readonly OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
  private readonly HUGGINGFACE_API_URL = process.env.HUGGINGFACE_API_URL || 'https://api-inference.huggingface.co/models';
  private readonly HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || '';

  /**
   * Request speech recognition permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Speech Recognition Permission',
            message: 'Salah Companion needs access to your microphone for pronunciation practice.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (error) {
        console.error('Error requesting speech recognition permissions:', error);
        return false;
      }
    }
    // iOS permissions are handled via Info.plist
    return true;
  }

  /**
   * Start listening for speech recognition
   * @param onResult Callback when speech is recognized
   * @param onError Callback for errors
   * @param language Language code (default: 'ar-SA' for Arabic)
   */
  async startListening(
    onResult: (result: SpeechRecognitionResult) => void,
    onError?: (error: Error) => void,
    language: string = 'ar-SA',
  ): Promise<void> {
    if (this.isListening) {
      console.warn('Speech recognition already listening');
      return;
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Speech recognition permission denied');
    }

    try {
      // Try to use react-native-voice if available
      const Voice = require('react-native-voice');
      
      Voice.onSpeechStart = () => {
        console.log('Speech recognition started');
      };

      Voice.onSpeechResults = (e: any) => {
        if (e.value && e.value.length > 0) {
          const result: SpeechRecognitionResult = {
            text: e.value[0],
            confidence: e.confidence?.[0] || 0.8,
            isFinal: true,
          };
          onResult(result);
        }
      };

      Voice.onSpeechError = (e: any) => {
        console.error('Speech recognition error:', e);
        if (onError) {
          onError(new Error(e.error?.message || 'Speech recognition failed'));
        }
      };

      Voice.onSpeechEnd = () => {
        console.log('Speech recognition ended');
        this.isListening = false;
      };

      await Voice.start(language);
      this.isListening = true;
      this.recognitionInstance = Voice;
    } catch (error) {
      console.warn('react-native-voice not available, using fallback:', error);
      // Fallback: Use Web Speech API (if available in React Native Web)
      // Or implement alternative recognition method
      throw new Error('Speech recognition not available');
    }
  }

  /**
   * Stop listening for speech recognition
   */
  async stopListening(): Promise<void> {
    if (!this.isListening || !this.recognitionInstance) {
      return;
    }

    try {
      await this.recognitionInstance.stop();
      this.isListening = false;
      this.recognitionInstance = null;
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }

  /**
   * Cancel speech recognition
   */
  async cancel(): Promise<void> {
    if (!this.isListening || !this.recognitionInstance) {
      return;
    }

    try {
      await this.recognitionInstance.cancel();
      this.isListening = false;
      this.recognitionInstance = null;
    } catch (error) {
      console.error('Error canceling speech recognition:', error);
    }
  }

  /**
   * Check if currently listening
   */
  isActive(): boolean {
    return this.isListening;
  }

  /**
   * Transcribe audio file using available speech recognition services
   * Priority: OpenAI Whisper > HuggingFace > react-native-voice > fallback
   */
  async transcribeAudioFile(audioFilePath: string, language: string = 'ar-SA'): Promise<string> {
    // Try OpenAI Whisper API first
    if (this.OPENAI_API_KEY) {
      try {
        return await this.transcribeWithOpenAI(audioFilePath, language);
      } catch (error) {
        console.warn('OpenAI Whisper failed, trying alternatives:', error);
      }
    }

    // Try HuggingFace Whisper model
    if (this.HUGGINGFACE_API_KEY) {
      try {
        return await this.transcribeWithHuggingFace(audioFilePath, language);
      } catch (error) {
        console.warn('HuggingFace Whisper failed, trying alternatives:', error);
      }
    }

    // Try react-native-voice (if available and supports file transcription)
    try {
      const Voice = require('@react-native-voice/voice');
      // Note: react-native-voice primarily supports real-time recognition
      // For file transcription, we'd need to use a different approach
      // This is a placeholder for future implementation
      throw new Error('File transcription not supported by react-native-voice');
    } catch (error) {
      console.warn('react-native-voice not available for file transcription:', error);
    }

    // Fallback: return empty string (will trigger mock analysis)
    console.warn('No speech recognition service available, using fallback');
    return '';
  }

  /**
   * Transcribe audio using OpenAI Whisper API
   */
  private async transcribeWithOpenAI(audioFilePath: string, language: string): Promise<string> {
    try {
      // Read audio file as base64
      const audioData = await RNFS.readFile(audioFilePath, 'base64');
      
      // Convert base64 to blob for FormData (simplified approach)
      // Note: In React Native, we may need to use a different approach
      // This is a simplified implementation
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'ios' ? audioFilePath : `file://${audioFilePath}`,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);
      formData.append('model', 'whisper-1');
      formData.append('language', language.split('-')[0]); // Extract 'ar' from 'ar-SA'

      const response = await axios.post(this.WHISPER_API_URL, formData, {
        headers: {
          'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      return response.data.text || '';
    } catch (error) {
      console.error('OpenAI Whisper transcription error:', error);
      throw error;
    }
  }

  /**
   * Transcribe audio using HuggingFace Whisper model
   */
  private async transcribeWithHuggingFace(audioFilePath: string, language: string): Promise<string> {
    try {
      // Read audio file as base64
      const audioData = await RNFS.readFile(audioFilePath, 'base64');
      
      // Use a general Arabic Whisper model or a Quran-specific one if available
      const model = 'openai/whisper-base'; // or 'tarteel-ai/whisper-base-ar-quran' if available
      
      const response = await axios.post(
        `${this.HUGGINGFACE_API_URL}/${model}`,
        {
          inputs: audioData,
          parameters: {
            language: language.split('-')[0],
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60 seconds for model inference
        },
      );

      return response.data.text || '';
    } catch (error) {
      console.error('HuggingFace Whisper transcription error:', error);
      throw error;
    }
  }

  /**
   * Analyze pronunciation from recorded audio file
   */
  async analyzePronunciationFromFile(
    audioFilePath: string,
    referenceText: string,
    language: string = 'ar-SA',
  ): Promise<PronunciationAnalysis> {
    try {
      // Transcribe the audio file
      const transcribedText = await this.transcribeAudioFile(audioFilePath, language);
      
      if (!transcribedText) {
        // Fallback: return mock analysis if transcription fails
        console.warn('Transcription failed, using fallback analysis');
        return this.analyzePronunciation('', referenceText);
      }

      // Analyze the transcribed text
      return this.analyzePronunciation(transcribedText, referenceText);
    } catch (error) {
      console.error('Error analyzing pronunciation from file:', error);
      // Return fallback analysis
      return this.analyzePronunciation('', referenceText);
    }
  }

  /**
   * Analyze pronunciation by comparing recognized text with reference
   */
  analyzePronunciation(
    recognizedText: string,
    referenceText: string,
  ): PronunciationAnalysis {
    // Normalize texts (remove diacritics, normalize whitespace)
    const normalizedRecognized = this.normalizeArabicText(recognizedText);
    const normalizedReference = this.normalizeArabicText(referenceText);

    // Calculate accuracy
    const accuracy = this.calculateAccuracy(normalizedRecognized, normalizedReference);

    // Identify phoneme matches
    const phonemeMatches = this.analyzePhonemes(normalizedRecognized, normalizedReference);

    // Identify issues
    const issues = this.identifyIssues(normalizedRecognized, normalizedReference, phonemeMatches);

    // Generate suggestions
    const suggestions = this.generateSuggestions(issues, phonemeMatches);

    return {
      accuracy,
      transcribedText: recognizedText,
      referenceText,
      phonemeMatches,
      issues,
      suggestions,
    };
  }

  /**
   * Normalize Arabic text for comparison
   */
  private normalizeArabicText(text: string): string {
    // Remove diacritics (tashkeel)
    return text
      .replace(/[\u064B-\u065F\u0670]/g, '') // Remove Arabic diacritics
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Calculate accuracy percentage between two texts
   */
  private calculateAccuracy(recognized: string, reference: string): number {
    if (reference.length === 0) return 0;
    if (recognized === reference) return 100;

    // Use Levenshtein distance
    const distance = this.levenshteinDistance(recognized, reference);
    const maxLength = Math.max(recognized.length, reference.length);
    
    return Math.max(0, 100 - (distance / maxLength) * 100);
  }

  /**
   * Calculate Levenshtein distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Analyze phonemes in recognized vs reference text
   */
  private analyzePhonemes(recognized: string, reference: string): PhonemeMatch[] {
    const matches: PhonemeMatch[] = [];
    const minLength = Math.min(recognized.length, reference.length);

    for (let i = 0; i < minLength; i++) {
      const recognizedChar = recognized[i];
      const referenceChar = reference[i];
      const matched = recognizedChar === referenceChar;

      matches.push({
        phoneme: referenceChar,
        matched,
        confidence: matched ? 1.0 : 0.5,
        position: i,
      });
    }

    return matches;
  }

  /**
   * Identify pronunciation issues
   */
  private identifyIssues(
    recognized: string,
    reference: string,
    phonemeMatches: PhonemeMatch[],
  ): string[] {
    const issues: string[] = [];
    const unmatchedPhonemes = phonemeMatches.filter(p => !p.matched);

    if (unmatchedPhonemes.length > phonemeMatches.length * 0.3) {
      issues.push('Multiple pronunciation errors');
    }

    // Check for specific Arabic letter issues
    const difficultLetters = ['ع', 'غ', 'ض', 'ص', 'ط', 'ظ'];
    const difficultErrors = unmatchedPhonemes.filter(p =>
      difficultLetters.includes(p.phoneme),
    );

    if (difficultErrors.length > 0) {
      issues.push('Difficulty with guttural/emphatic letters');
    }

    if (recognized.length < reference.length * 0.8) {
      issues.push('Missing sounds or letters');
    }

    if (recognized.length > reference.length * 1.2) {
      issues.push('Extra sounds detected');
    }

    return issues;
  }

  /**
   * Generate suggestions based on issues
   */
  private generateSuggestions(
    issues: string[],
    phonemeMatches: PhonemeMatch[],
  ): string[] {
    const suggestions: string[] = [];

    if (issues.includes('Difficulty with guttural/emphatic letters')) {
      suggestions.push('Focus on tongue placement for guttural sounds');
      suggestions.push('Practice the letters ع and غ separately');
    }

    if (issues.includes('Multiple pronunciation errors')) {
      suggestions.push('Slow down and focus on each sound');
      suggestions.push('Listen to the reference audio more carefully');
    }

    if (issues.includes('Missing sounds or letters')) {
      suggestions.push('Make sure to pronounce all letters clearly');
      suggestions.push('Practice word-by-word before full phrases');
    }

    return suggestions;
  }
}

// Export singleton instance
export const speechRecognitionService = new SpeechRecognitionService();
export default speechRecognitionService;



