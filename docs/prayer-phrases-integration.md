# Prayer Phrases Audio Integration Guide

## Status: ✅ **IMPLEMENTED**

**Implementation Date**: December 13, 2024

## Overview

The prayer phrases audio system provides support for non-Quranic prayer phrases used in guided salah. These phrases include Takbir, Ruku, Sujud, Tashahhud, Salam, and other supplications.

## Implementation

### Service Architecture

1. **`prayerPhrasesService.ts`** - New dedicated service
   - Remote URL support with caching
   - Local file fallback
   - Arabic text, transliteration, and translation included
   - Cache management utilities

2. **`audioService.ts`** - Enhanced existing service
   - Integrated with prayer phrases service
   - Automatic detection of prayer phrases
   - Seamless integration with existing API

### Supported Phrases

✅ **Core Prayer Phrases**:
- **Takbir** (الله أكبر) - "Allahu Akbar" - Opening declaration
- **Ruku** (سبحان ربي العظيم) - "Subhan Rabbi al-Azeem" - Bowing recitation
- **Sujud** (سبحان ربي الأعلى) - "Subhan Rabbi al-A'la" - Prostration recitation
- **Tashahhud** (التَّحِيَّاتُ لِلَّهِ...) - Testimony of faith
- **Salam** (السلام عليكم ورحمة الله) - Greeting to end prayer

✅ **Additional Supplications**:
- **Subhan Rabbi al-A'la** - Alternative prostration recitation
- **Subhan Rabbi al-Azeem** - Alternative bowing recitation
- **Sami'allahu liman hamidah** - Rising from bowing
- **Rabbana wa lakal hamd** - After rising from bowing

## Features

### Hybrid Audio Support
- **Primary**: Local bundle files
- **Optional**: Remote URLs with automatic caching
- **Fallback**: Graceful degradation if remote fails

### Rich Metadata
Each phrase includes:
- Arabic text
- Transliteration
- English translation
- Description
- Audio source configuration

### Caching System
- Automatic download and cache from URLs
- Offline playback support
- Cache management functions

## Configuration

### Using Local Files (Current Default)

Place audio files in:
- **Android**: `android/app/src/main/res/raw/`
- **iOS**: Main bundle

Files needed:
- `takbir.mp3`
- `ruku.mp3`
- `sujud.mp3`
- `tashahhud.mp3`
- `salam.mp3`
- `subhan_rabbial_ala.mp3` (optional)
- `subhan_rabbial_azeem.mp3` (optional)
- `sami_allahu_liman_hamidah.mp3` (optional)
- `rabbana_lakal_hamd.mp3` (optional)

### Using Remote URLs (Optional)

Update `prayerPhrasesService.ts`:

```typescript
const PRAYER_PHRASES: Record<PrayerPhrase, PrayerPhraseSource> = {
  takbir: {
    phrase: 'takbir',
    localFile: 'takbir.mp3',
    url: 'https://your-cdn.com/phrases/takbir.mp3', // Add URL
    // ... other fields
  },
  // ... other phrases
};
```

Or programmatically:

```typescript
import {updatePhraseSource} from '@services/audio/prayerPhrasesService';

updatePhraseSource('takbir', 'https://your-cdn.com/phrases/takbir.mp3');
```

## API Usage

### Basic Playback (Automatic)

The audio service automatically detects prayer phrases:

```typescript
import {audioService} from '@services/audio/audioService';

// Automatically uses prayer phrases service
await audioService.playAudio('takbir', 80);
await audioService.playAudio('ruku', 80);
await audioService.playAudio('sujud', 80);
```

### Direct Service Usage

```typescript
import {playPhrase, getPhraseInfo} from '@services/audio/prayerPhrasesService';

// Play phrase directly
await playPhrase('takbir', 80);

// Get phrase information
const info = getPhraseInfo('takbir');
console.log(info.arabicText); // 'الله أكبر'
console.log(info.translation); // 'Allah is the Greatest'
```

### Cache Management

```typescript
import {
  isPhraseCached,
  downloadAndCachePhrase,
  clearPhraseCache,
  getPhraseCacheSize,
  preCacheAllPhrases,
} from '@services/audio/prayerPhrasesService';

// Check if cached
const cached = await isPhraseCached('takbir');

// Download and cache
await downloadAndCachePhrase('takbir', 'https://example.com/takbir.mp3');

// Pre-cache all phrases (if URLs configured)
await preCacheAllPhrases();

// Clear cache
await clearPhraseCache();

// Get cache size
const size = await getPhraseCacheSize();
```

## Integration with Guided Salah

The service is automatically integrated with the guided salah screen:

```typescript
// In GuidedSalahScreen.tsx
await audioService.playAudio('takbir', 80); // Automatically uses prayer phrases service
await audioService.playAudio('ruku', 80);   // Automatically uses prayer phrases service
```

## File Structure

```
src/services/audio/
├── audioService.ts          # Main service (enhanced)
├── quranicAudioService.ts   # Quranic recitations
├── prayerPhrasesService.ts  # Prayer phrases (NEW)
└── audioMapping.ts          # Audio mapping (enhanced)
```

## Where to Get Audio Files

### Options

1. **Record Yourself**: Record phrases with proper pronunciation
2. **Licensed Libraries**: Use licensed Islamic audio content
3. **Community Sources**: Verify licensing for community-contributed audio
4. **TTS (Future)**: Consider AI TTS for educational phrases (not recommended for religious content)

### Recommended Approach

1. **Start with Local Files**: Add manually recorded/licensed files
2. **Add Remote URLs Later**: Once you have a CDN or hosting solution
3. **User Upload Option**: Allow users to add their own phrase files (future feature)

## Phrase Details

### Takbir (الله أكبر)
- **Arabic**: الله أكبر
- **Transliteration**: Allahu Akbar
- **Translation**: Allah is the Greatest
- **Usage**: Opening declaration, transitions

### Ruku (سبحان ربي العظيم)
- **Arabic**: سبحان ربي العظيم
- **Transliteration**: Subhan Rabbi al-Azeem
- **Translation**: Glory be to my Lord, the Great
- **Usage**: During bowing position

### Sujud (سبحان ربي الأعلى)
- **Arabic**: سبحان ربي الأعلى
- **Transliteration**: Subhan Rabbi al-A'la
- **Translation**: Glory be to my Lord, the Most High
- **Usage**: During prostration position

### Tashahhud
- **Arabic**: التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ
- **Transliteration**: At-tahiyyatu lillahi was-salawatu wat-tayyibatu
- **Translation**: All greetings, prayers, and good things are for Allah
- **Usage**: Sitting position, testimony of faith

### Salam (السلام عليكم ورحمة الله)
- **Arabic**: السلام عليكم ورحمة الله
- **Transliteration**: As-salamu alaykum wa rahmatullah
- **Translation**: Peace be upon you and the mercy of Allah
- **Usage**: Ending the prayer

## Benefits

1. **Comprehensive Coverage**: All essential prayer phrases included
2. **Rich Metadata**: Arabic text, transliteration, and translation
3. **Flexible Sources**: Local files or remote URLs
4. **Offline Support**: Cached files work without internet
5. **Seamless Integration**: Works automatically with existing audio service

## Next Steps

1. **Add Audio Files**: Place files in `res/raw/` (Android) or bundle (iOS)
2. **Configure URLs**: Add remote URLs if available
3. **Test Playback**: Verify all phrases work correctly
4. **User Testing**: Get feedback on audio quality and pronunciation

---

*Implemented: December 13, 2024*

