# Future Implementations

This document tracks features and improvements planned for future implementation.

## Audio Files Integration

### Status: ✅ **IMPLEMENTED**

**Implementation Date**: December 12, 2024

**Decision**: Audio file integration using copyright-free Quranic audio sources has been implemented.

### Planned Approach

When implementing, we'll use one of these copyright-free sources:

1. **Al-Quran Cloud API** (Recommended)
   - Free API for Quranic audio
   - Multiple reciters available
   - Commercial use allowed
   - Direct streaming or download capability

2. **Quran.com API**
   - Free, open-source
   - Multiple reciters
   - Commercial use allowed
   - Well-documented API

3. **Everyayah.com**
   - Free Quranic audio
   - Multiple reciters
   - Download available

4. **Tanzil.net**
   - Free Quranic text and audio
   - Multiple reciters
   - Open source project

### Implementation Strategy

**Hybrid Approach** (Implemented):
- ✅ API integration with Al-Quran Cloud API
- ✅ Local caching for offline support
- ✅ Automatic download and caching
- ✅ Fallback to local files if API unavailable
- ✅ Full surah support (Al-Fatiha, Al-Ikhlas, etc.)

**Implementation Details**:
- Service: `src/services/audio/quranicAudioService.ts`
- Audio mapping: `src/services/audio/audioMapping.ts`
- Updated audio service: `src/services/audio/audioService.ts`
- Integrated with Guided Salah screen

**Required Audio Files**:
- ✅ Quranic recitations: Al-Fatiha, Al-Ikhlas (via API)
- ⚠️ Azan files: Still need manual addition (4 voices)
- ⚠️ Non-Quranic phrases: Takbir, Ruku, Sujud, Tashahhud, Salam (need separate source)

### Technical Implementation

- ✅ Audio format: MP3 support
- ✅ Caching: Local file system caching
- ✅ Offline support: Cached files work offline
- ✅ API integration: Al-Quran Cloud API
- ✅ Error handling: Graceful fallback to local files

---

## AI Text-to-Speech Integration

### Status: Deferred

**Decision**: AI TTS (Murf.ai or ElevenLabs) for audio generation will be considered for future implementation.

### Considerations

- **Use Cases**: Educational content, instructions, short phrases
- **Not Recommended For**: Azan, full Quranic recitations (use authentic recordings)
- **Hybrid Approach**: AI TTS for educational content, authentic recordings for religious content

---

## Additional Future Features

### Phase 2 Features
- ✅ **Arabic Pronunciation Academy** - IMPLEMENTED
  - Letter introduction module
  - Sound categories (familiar, modified, unique, emphatic)
  - 26 Arabic letters with pronunciation details
  - Progress tracking structure
- ⚠️ Recitation Practice System - In Progress
- ⚠️ Expanded Surah Library - Planned
- ⚠️ Azan Education Module - Planned
- ⚠️ Gamification System - Planned

### Phase 3 Features
- Premium Subscription
- Advanced Recitation Feedback
- Tajweed Analysis
- Ramadan Mode
- Widget Development

---

*Last Updated: December 12, 2024*

