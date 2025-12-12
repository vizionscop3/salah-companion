# **Audio Files Setup Guide**

## **Azan Audio Files**

Place Azan audio files in the following locations:

### **iOS**
```
ios/SalahCompanion/
├── azan_makkah.mp3
├── azan_madinah.mp3
├── azan_qatami.mp3
└── azan_alafasy.mp3
```

**Steps:**
1. Open Xcode
2. Open `SalahCompanion.xcworkspace`
3. Right-click on `SalahCompanion` folder in Project Navigator
4. Select "Add Files to SalahCompanion..."
5. Select audio files
6. Make sure "Copy items if needed" is checked
7. Add to target: `SalahCompanion`

### **Android**
```
android/app/src/main/res/raw/
├── azan_makkah.mp3
├── azan_madinah.mp3
├── azan_qatami.mp3
└── azan_alafasy.mp3
```

**Steps:**
1. Create `raw` directory if it doesn't exist:
   ```bash
   mkdir -p android/app/src/main/res/raw
   ```
2. Copy audio files to this directory
3. Files will be automatically included in the build

## **Audio File Requirements**

- **Format**: MP3 (recommended) or WAV
- **Bitrate**: 128 kbps or higher
- **Sample Rate**: 44.1 kHz
- **Duration**: Full Azan (typically 2-3 minutes)
- **Quality**: High quality, clear audio

## **Where to Get Azan Audio**

1. **Makkah Azan**: Recordings from Masjid al-Haram
2. **Madinah Azan**: Recordings from Masjid an-Nabawi
3. **Al-Qatami**: Sheikh Nasser Al-Qatami recordings
4. **Alafasy**: Sheikh Mishary Rashid Alafasy recordings

## **Testing Audio**

After adding files, test in the app:

```typescript
import {azanService} from '@services/azan/azanService';

// Test playback
azanService.playAzan('makkah').then(() => {
  console.log('Azan played successfully');
});
```

## **File Size Considerations**

- Keep files under 5MB each for app size
- Consider offering download option for premium users
- Use compression if needed while maintaining quality

---

**Note**: Audio files are not included in the repository due to size and licensing. You'll need to obtain proper licenses for commercial use.

