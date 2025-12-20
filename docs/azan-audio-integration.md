# Azan Audio Integration Guide

## Status: ✅ **IMPLEMENTED**

**Implementation Date**: December 13, 2024

## Overview

The Azan audio system now supports both local files and remote URLs with automatic caching. This provides flexibility for users to:
- Use bundled local audio files
- Download Azan audio from remote URLs
- Cache audio for offline use
- Customize audio sources

## Implementation

### Service Architecture

1. **`azanAudioService.ts`** - New service for audio management
   - Remote URL support with caching
   - Local file fallback
   - Cache management utilities

2. **`azanService.ts`** - Enhanced existing service
   - Integrated with new audio service
   - Maintains backward compatibility
   - Automatic fallback to local files

### Features

✅ **Hybrid Audio Support**
- Local bundle files (primary)
- Remote URLs with caching (optional)
- Automatic fallback mechanism

✅ **Caching System**
- Automatic download and cache
- Offline playback support
- Cache management (clear, size check)

✅ **Multiple Voices**
- Makkah (Masjid al-Haram)
- Madinah (Masjid an-Nabawi)
- Al-Qatami (Sheikh Nasser Al-Qatami)
- Alafasy (Sheikh Mishary Rashid Alafasy)

## Configuration

### Using Local Files (Current Default)

Place audio files in:
- **Android**: `android/app/src/main/res/raw/`
- **iOS**: Main bundle

Files needed:
- `azan_makkah.mp3`
- `azan_madinah.mp3`
- `azan_qatami.mp3`
- `azan_alafasy.mp3`

### Using Remote URLs (Optional)

To enable remote URLs, update `azanAudioService.ts`:

```typescript
const AZAN_AUDIO_SOURCES: Record<AzanVoice, AzanAudioSource> = {
  makkah: {
    voice: 'makkah',
    localFile: 'azan_makkah.mp3',
    url: 'https://your-cdn.com/azan/makkah.mp3', // Add URL
    description: 'Masjid al-Haram, Makkah',
  },
  // ... other voices
};
```

Or programmatically:

```typescript
import {updateAzanSource} from '@services/azan/azanAudioService';

updateAzanSource('makkah', 'https://your-cdn.com/azan/makkah.mp3');
```

## Where to Get Azan Audio

### Copyright-Free Sources

⚠️ **Note**: Azan audio is typically not available through Quranic audio APIs. You'll need to:

1. **Record from Official Sources**
   - Contact Masjid al-Haram (Makkah) for official recordings
   - Contact Masjid an-Nabawi (Madinah) for official recordings
   - Obtain proper licensing for commercial use

2. **Use Licensed Libraries**
   - Islamic audio content providers
   - Licensed recitation libraries
   - Contact reciters or their representatives

3. **Community Sources** (Verify Licensing)
   - Open-source Islamic projects
   - Community-contributed audio (verify copyright)
   - Educational use only sources

### Recommended Approach

1. **Start with Local Files**: Add manually recorded/licensed files
2. **Add Remote URLs Later**: Once you have a CDN or hosting solution
3. **User Upload Option**: Allow users to add their own Azan files (future feature)

## API Usage

### Basic Playback

```typescript
import {azanService} from '@services/azan/azanService';

// Play with default voice
await azanService.playAzan();

// Play with specific voice and volume
await azanService.playAzan('makkah', 90);
```

### Cache Management

```typescript
import {
  isAzanCached,
  downloadAndCacheAzan,
  clearAzanCache,
  getAzanCacheSize,
  preCacheAllAzan,
} from '@services/azan/azanAudioService';

// Check if cached
const cached = await isAzanCached('makkah');

// Download and cache
await downloadAndCacheAzan('makkah', 'https://example.com/azan.mp3');

// Pre-cache all voices (if URLs configured)
await preCacheAllAzan();

// Clear cache
await clearAzanCache();

// Get cache size
const size = await getAzanCacheSize();
```

## File Structure

```
src/services/azan/
├── azanService.ts          # Main service (scheduling, notifications)
└── azanAudioService.ts     # Audio playback and caching
```

## Migration Path

### Current State
- ✅ Service supports both local and remote audio
- ✅ Automatic fallback to local files
- ✅ Caching system ready for URLs

### Next Steps
1. **Add Audio Files**: Place files in `res/raw/` (Android) or bundle (iOS)
2. **Configure URLs**: Add remote URLs if available
3. **Test Playback**: Verify all 4 voices work correctly
4. **User Testing**: Get feedback on audio quality

## Troubleshooting

### Audio Not Playing

1. **Check File Names**: Must match exactly (case-sensitive)
2. **Verify File Location**: 
   - Android: `res/raw/` directory
   - iOS: Main bundle
3. **Check Permissions**: Audio playback permissions granted
4. **Test Local First**: Ensure local files work before adding URLs

### Cache Issues

1. **Clear Cache**: Use `clearAzanCache()` function
2. **Check Storage**: Ensure device has storage space
3. **Verify URLs**: Remote URLs must be accessible
4. **Network**: Check internet connection for downloads

## Future Enhancements

- [ ] User-uploaded Azan files
- [ ] Custom Azan recording
- [ ] Multiple Azan styles per voice
- [ ] Azan preview before selection
- [ ] Quality selection (standard/high)

---

*Implemented: December 13, 2024*

