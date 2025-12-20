# Testing Setup Guide

Complete guide for setting up and running tests on the Salah Companion app.

## Quick Start

### 1. Unit Tests (Jest)
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### 2. Type Checking
```bash
npm run type-check
```

### 3. Linting
```bash
npm run lint
npm run lint:fix
```

---

## Device Testing Setup

### Android Setup

#### Step 1: Install Android Studio
1. Download from https://developer.android.com/studio
2. Install Android SDK (API 33+ recommended)
3. Install Android Emulator

#### Step 2: Set Up Environment Variables
Add to your `~/.zshrc` or `~/.bash_profile`:

```bash
# Android SDK
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

Then reload:
```bash
source ~/.zshrc  # or source ~/.bash_profile
```

#### Step 3: Verify Setup
```bash
# Check adb is available
adb version

# Check Android SDK
echo $ANDROID_HOME

# List connected devices
adb devices
```

#### Step 4: Create Emulator
1. Open Android Studio
2. Tools → Device Manager
3. Create Virtual Device
4. Select device (Pixel 5 recommended)
5. Select system image (API 33+)
6. Finish

#### Step 5: Start Emulator
```bash
# List available emulators
emulator -list-avds

# Start emulator
emulator -avd <emulator_name> &

# Or use Android Studio Device Manager
```

### Physical Android Device

1. **Enable Developer Mode**
   - Settings → About Phone
   - Tap "Build Number" 7 times

2. **Enable USB Debugging**
   - Settings → Developer Options
   - Enable "USB Debugging"
   - Connect via USB

3. **Authorize Computer**
   - Device will prompt: "Allow USB debugging?"
   - Check "Always allow from this computer"
   - Tap "OK"

4. **Verify Connection**
   ```bash
   adb devices
   # Should show: <device_id>    device
   ```

---

## Running Tests on Device

### Step 1: Start Metro Bundler
```bash
npm run dev
# Keep this terminal open
```

### Step 2: Run on Android
```bash
# In a new terminal
npm run android
```

### Step 3: Monitor Logs
```bash
# View device logs
adb logcat | grep ReactNativeJS

# Or use React Native CLI
npx react-native log-android
```

---

## Testing Checklist

### ✅ Pre-Testing Setup
- [ ] Android Studio installed
- [ ] Android SDK configured
- [ ] Environment variables set
- [ ] Emulator or device connected
- [ ] Metro bundler running
- [ ] App builds successfully

### ✅ Core Features Testing

#### Prayer Times
- [ ] Prayer times calculate correctly
- [ ] Location permission requested
- [ ] Times update with location change
- [ ] Next prayer countdown accurate
- [ ] Prayer cards display correctly
- [ ] Visual timeline works

#### Azan System
- [ ] Azan service initializes
- [ ] Voice selection works (when audio files added)
- [ ] Volume control functional
- [ ] Notification scheduling works

#### Guided Salah
- [ ] All 5 prayers have steps
- [ ] Navigation (next/previous) works
- [ ] Step instructions display
- [ ] Arabic text renders correctly
- [ ] Audio playback works (when files added)
- [ ] Progress indicator accurate

#### Qibla Compass
- [ ] Location permission requested
- [ ] Qibla direction calculates
- [ ] Distance to Kaaba displays
- [ ] Compass visual updates
- [ ] Refresh button works

#### Progress Tracking
- [ ] Prayer completion records
- [ ] Streak calculation correct
- [ ] Progress card displays
- [ ] Achievements track

#### Authentication
- [ ] Registration works
- [ ] Login works
- [ ] Logout works
- [ ] Session persists
- [ ] Protected routes work

#### Profile & Settings
- [ ] Profile displays user info
- [ ] Settings save correctly
- [ ] Theme toggle works
- [ ] Azan preferences save

#### Pronunciation Academy
- [ ] Screen loads
- [ ] Letters display correctly
- [ ] Category filter works
- [ ] Letter detail view opens
- [ ] Progress tracking works

### ✅ Audio Integration Testing

#### Quranic Audio API
- [ ] API connection works
- [ ] Audio downloads successfully
- [ ] Files cache locally
- [ ] Offline playback works
- [ ] Error handling graceful

#### Test Audio Playback
```bash
# In React Native debugger or console
# Test Al-Fatiha playback
import {playQuranicAudio} from '@services/audio/quranicAudioService';
playQuranicAudio(1, 1, 'alafasy', 80);
```

### ✅ Error Scenarios
- [ ] No internet connection (offline mode)
- [ ] Location permission denied
- [ ] Invalid location data
- [ ] API errors handled gracefully
- [ ] Database errors handled

---

## Debugging Tools

### React Native Debugger
```bash
# Install
brew install --cask react-native-debugger

# Or download from:
# https://github.com/jhen0409/react-native-debugger/releases
```

### Chrome DevTools
1. Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android)
2. Select "Debug"
3. Chrome DevTools opens automatically

### Flipper (Recommended)
```bash
# Install Flipper
brew install --cask flipper

# Launch
open -a Flipper
```

### Logs
```bash
# Android logs
adb logcat | grep ReactNativeJS

# iOS logs (if testing iOS)
xcrun simctl spawn booted log stream --level=debug
```

---

## Common Issues & Solutions

### Issue: `adb: command not found`
**Solution**: Add Android SDK to PATH (see Step 2 above)

### Issue: `No devices found`
**Solution**:
```bash
# Restart adb server
adb kill-server
adb start-server
adb devices
```

### Issue: `Metro bundler not starting`
**Solution**:
```bash
# Clear cache
npm start -- --reset-cache

# Or
watchman watch-del-all
rm -rf node_modules
npm install
```

### Issue: `Build fails`
**Solution**:
```bash
# Clean Android build
cd android
./gradlew clean
cd ..
npm run android
```

### Issue: `Audio not playing`
**Solution**:
- Check device volume
- Verify audio files exist (for local files)
- Check API connection (for Quranic audio)
- Review console logs for errors

### Issue: `Location not working`
**Solution**:
- Check location permissions in device settings
- Verify location services enabled
- Test with mock location in emulator

---

## Automated Testing

### Run All Tests
```bash
# Unit tests
npm test

# Type check
npm run type-check

# Lint
npm run lint
```

### Test Coverage
```bash
npm run test:coverage
# View coverage report in coverage/ directory
```

---

## Performance Testing

### Check Bundle Size
```bash
# Android
cd android && ./gradlew bundleRelease
# Check app/build/outputs/bundle/release/app-release.aab

# iOS
cd ios && xcodebuild -workspace SalahCompanion.xcworkspace -scheme SalahCompanion archive
```

### Monitor Performance
- Use React Native Performance Monitor
- Shake device → "Show Perf Monitor"
- Or use Flipper Performance plugin

---

## Testing Best Practices

1. **Test on Real Devices**: Emulators are good, but real devices catch more issues
2. **Test Different Screen Sizes**: Various Android devices
3. **Test Offline Mode**: Disable WiFi/data
4. **Test Permissions**: Deny/allow location, storage, etc.
5. **Test Edge Cases**: Invalid data, network errors, etc.
6. **Test Performance**: Slow devices, low memory
7. **Test Accessibility**: Screen readers, font scaling

---

## Next Steps

After testing:
1. Document any bugs found
2. Create issues/tickets for fixes
3. Update test coverage
4. Prepare for beta testing

---

*Last Updated: December 12, 2024*

