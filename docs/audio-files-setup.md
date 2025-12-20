# Audio Files Setup Guide

This guide explains how to add Azan and guided salah audio files to the application.

## Required Audio Files

### Azan Audio Files

The app requires the following Azan audio files:

1. **azan_makkah.mp3** - Azan from Masjid al-Haram, Makkah
2. **azan_madinah.mp3** - Azan from Masjid an-Nabawi, Madinah
3. **azan_qatami.mp3** - Recitation by Sheikh Nasser Al-Qatami
4. **azan_alafasy.mp3** - Recitation by Sheikh Mishary Rashid Alafasy

### Guided Salah Audio Files

For guided salah mode, you'll need audio files for each prayer step. The naming convention should follow:

- `takbir.mp3` - "Allahu Akbar" recitation
- `fatiha.mp3` - Al-Fatiha recitation
- `ruku.mp3` - Ruku position recitation
- `sujud.mp3` - Sujud position recitation
- `tashahhud.mp3` - Tashahhud recitation
- `salam.mp3` - Salam recitation

## File Locations

### iOS

Place audio files in the iOS project:

```
ios/SalahCompanion/
├── azan_makkah.mp3
├── azan_madinah.mp3
├── azan_qatami.mp3
├── azan_alafasy.mp3
├── takbir.mp3
├── fatiha.mp3
├── ruku.mp3
├── sujud.mp3
├── tashahhud.mp3
└── salam.mp3
```

**Steps to add files in Xcode:**

1. Open `SalahCompanion.xcworkspace` in Xcode
2. Right-click on the `SalahCompanion` folder in Project Navigator
3. Select "Add Files to SalahCompanion..."
4. Select all audio files
5. Make sure "Copy items if needed" is checked
6. Ensure "Add to targets: SalahCompanion" is selected
7. Click "Add"

### Android

Place audio files in the Android `res/raw` directory:

```
android/app/src/main/res/raw/
├── azan_makkah.mp3
├── azan_madinah.mp3
├── azan_qatami.mp3
├── azan_alafasy.mp3
├── takbir.mp3
├── fatiha.mp3
├── ruku.mp3
├── sujud.mp3
├── tashahhud.mp3
└── salam.mp3
```

**Steps to add files:**

1. Create the `raw` directory if it doesn't exist:
   ```bash
   mkdir -p android/app/src/main/res/raw
   ```

2. Copy audio files to this directory

3. Files will be automatically included in the build

## Audio File Requirements

### Format Specifications

- **Format**: MP3 (recommended) or WAV
- **Bitrate**: 128 kbps or higher
- **Sample Rate**: 44.1 kHz
- **Channels**: Mono or Stereo
- **Duration**: 
  - Azan files: 2-3 minutes (full Azan)
  - Guided salah files: Varies by recitation (typically 10-60 seconds)

### Quality Guidelines

- Use high-quality recordings
- Ensure clear audio without background noise
- Maintain consistent volume levels across files
- Test playback on both iOS and Android devices

### File Size Considerations

- Keep individual files under 5MB for app size optimization
- Consider compression while maintaining quality
- For premium features, consider offering download option for larger files

## Where to Obtain Audio Files

### Copyright-Free Options (For Future Implementation)

**Note**: Audio file integration is deferred for later implementation. When ready, consider these copyright-free sources:

1. **Al-Quran Cloud API** (alquran.cloud)
   - Free API for Quranic audio
   - Multiple reciters available
   - Commercial use allowed
   - Direct streaming or download

2. **Quran.com API**
   - Free, open-source
   - Multiple reciters
   - Commercial use allowed
   - Well-documented API

3. **Everyayah.com**
   - Free Quranic audio
   - Multiple reciters
   - Download available
   - Verify commercial use terms

4. **Tanzil.net**
   - Free Quranic text and audio
   - Multiple reciters
   - Open source project

### Traditional Sources

1. **Makkah & Madinah Azan**
   - Official recordings from Masjid al-Haram and Masjid an-Nabawi
   - Contact mosque authorities for licensing

2. **Recitation Audio**
   - Licensed Islamic audio libraries
   - Reputable Islamic content providers
   - Contact reciters or their representatives for licensing

### Important Notes

⚠️ **Copyright & Licensing**: 
- Ensure you have proper licenses for commercial use
- Respect copyright holders' rights
- Audio files are NOT included in the repository due to licensing

⚠️ **Religious Authenticity**:
- Verify authenticity of recitations
- Ensure compliance with Islamic guidelines
- Consider scholar review for content accuracy

## Testing Audio Playback

After adding files, test in the app:

```typescript
import {azanService} from '@services/azan/azanService';

// Test Azan playback
azanService.playAzan('makkah').then(() => {
  console.log('Azan played successfully');
}).catch((error) => {
  console.error('Error playing Azan:', error);
});
```

### Troubleshooting

**iOS Issues:**
- Ensure files are added to the correct target
- Check file names match exactly (case-sensitive)
- Verify files are in the main bundle

**Android Issues:**
- Ensure files are in `res/raw/` (not `res/raws/`)
- File names must be lowercase with underscores
- Rebuild the app after adding files

**Playback Issues:**
- Check file format compatibility
- Verify file paths in code match actual file names
- Test on physical devices (not just emulators)

## Alternative: Remote Audio Files

For larger files or dynamic content, consider hosting audio files remotely:

1. Upload files to cloud storage (AWS S3, Google Cloud Storage)
2. Update service to fetch from URLs
3. Implement caching for offline access
4. Add download progress indicators

Example implementation:

```typescript
// In azanService.ts
const AZAN_URLS = {
  makkah: 'https://your-cdn.com/audio/azan_makkah.mp3',
  madinah: 'https://your-cdn.com/audio/azan_madinah.mp3',
  // ...
};
```

## Next Steps

1. Obtain licensed audio files
2. Add files to iOS and Android projects
3. Test playback on both platforms
4. Verify file sizes and app bundle size
5. Update documentation with actual file sources

---

**Note**: This is a placeholder guide. Actual audio files must be obtained and added according to your licensing agreements.

