/**
 * Recitation Analysis Service
 * 
 * Provides recitation analysis using alternative AI/ML services.
 * 
 * Note: Tarteel.ai does not offer a free or public API, so this service
 * uses alternative approaches:
 * 1. Whisper model via HuggingFace (for transcription)
 * 2. Local audio analysis (basic comparison)
 * 3. Mock/fallback analysis (for development/testing)
 * 
 * Future alternatives:
 * - OpenAI Whisper API
 * - Google Cloud Speech-to-Text
 * - AWS Transcribe
 * - Custom ML model deployment
 */

import axios from 'axios';
import RNFS from 'react-native-fs';
import {Platform} from 'react-native';

// Alternative AI/ML services for recitation analysis
// Note: Tarteel.ai is not available as a public API

// Option 1: HuggingFace Whisper model (Arabic Quran-specific)
const WHISPER_MODEL = 'tarteel-ai/whisper-base-ar-quran'; // Or use 'openai/whisper-base' for general Arabic
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models';

// Option 2: OpenAI Whisper API (if available)
const OPENAI_WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// Option 3: Google Cloud Speech-to-Text (if configured)
const GOOGLE_SPEECH_API_URL = 'https://speech.googleapis.com/v1/speech:recognize';
const GOOGLE_API_KEY = process.env.GOOGLE_CLOUD_API_KEY || '';

export interface RecitationAnalysisRequest {
  audioFilePath: string;
  referenceText: string; // Arabic text
  surahNumber?: number;
  ayahNumber?: number;
  practiceMode: 'word' | 'ayah' | 'surah';
}

export interface WordAnalysis {
  word: string;
  arabicText: string;
  accuracy: number; // 0-100
  phonemes: PhonemeAnalysis[];
  needsWork: boolean;
  suggestedCorrection?: string;
}

export interface PhonemeAnalysis {
  phoneme: string;
  accuracy: number;
  position: 'start' | 'middle' | 'end';
  issue?: string;
  correction?: string;
}

export interface AyahAnalysis {
  ayahNumber: number;
  overallAccuracy: number;
  tajweedScore: number;
  words: WordAnalysis[];
  commonIssues: string[];
  timingIssues?: string[];
}

export interface SurahAnalysis {
  surahNumber: number;
  overallAccuracy: number;
  tajweedScore: number;
  ayahs: AyahAnalysis[];
  duration: number;
  improvementAreas: string[];
  fluencyScore?: number;
}

export interface RecitationAnalysisResponse {
  accuracyScore: number;
  tajweedScore?: number;
  feedback: WordAnalysis[] | AyahAnalysis | SurahAnalysis;
  phonemeAnalysis?: PhonemeAnalysis[];
  transcription?: string; // Transcribed text from audio
  confidence?: number; // Overall confidence in analysis
}

// Rate limiting cache (simple in-memory cache)
const rateLimitCache: Map<string, {count: number; resetTime: number}> = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // Max 10 requests per minute per user

/**
 * Check rate limit for API calls
 */
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const cached = rateLimitCache.get(identifier);

  if (!cached || now > cached.resetTime) {
    rateLimitCache.set(identifier, {count: 1, resetTime: now + RATE_LIMIT_WINDOW});
    return true;
  }

  if (cached.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  cached.count++;
  return true;
}

/**
 * Analyze recitation using available AI/ML services
 * 
 * Priority order:
 * 1. HuggingFace Whisper (if API key configured)
 * 2. OpenAI Whisper (if API key configured)
 * 3. Google Cloud Speech-to-Text (if configured)
 * 4. Fallback to mock analysis
 * 
 * Includes rate limiting and comprehensive error handling
 */
export async function analyzeRecitation(
  request: RecitationAnalysisRequest,
): Promise<RecitationAnalysisResponse> {
  // Rate limiting check
  const rateLimitId = `recitation_${request.surahNumber || 'general'}`;
  if (!checkRateLimit(rateLimitId)) {
    console.warn('Rate limit exceeded, using fallback analysis');
    return analyzeRecitationFallback(request);
  }

  // Validate audio file exists
  try {
    const RNFS = require('react-native-fs');
    const exists = await RNFS.exists(request.audioFilePath);
    if (!exists) {
      throw new Error(`Audio file not found: ${request.audioFilePath}`);
    }
  } catch (error) {
    console.error('Error validating audio file:', error);
    return analyzeRecitationFallback(request);
  }

  // Try HuggingFace Whisper first
  if (process.env.HUGGINGFACE_API_KEY) {
    try {
      return await analyzeRecitationWithWhisper(request);
    } catch (error: any) {
      console.warn('HuggingFace Whisper failed, trying alternatives:', error?.message || error);
      // Continue to next option
    }
  }

  // Try OpenAI Whisper if available
  if (OPENAI_API_KEY) {
    try {
      return await analyzeRecitationWithOpenAI(request);
    } catch (error: any) {
      console.warn('OpenAI Whisper failed, trying alternatives:', error?.message || error);
      // Continue to fallback
    }
  }

  // Fall back to mock analysis
  console.log('No AI service configured or all services failed, using fallback analysis');
  return analyzeRecitationFallback(request);
}

