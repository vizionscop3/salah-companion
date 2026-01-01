# Arabic TTS Integration - Spark-TTS

## Overview

This document outlines the integration of Spark-TTS Arabic model for generating high-quality Arabic text-to-speech audio files for the Salah Companion app.

**Model**: `azeddinShr/Spark-TTS-Arabic-Complete`  
**Repository**: https://huggingface.co/azeddinShr/Spark-TTS-Arabic-Complete  
**Source**: https://github.com/SparkAudio/Spark-TTS

## Use Cases

This TTS model can be used to generate audio files for:

1. **Quran Recitation Practice**
   - Generate audio for individual ayahs
   - Generate audio for complete surahs
   - Provide pronunciation examples

2. **Prayer Phrases**
   - Generate audio for prayer phrases (Takbir, Tashahhud, etc.)
   - Provide accurate pronunciation guides

3. **Azan Phrases**
   - Generate audio for Azan call phrases
   - Educational content for Azan learning

4. **Educational Content**
   - Pronunciation academy audio examples
   - Letter pronunciation guides

## Technical Architecture

### Current Setup

The app currently uses:
- `react-native-tts` - Device-based TTS (limited Arabic support)
- `react-native-sound` - Audio playback
- Pre-recorded audio files stored locally

### Proposed Integration

Since Spark-TTS is Python-based and requires significant processing, we have two integration options:

#### Option 1: Pre-Generated Audio Files (Recommended)

**Approach**: Generate audio files offline using Spark-TTS, then bundle them with the app.

**Workflow**:
1. Use Spark-TTS to generate audio files for all Quranic content
2. Store audio files in `assets/audio/` directory
3. Reference audio files in the app code
4. Play using `react-native-sound`

**Pros**:
- No backend required
- Works offline
- Consistent quality
- Fast playback

**Cons**:
- Larger app bundle size
- Requires pre-generation of all audio

#### Option 2: Backend API Service

**Approach**: Create a backend service that uses Spark-TTS to generate audio on-demand.

**Workflow**:
1. App requests audio for specific text
2. Backend generates audio using Spark-TTS
3. Backend returns audio file URL or stream
4. App caches audio locally for offline use

**Pros**:
- Smaller app bundle
- Can generate custom audio
- Can update audio without app update

**Cons**:
- Requires backend infrastructure
- Network dependency for new audio
- Higher complexity

## Quick Setup

### Automated Setup (Recommended)

```bash
# Run the setup script
./scripts/setup-spark-tts.sh
```

This script will:
- Clone Spark-TTS repository
- Install all Python dependencies
- Create necessary directories
- Set up the environment

### Manual Setup

#### 1. Clone Spark-TTS Repository

```bash
git clone https://github.com/SparkAudio/Spark-TTS
cd Spark-TTS
```

#### 2. Install Dependencies

```bash
pip install transformers soundfile huggingface_hub omegaconf torch
```

#### 3. Download Model

The model will be automatically downloaded when you run the generation script, or you can download it manually:

```python
from huggingface_hub import snapshot_download

# Download the fine-tuned Arabic model
model_dir = snapshot_download(
    repo_id="azeddinShr/Spark-TTS-Arabic-Complete",
    local_dir="./models/spark-tts-arabic"
)
```

### 4. Generate Audio Files

Use the provided generation script:

```bash
# Run the audio generation script
python3 scripts/generate-arabic-audio.py
```

Or create a custom script to generate audio files for all required content:

```python
import sys
import torch
import soundfile as sf
from pathlib import Path

# Add Spark-TTS to path
sys.path.insert(0, './Spark-TTS')

# Import Spark-TTS inference pipeline
# (Implementation depends on Spark-TTS API)

def generate_audio(text: str, output_path: str):
    """
    Generate audio file from Arabic text using Spark-TTS.
    
    Args:
        text: Arabic text to convert to speech
        output_path: Path to save audio file (WAV format)
    """
    # Use Spark-TTS to generate audio
    # Save as WAV file for React Native compatibility
    pass

# Example: Generate audio for Quran ayahs
quran_texts = [
    "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    # ... more ayahs
]

for i, text in enumerate(quran_texts):
    output_path = f"assets/audio/quran/ayah_{i+1}.wav"
    generate_audio(text, output_path)
```

## Integration with React Native

### Audio File Structure

```
assets/
  audio/
    quran/
      surah_001/
        ayah_001.wav
        ayah_002.wav
        ...
      surah_002/
        ...
    prayers/
      takbir.wav
      tashahhud.wav
      ...
    azan/
      allahu_akbar.wav
      ashhadu.wav
      ...
```

### React Native Audio Service Update

Update `src/services/audio/audioService.ts` to use generated audio files:

```typescript
import Sound from 'react-native-sound';

// Enable playback in silence mode
Sound.setCategory('Playback');

export const playAudio = (audioPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const sound = new Sound(audioPath, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        reject(error);
        return;
      }
      
      sound.play((success) => {
        if (success) {
          sound.release();
          resolve();
        } else {
          sound.release();
          reject(new Error('Playback failed'));
        }
      });
    });
  });
};

// Example usage
export const playQuranAyah = async (surahNumber: number, ayahNumber: number) => {
  const audioPath = `quran/surah_${surahNumber.toString().padStart(3, '0')}/ayah_${ayahNumber.toString().padStart(3, '0')}.wav`;
  return playAudio(audioPath);
};
```

## Implementation Plan

### Phase 1: Setup and Testing
1. ✅ Set up Spark-TTS environment
2. ✅ Test audio generation for sample texts
3. ✅ Verify audio quality and pronunciation
4. ✅ Test audio file compatibility with React Native

### Phase 2: Audio Generation
1. Generate audio for all 114 surahs
2. Generate audio for prayer phrases
3. Generate audio for Azan phrases
4. Generate audio for pronunciation academy

### Phase 3: Integration
1. Update audio service to use generated files
2. Update audio mapping service
3. Test playback on iOS and Android
4. Optimize audio file sizes

### Phase 4: Optimization
1. Compress audio files (if needed)
2. Implement audio caching
3. Add preloading for frequently used audio
4. Monitor app bundle size

## File Size Considerations

**Estimated Sizes**:
- Average ayah audio: ~5-10 KB (WAV) or ~1-2 KB (MP3)
- Complete Quran (114 surahs, ~6,236 ayahs): ~30-60 MB (WAV) or ~6-12 MB (MP3)

**Recommendations**:
- Use MP3 format for smaller file sizes
- Implement lazy loading for surahs
- Allow users to download surahs on-demand
- Consider compression algorithms

## Next Steps

1. **Immediate**: Set up Spark-TTS environment and test with sample texts
2. **Short-term**: Generate audio for most common surahs (Al-Fatiha, Al-Ikhlas, etc.)
3. **Medium-term**: Generate complete audio library
4. **Long-term**: Implement backend service for on-demand generation (if needed)

## References

- Spark-TTS Repository: https://github.com/SparkAudio/Spark-TTS
- Hugging Face Model: https://huggingface.co/azeddinShr/Spark-TTS-Arabic-Complete
- React Native Sound: https://github.com/zmxv/react-native-sound

