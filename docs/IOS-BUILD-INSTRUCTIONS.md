# iOS Build Instructions

**Date**: December 26, 2024

---

## Building for iOS Simulator

### Default Command
```bash
npm run ios
```

This will automatically detect and use a booted simulator, or boot the default simulator.

### Specify Simulator
```bash
npm run ios -- --simulator="iPhone 17 Pro"
```

### List Available Simulators
```bash
xcrun simctl list devices available
```

---

## Building for Physical Device

### Prerequisites
1. **Unlock your device** - The device must be unlocked and trusted
2. **Trust the computer** - On your device, tap "Trust This Computer" when prompted
3. **Developer account** - Ensure your Apple Developer account is configured in Xcode
4. **Code signing** - Configure code signing in Xcode project settings

### Build Command
```bash
npm run ios -- --device="Lee's iPhone"
```

Or specify by device ID:
```bash
npm run ios -- --udid=00008101-001044292201001E
```

### Troubleshooting Physical Device Issues

#### Error: "Device may need to be unlocked"
**Solution**:
1. Unlock your iPhone
2. Disconnect and reconnect the USB cable
3. On your iPhone, tap "Trust This Computer" if prompted
4. In Xcode: Window → Devices and Simulators → Select your device → Check "Connect via network" if needed

#### Error: "Timed out waiting for destinations"
**Solution**:
1. Ensure device is unlocked
2. Restart Xcode
3. Clean build folder: `Product → Clean Build Folder` (Shift+Cmd+K)
4. Try building from Xcode directly: Open `ios/SalahCompanion.xcworkspace`

---

## Bundle File Configuration

The app now includes a bundled JavaScript file (`main.jsbundle`) that serves as a fallback when Metro bundler is unavailable.

### Bundle File Location
- **Source**: `ios/SalahCompanion/main.jsbundle` (2.8MB)
- **Included in**: App bundle resources

### How It Works
1. **Development (Metro running)**: App connects to Metro bundler for live reload
2. **Development (Metro not running)**: App falls back to bundled file
3. **Production**: App always uses bundled file

### Regenerating Bundle
If you need to regenerate the bundle file:
```bash
npx react-native bundle \
  --platform ios \
  --dev false \
  --entry-file index.js \
  --bundle-output ios/main.jsbundle \
  --assets-dest ios/
```

Then copy to app directory:
```bash
cp ios/main.jsbundle ios/SalahCompanion/main.jsbundle
```

---

## Build Troubleshooting

### Clean Build
If you encounter build issues:
```bash
# Clean iOS build
cd ios
rm -rf build
rm -rf Pods
pod install
cd ..

# Clean React Native cache
npm start -- --reset-cache
```

### Xcode Build
If command line build fails, try building from Xcode:
```bash
open ios/SalahCompanion.xcworkspace
```

Then in Xcode:
1. Select your target (simulator or device)
2. Product → Build (Cmd+B)
3. Product → Run (Cmd+R)

---

## Current Status

✅ **Bundle file**: Added to Xcode project  
✅ **Hermes framework**: Fixed and included  
✅ **AppDelegate**: Configured with bundle URL fallbacks  
✅ **Project file**: Validated and ready  

---

**Last Updated**: December 26, 2024