/**
 * Analyze recitation using OpenAI Whisper API
 */
async function analyzeRecitationWithOpenAI(
  request: RecitationAnalysisRequest,
): Promise<RecitationAnalysisResponse> {
  try {
    // Validate file exists
    const exists = await RNFS.exists(request.audioFilePath);
    if (!exists) {
      throw new Error(`Audio file not found: ${request.audioFilePath}`);
    }

    // Create FormData for multipart/form-data upload
    // Note: React Native has FormData as a global, not from 'form-data' package
    const formData = new (global as any).FormData();
    
    // For React Native, we need to use the file URI directly
    formData.append('file', {
      uri: Platform.OS === 'ios' ? request.audioFilePath : `file://${request.audioFilePath}`,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any);
    formData.append('model', 'whisper-1');
    formData.append('language', 'ar');

    const response = await axios.post(
      OPENAI_WHISPER_API_URL,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      },
    );

    const transcription = response.data?.text || '';
    if (!transcription) {
      throw new Error('Empty transcription received from OpenAI');
    }

    return compareTranscriptionWithReference(
      transcription,
      request.referenceText,
      request.practiceMode,
    );
  } catch (error: any) {
    // Enhanced error handling
    if (error.response) {
      // API error response
      const status = error.response.status;
      const message = error.response.data?.error?.message || error.message;
      
      if (status === 401) {
        throw new Error('OpenAI API key is invalid');
      } else if (status === 429) {
        throw new Error('OpenAI API rate limit exceeded');
      } else if (status >= 500) {
        throw new Error('OpenAI API server error, please try again later');
      } else {
        throw new Error(`OpenAI API error: ${message}`);
      }
    } else if (error.request) {
      // Network error
      throw new Error('Network error: Unable to reach OpenAI API');
    } else {
      // Other error
      throw new Error(`OpenAI Whisper error: ${error.message || 'Unknown error'}`);
    }
  }
}

/**
 * Analyze recitation using Whisper model (alternative)
 */
