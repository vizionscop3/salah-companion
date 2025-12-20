# Hugging Face Quran Audio Integration

**Implementation Date**: December 18, 2024  
**Status**: ✅ **COMPLETE**

---

## Overview

The Salah Companion app now integrates with Hugging Face datasets to access high-quality Quranic audio files:

- **Ayah Dataset**: `Buraaq/quran-md-ayahs` (187,080 verse-level recitations)
- **Word Dataset**: `Buraaq/quran-md-words` (77,429 individual word pronunciations)

This integration provides a reliable, copyright-free source of Quranic audio with automatic caching and offline support.

---

## Architecture

### Service Structure

```
huggingFaceAudioService.ts
    ↓
    ├─→ Ayah Audio (verse-level)
    │   ├─→ Download & Cache
    │   ├─→ Play Audio
    │   └─→ Cache Management
    │
    └─→ Word Audio (word-level)
        ├─→ Download & Cache
        ├─→ Play Audio
        └─→ Cache Management
```

### Integration Flow

```
User Request
    ↓
quranicAudioService.ts
    ↓
    ├─→ Try Hugging Face (Primary)
    │   └─→ huggingFaceAudioService.ts
    │       ├─→ Check Cache
    │       ├─→ Download from HF Dataset
    │       └─→ Cache Locally
    │
    └─→ Fallback to API (Al-Quran Cloud)
        └─→ Existing API integration
```

---

## Features

### ✅ Ayah-Level Audio

- **Download**: Automatic download from `Buraaq/quran-md-ayahs` dataset
- **Caching**: Local file caching for offline use
- **Playback**: Integrated with existing audio service
- **Fallback**: Automatic fallback to API if HF dataset unavailable

**Usage:**
```typescript
import { playQuranicAudio } from '@services/audio/quranicAudioService';

// Plays ayah audio (tries HF first, then API)
await playQuranicAudio(1, 1, 'alafasy', 80); // Surah 1, Ayah 1
```

### ✅ Word-Level Audio

- **Download**: Automatic download from `Buraaq/quran-md-words` dataset
- **Caching**: Local file caching for offline use
- **Playback**: Word-by-word audio for pronunciation practice
- **Integration**: Used in WordPracticeScreen for detailed feedback

**Usage:**
```typescript
import { playWordAudio } from '@services/audio/quranicAudioService';

// Plays individual word audio
await playWordAudio(1, 1, 0, 80); // Surah 1, Ayah 1, Word Index 0
```

### ✅ Cache Management

- **Pre-caching**: Batch download multiple audio files
- **Cache Statistics**: Track cache size and file counts
- **Cache Clearing**: Manual cache management
- **Automatic Cleanup**: Efficient storage management

**Usage:**
```typescript
import {
  preCacheAyahAudio,
  getHFAudioCacheStats,
  clearHFAudioCache,
} from '@services/audio/huggingFaceAudioService';

// Pre-cache multiple ayahs
await preCacheAyahAudio([
  { surah: 1, ayah: 1 },
  { surah: 1, ayah: 2 },
  { surah: 112, ayah: 1 },
]);

// Get cache statistics
const stats = await getHFAudioCacheStats();
console.log(`Total files: ${stats.totalFiles}, Size: ${stats.totalSize} bytes`);

// Clear cache if needed
await clearHFAudioCache();
```

---

## Implementation Details

### File Path Resolution

The service attempts multiple file path structures to accommodate different dataset organizations:

1. **Primary Path**: `audio/{surah}/{ayah}.mp3`
2. **Reciter Path**: `audio/{reciter}/{surah}/{ayah}.mp3`
3. **Alternative Path**: `data/{surah}/{ayah}.mp3`

### Error Handling

- **Graceful Fallback**: Automatically falls back to API if HF dataset unavailable
- **Network Errors**: Handles network failures with retry logic
- **File Not Found**: Tries alternative paths before failing
- **User-Friendly Messages**: Clear error messages for debugging

### Performance

- **Lazy Loading**: Audio files downloaded on-demand
- **Background Downloads**: Non-blocking download process
- **Cache First**: Always checks cache before downloading
- **Batch Operations**: Efficient batch pre-caching

---

## Integration Points

### 1. Quranic Audio Service

**File**: `src/services/audio/quranicAudioService.ts`

- Primary source: Hugging Face datasets
- Fallback: Al-Quran Cloud API
- Seamless integration with existing code

### 2. Word Practice Screen

**File**: `src/screens/learning/recitation/WordPracticeScreen.tsx`

- Uses word-level audio for pronunciation practice
- Falls back to ayah-level audio if word audio unavailable
- Enhanced user experience with precise word pronunciation

