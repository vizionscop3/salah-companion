# Device Testing Guide

This guide covers testing the Salah Companion app on Android devices and emulators.

## Prerequisites

### Development Environment

- Node.js 18+ installed
- React Native development environment set up
- Android Studio installed (for Android testing)
- Xcode installed (for iOS testing, macOS only)

### Required Tools

- Android SDK and platform tools
- Android emulator or physical device
- USB debugging enabled (for physical devices)
- Metro bundler

## Android Testing

### Setting Up Android Emulator

1. **Open Android Studio**
   ```bash
   # Or launch from Applications
   open -a "Android Studio"
   ```

2. **Create/Configure AVD (Android Virtual Device)**
   - Open AVD Manager: Tools → Device Manager
   - Create Virtual Device
   - Select device (e.g., Pixel 5)
   - Select system image (API 33 or higher recommended)
   - Finish setup

3. **Start Emulator**
   ```bash
   # List available emulators
   emulator -list-avds

   # Start specific emulator
   emulator -avd <emulator_name>
   ```

### Setting Up Physical Android Device

1. **Enable Developer Options**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Developer options will appear

2. **Enable USB Debugging**
   - Go to Settings → Developer Options
   - Enable "USB Debugging"
   - Connect device via USB

3. **Verify Connection**
   ```bash
   adb devices
   # Should show your device
   ```

### Running the App

1. **Start Metro Bundler**
   ```bash
   npm run dev
   # Or
   npx react-native start
   ```

2. **Run on Android**
   ```bash
   npm run android
   # Or
   npx react-native run-android
   ```

3. **For Physical Device**
   - Ensure device is connected and authorized
   - Run the same command
   - App will install and launch automatically

## Testing Checklist

### Core Features

#### Prayer Times
- [ ] Prayer times calculate correctly for current location
- [ ] Times update when location changes
- [ ] Next prayer countdown works accurately
- [ ] Prayer cards display correctly
- [ ] Visual timeline shows all prayers

#### Azan Playback
- [ ] Azan plays when triggered
- [ ] Volume control works
- [ ] Voice selection changes audio
- [ ] Stop button works
- [ ] Audio doesn't overlap

#### Qibla Compass
- [ ] Compass initializes correctly
- [ ] Direction updates with device rotation
- [ ] Distance to Kaaba displays correctly
- [ ] Refresh button works
- [ ] Error handling for location denial

#### Guided Salah
- [ ] Steps display correctly
- [ ] Navigation (Next/Previous) works
- [ ] Progress bar updates
- [ ] Audio playback works (if files added)
- [ ] Arabic text renders correctly

#### Progress Tracking
- [ ] Progress card displays current data
- [ ] Streak calculation works
- [ ] Prayer completion records correctly
- [ ] Achievements count updates

#### Authentication
- [ ] Login screen displays
- [ ] Registration works
- [ ] User can log in
- [ ] User can log out
- [ ] Auth state persists

### Performance Testing

- [ ] App launches in < 3 seconds
- [ ] Navigation is smooth (60 FPS)
- [ ] No memory leaks during extended use
- [ ] Battery usage is reasonable
- [ ] Network requests are efficient

### Device-Specific Testing

#### Different Screen Sizes
- [ ] Small phones (5" or less)
- [ ] Standard phones (5-6")
- [ ] Large phones (6"+)
- [ ] Tablets (if supported)

#### Android Versions
- [ ] Android 10 (API 29)
- [ ] Android 11 (API 30)
- [ ] Android 12 (API 31)
- [ ] Android 13 (API 33)
- [ ] Android 14 (API 34)

### Edge Cases

- [ ] App behavior with no internet connection
- [ ] Location permission denied
- [ ] Location services disabled
- [ ] Background app behavior
- [ ] App resume from background
- [ ] Low memory scenarios
- [ ] Battery saver mode

## Debugging

### View Logs

```bash
# Android logs
adb logcat

# Filter React Native logs
adb logcat | grep ReactNativeJS

# Filter specific tag
adb logcat -s ReactNativeJS:V
```

### React Native Debugger

1. **Enable Debug Menu**
   - Shake device or press `Cmd+M` (Mac) / `Ctrl+M` (Windows/Linux)

2. **Open Dev Menu**
   - Select "Debug" or "Open Dev Menu"

3. **Use Chrome DevTools**
   - Opens Chrome with React DevTools
   - Inspect components, network, console

### Common Issues

#### App Won't Build
```bash
# Clean build
cd android
./gradlew clean
cd ..
npm run android
```

#### Metro Bundler Issues
```bash
# Clear cache
npm start -- --reset-cache
```

#### Native Module Issues
```bash
# Rebuild native modules
cd android
./gradlew clean
cd ios
pod install
cd ..
```

## Automated Testing

### Run Test Suite

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### E2E Testing (Future)

Consider setting up:
- Detox (for React Native E2E)
- Appium (cross-platform)
- Maestro (modern E2E framework)

## Performance Monitoring

### React Native Performance

```bash
# Enable performance monitor
# Shake device → "Show Perf Monitor"
```

### Memory Profiling

- Use Android Studio Profiler
- Monitor memory usage
- Check for leaks

## Reporting Issues

When reporting bugs, include:

1. **Device Information**
   - Device model
   - Android version
   - Screen size

2. **App Information**
   - App version
   - Build number

3. **Steps to Reproduce**
   - Detailed steps
   - Expected vs actual behavior

4. **Logs**
   - Relevant logcat output
   - Screenshots/videos if applicable

## Testing Schedule

### Daily Testing
- Core features (prayer times, Azan)
- Critical user flows

### Weekly Testing
- Full feature set
- Performance checks
- Edge cases

### Before Release
- Complete test suite
- All device sizes
- All supported Android versions
- Stress testing
- Battery usage analysis

---

**Note**: This guide focuses on Android. For iOS testing, see iOS-specific documentation (requires macOS and Xcode).

