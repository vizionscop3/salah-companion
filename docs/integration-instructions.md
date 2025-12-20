# Integration Instructions - Audio, AI, and Speech Recognition

## Status: ✅ **SERVICES CREATED - PACKAGES NEEDED**

**Last Updated**: December 14, 2024

## Overview

Three new services have been created for:
1. **Arabic Letter Audio** (TTS integration)
2. **Tarteel.ai API** (Recitation analysis)
3. **Speech Recognition** (Pronunciation feedback)

## Required Packages

### 1. Text-to-Speech (TTS) for Arabic Letters

```bash
npm install react-native-tts
# For iOS
cd ios && pod install
```

**Package**: `react-native-tts`
**Purpose**: On-device TTS for Arabic letter pronunciation
**Alternative**: Use TTS API (VoiceRSS, Google Cloud TTS, AWS Polly, Azure TTS)

### 2. Speech Recognition

```bash
npm install @react-native-voice/voice
# For iOS
cd ios && pod install
```

**Package**: `@react-native-voice/voice`
**Purpose**: Real-time speech recognition for pronunciation accuracy
**Alternative**: Use cloud-based APIs (Google Speech-to-Text, AWS Transcribe)

## Environment Variables

Add to `.env` file:

```env
# TTS API (optional - for cloud-based TTS)
TTS_API_KEY=your_tts_api_key_here
TTS_API_URL=https://api.voicerss.org/

# Tarteel.ai API (when available)
TARTEEL_API_URL=https://api.tarteel.ai/v1
TARTEEL_API_KEY=your_tarteel_api_key_here

# HuggingFace API (for Whisper model fallback)
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

## Service Integration

### 1. Letter Audio Service

**File**: `src/services/pronunciation/letterAudioService.ts`

**Usage**:
```typescript
import {playLetterAudioTTS} from '@services/pronunciation/letterAudioService';

// Play letter audio
await playLetterAudioTTS('ba', 80);

// Preload multiple letters
await preloadLetterAudio(['ba', 'ta', 'tha']);
```

**Features**:
- TTS API integration (VoiceRSS example)
- On-device TTS fallback (react-native-tts)
- Audio caching for offline use
- Automatic fallback chain

### 2. Tarteel.ai Service

**File**: `src/services/recitation/tarteelAIService.ts`

**Usage**:
```typescript
import {analyzeRecitationWithTarteel} from '@services/recitation/tarteelAIService';

const result = await analyzeRecitationWithTarteel({
  audioFilePath: '/path/to/recording.m4a',
  referenceText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  surahNumber: 1,
  ayahNumber: 1,
  practiceMode: 'ayah',
});
```

**Features**:
- Tarteel.ai API integration (when available)
- Whisper model fallback (HuggingFace)
- Automatic fallback to mock analysis
- Word-level, ayah-level, and surah-level analysis

### 3. Speech Recognition Service

**File**: `src/services/pronunciation/speechRecognitionService.ts`

**Usage**:
```typescript
import {speechRecognitionService} from '@services/pronunciation/speechRecognitionService';

// Start listening
await speechRecognitionService.startListening(
  (result) => {
    console.log('Recognized:', result.text);
  },
  (error) => {
    console.error('Error:', error);
  },
  'ar-SA', // Arabic (Saudi Arabia)
);

// Stop listening
await speechRecognitionService.stopListening();

// Analyze pronunciation
const analysis = speechRecognitionService.analyzePronunciation(
  recognizedText,
  referenceText,
);
```

**Features**:
- Real-time speech recognition
- Pronunciation accuracy analysis
- Phoneme-level matching
- Issue identification and suggestions

## Implementation Status

### ✅ Completed
- Service architecture and structure
- Integration with existing code
- Fallback mechanisms
- Error handling

### ⚠️ Pending
- Package installation (`react-native-tts`, `@react-native-voice/voice`)
- API key configuration
- Testing on devices
- iOS/Android permissions setup

## Next Steps

1. **Install Packages**:
   ```bash
   npm install react-native-tts @react-native-voice/voice
   cd ios && pod install
   ```

2. **Configure Environment Variables**:
   - Add API keys to `.env` file
   - Update `.env.example` with placeholders

3. **iOS Permissions** (Info.plist):
   ```xml
   <key>NSSpeechRecognitionUsageDescription</key>
   <string>Salah Companion needs speech recognition for pronunciation practice</string>
   <key>NSSpeechRecognitionUsageDescription</key>
   <string>Salah Companion needs microphone access for pronunciation practice</string>
   ```

4. **Android Permissions** (AndroidManifest.xml):
   ```xml
   <uses-permission android:name="android.permission.RECORD_AUDIO" />
   ```

5. **Test Integration**:
   - Test TTS for Arabic letters
   - Test speech recognition accuracy
   - Test Tarteel.ai API (when available)

## Alternative Implementations

### TTS Alternatives
- **Google Cloud TTS**: High-quality Arabic voices
- **AWS Polly**: Neural TTS with Arabic support
- **Azure TTS**: Multiple Arabic voices
- **Local TTS**: Use device TTS (lower quality but free)

### Speech Recognition Alternatives
- **Google Speech-to-Text API**: High accuracy, requires internet
- **AWS Transcribe**: Cloud-based transcription
- **On-device**: Use device recognition (privacy-friendly)

### AI Analysis Alternatives
- **Whisper Model**: OpenAI's Whisper fine-tuned for Arabic
- **Custom Model**: Train your own model
- **Hybrid Approach**: Combine multiple analysis methods

## Notes

1. **Tarteel.ai API**: Currently not publicly available. The service is structured to integrate when it becomes available, with fallbacks in place.

2. **Speech Recognition**: On-device recognition may have lower accuracy for non-native speakers. Consider cloud-based APIs for better results.

3. **TTS Quality**: Device TTS may not have perfect Arabic pronunciation. Consider using professional TTS APIs for better quality.

4. **Offline Support**: All services include caching and offline fallbacks where possible.

---

**Ready for package installation and testing!** 🚀