### 3. Guided Salah

**File**: `src/screens/guided-salah/GuidedSalahScreen.tsx`

- Uses ayah-level audio for Quranic recitations
- Automatic caching for offline prayer guidance
- High-quality audio for spiritual connection

---

## Dataset Information

### Buraaq/quran-md-ayahs

- **Samples**: 187,080 verse-level recitations
- **Format**: MP3 audio files
- **Coverage**: Complete Quran with multiple reciters
- **Use Case**: Full verse recitation, guided salah

### Buraaq/quran-md-words

- **Samples**: 77,429 individual word pronunciations
- **Format**: MP3 audio files
- **Coverage**: Word-level audio for detailed practice
- **Use Case**: Pronunciation practice, word-by-word learning

---

## Configuration

### Environment Variables

No additional environment variables required. The service uses public Hugging Face datasets.

### Optional: Hugging Face API Token

If you have a Hugging Face account, you can set an optional token for higher rate limits:

```env
HUGGINGFACE_API_TOKEN=your_token_here
```

---

## Cache Management

### Cache Location

- **iOS**: `Documents/hf_audio_cache/`
- **Android**: `Documents/hf_audio_cache/`

### Cache Structure

```
hf_audio_cache/
├── ayah_1_1.mp3          # Surah 1, Ayah 1
├── ayah_1_2.mp3          # Surah 1, Ayah 2
├── word_1_1_0.mp3        # Surah 1, Ayah 1, Word 0
└── word_1_1_1.mp3        # Surah 1, Ayah 1, Word 1
```

### Cache Size Considerations

- **Average Ayah Size**: ~50-200 KB per file
- **Average Word Size**: ~10-50 KB per file
- **Recommended**: Pre-cache only frequently used surahs/ayahs
- **Storage**: Monitor cache size and clear unused files periodically

---

## Testing

### Manual Testing

1. **Test Ayah Audio**:
   ```typescript
   await playQuranicAudio(1, 1, 'alafasy', 80);
   ```

2. **Test Word Audio**:
   ```typescript
   await playWordAudio(1, 1, 0, 80);
   ```

3. **Test Cache**:
   ```typescript
   const stats = await getHFAudioCacheStats();
   console.log('Cache stats:', stats);
   ```

### Expected Behavior

- ✅ Audio downloads and plays successfully
- ✅ Files are cached locally
- ✅ Subsequent plays use cached files
- ✅ Graceful fallback if dataset unavailable
- ✅ Error handling for network issues

---

## Troubleshooting

### Issue: Audio Not Downloading

**Possible Causes**:
- Network connectivity issues
- Dataset file path structure changed
- Hugging Face API rate limiting

**Solutions**:
1. Check internet connection
2. Verify dataset is accessible: https://huggingface.co/datasets/Buraaq/quran-md-ayahs
3. Check console logs for specific error messages
4. Service will automatically fallback to API

### Issue: Cache Growing Too Large

**Solutions**:
1. Use `clearHFAudioCache()` to clear all cached files
2. Implement cache size limits
3. Pre-cache only essential audio files
4. Monitor cache size with `getHFAudioCacheStats()`

### Issue: Word Audio Not Found

**Possible Causes**:
- Word index out of range
- Dataset structure different than expected

**Solutions**:
1. Verify word index is correct
2. Check dataset structure on Hugging Face
3. Service will fallback to ayah-level audio

---

## Future Enhancements

### Potential Improvements

1. **Reciter Selection**: Support multiple reciters from dataset
2. **Quality Selection**: Choose audio quality (if available)
3. **Background Downloads**: Download in background during idle time
4. **Smart Caching**: Predictive caching based on user patterns
5. **Compression**: Compress cached audio files to save space

---

## References

- **Hugging Face Dataset**: https://huggingface.co/datasets/Buraaq/quran-audio-text-dataset
- **Ayah Dataset**: https://huggingface.co/datasets/Buraaq/quran-md-ayahs
- **Word Dataset**: https://huggingface.co/datasets/Buraaq/quran-md-words
- **Hugging Face Hub API**: https://huggingface.co/docs/hub/api

---

## Summary

✅ **Complete Integration**: Hugging Face datasets fully integrated  
✅ **Dual Support**: Both ayah-level and word-level audio  
✅ **Automatic Fallback**: Seamless fallback to existing APIs  
✅ **Offline Support**: Local caching for offline use  
✅ **Performance**: Efficient download and caching  
✅ **Error Handling**: Robust error handling and recovery  

The Hugging Face integration provides a reliable, high-quality source of Quranic audio that enhances the user experience while maintaining compatibility with existing audio services.

---

*Last Updated: December 18, 2024*