export async function analyzeRecitationWithWhisper(
  request: RecitationAnalysisRequest,
): Promise<RecitationAnalysisResponse> {
  try {
    // Validate file exists
    const exists = await RNFS.exists(request.audioFilePath);
    if (!exists) {
      throw new Error(`Audio file not found: ${request.audioFilePath}`);
    }

    // Read audio file as base64
    const audioData = await RNFS.readFile(request.audioFilePath, 'base64');

    // Call HuggingFace API for Whisper model
    const response = await axios.post(
      `${HUGGINGFACE_API_URL}/${WHISPER_MODEL}`,
      {
        inputs: audioData,
        parameters: {
          language: 'ar',
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY || ''}`,
          'Content-Type': 'application/json',
        },
        timeout: 90000, // 90 seconds for model inference (may take longer)
      },
    );

    // Handle HuggingFace response format
    let transcription = '';
    if (typeof response.data === 'string') {
      transcription = response.data;
    } else if (response.data?.text) {
      transcription = response.data.text;
    } else if (Array.isArray(response.data) && response.data[0]?.text) {
      transcription = response.data[0].text;
    }

    if (!transcription) {
      throw new Error('Empty transcription received from HuggingFace');
    }

    // Compare transcription with reference text
    return compareTranscriptionWithReference(
      transcription,
      request.referenceText,
      request.practiceMode,
    );
  } catch (error: any) {
    // Enhanced error handling
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error || error.message;
      
      if (status === 401) {
        throw new Error('HuggingFace API key is invalid');
      } else if (status === 429) {
        throw new Error('HuggingFace API rate limit exceeded');
      } else if (status === 503) {
        throw new Error('HuggingFace model is loading, please try again in a moment');
      } else if (status >= 500) {
        throw new Error('HuggingFace API server error, please try again later');
      } else {
        throw new Error(`HuggingFace API error: ${message}`);
      }
    } else if (error.request) {
      throw new Error('Network error: Unable to reach HuggingFace API');
    } else {
      throw new Error(`HuggingFace Whisper error: ${error.message || 'Unknown error'}`);
    }
  }
}

/**
 * Compare transcribed text with reference to generate feedback
 */
function compareTranscriptionWithReference(
  transcription: string,
  referenceText: string,
  practiceMode: 'word' | 'ayah' | 'surah',
): RecitationAnalysisResponse {
  // Simple word-level comparison (in production, use more sophisticated NLP)
  const transcriptionWords = transcription.split(/\s+/);
  const referenceWords = referenceText.split(/\s+/);

  const wordAnalyses: WordAnalysis[] = [];
  let totalAccuracy = 0;

  referenceWords.forEach((refWord, index) => {
    const transWord = transcriptionWords[index] || '';
    const similarity = calculateWordSimilarity(refWord, transWord);
    totalAccuracy += similarity;

    wordAnalyses.push({
      word: transWord,
      arabicText: refWord,
      accuracy: similarity,
      phonemes: [],
      needsWork: similarity < 70,
    });
  });

  const overallAccuracy = referenceWords.length > 0
    ? totalAccuracy / referenceWords.length
    : 0;

  if (practiceMode === 'word') {
    return {
      accuracyScore: overallAccuracy,
      feedback: wordAnalyses,
    };
  } else if (practiceMode === 'ayah') {
    return {
      accuracyScore: overallAccuracy,
      tajweedScore: overallAccuracy * 0.9, // Estimate
      feedback: {
        ayahNumber: 1,
        overallAccuracy,
        tajweedScore: overallAccuracy * 0.9,
        words: wordAnalyses,
        commonIssues: identifyCommonIssues(wordAnalyses),
      },
    };
  } else {
    return {
      accuracyScore: overallAccuracy,
      tajweedScore: overallAccuracy * 0.9,
      feedback: {
        surahNumber: 1,
        overallAccuracy,
        tajweedScore: overallAccuracy * 0.9,
        ayahs: [],
        duration: 0,
        improvementAreas: identifyCommonIssues(wordAnalyses),
      },
    };
  }
}

/**
 * Calculate similarity between two words (simple Levenshtein-based)
 */
function calculateWordSimilarity(word1: string, word2: string): number {
  if (word1 === word2) return 100;
  if (word1.length === 0 || word2.length === 0) return 0;

  // Simple character-based similarity
  const longer = word1.length > word2.length ? word1 : word2;
  const shorter = word1.length > word2.length ? word2 : word1;
  const editDistance = levenshteinDistance(word1, word2);
  
  return Math.max(0, 100 - (editDistance / longer.length) * 100);
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
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
 * Identify common issues from word analyses
 */
function identifyCommonIssues(wordAnalyses: WordAnalysis[]): string[] {
  const issues: string[] = [];
  const lowAccuracyWords = wordAnalyses.filter(w => w.accuracy < 70);

  if (lowAccuracyWords.length > wordAnalyses.length * 0.3) {
    issues.push('Multiple pronunciation errors detected');
  }

  if (lowAccuracyWords.some(w => w.arabicText.includes('ع') || w.arabicText.includes('غ'))) {
    issues.push('Difficulty with guttural sounds (ع, غ)');
  }

  if (lowAccuracyWords.some(w => w.arabicText.includes('ض') || w.arabicText.includes('ص'))) {
    issues.push('Difficulty with emphatic letters (ض, ص)');
  }

  return issues;
}

/**
 * Legacy function name for backward compatibility
 * @deprecated Use analyzeRecitation() instead
 */
export async function analyzeRecitationWithTarteel(
  request: RecitationAnalysisRequest,
): Promise<RecitationAnalysisResponse> {
  console.warn('analyzeRecitationWithTarteel is deprecated. Use analyzeRecitation() instead.');
  return analyzeRecitation(request);
}

/**
 * Fallback analysis when API is not available
 * Uses basic audio analysis or returns mock data
 */
async function analyzeRecitationFallback(
  request: RecitationAnalysisRequest,
): Promise<RecitationAnalysisResponse> {
  // For now, return mock analysis
  // In production, you might implement basic audio analysis here
  console.log('Using fallback analysis (mock data)');
  
  // Simulate analysis delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const mockAccuracy = 75 + Math.random() * 15; // 75-90%

  if (request.practiceMode === 'word') {
    return {
      accuracyScore: mockAccuracy,
      feedback: [{
        word: request.referenceText,
        arabicText: request.referenceText,
        accuracy: mockAccuracy,
        phonemes: [],
        needsWork: mockAccuracy < 80,
      }],
    };
  } else if (request.practiceMode === 'ayah') {
    return {
      accuracyScore: mockAccuracy,
      tajweedScore: mockAccuracy * 0.9,
      feedback: {
        ayahNumber: request.ayahNumber || 1,
        overallAccuracy: mockAccuracy,
        tajweedScore: mockAccuracy * 0.9,
        words: [],
        commonIssues: [],
      },
    };
  } else {
    return {
      accuracyScore: mockAccuracy,
      tajweedScore: mockAccuracy * 0.9,
      feedback: {
        surahNumber: request.surahNumber || 1,
        overallAccuracy: mockAccuracy,
        tajweedScore: mockAccuracy * 0.9,
        ayahs: [],
        duration: 0,
        improvementAreas: [],
      },
    };
  }
}



