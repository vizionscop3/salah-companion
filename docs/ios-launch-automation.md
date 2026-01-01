# iOS App Launch Automation

## 🚀 Quick Start

Launch the app on iPhone 17 simulator with a single command:

```bash
npm run ios:launch
```

Or directly:

```bash
./scripts/launch-ios-app.sh
```

## 📋 What the Script Does

The automation script performs the following steps:

1. **Finds iPhone 17 Simulator** - Locates the simulator with iOS 26.2
2. **Boots Simulator** - Ensures the simulator is running
3. **Creates JavaScript Bundle** - Generates `main.jsbundle` if needed
4. **Builds iOS App** - Compiles the native app (if not already built)
5. **Fixes Hermes Framework** - Ensures Hermes is properly embedded
6. **Copies Bundle to App** - Includes the JS bundle in the app
7. **Installs App** - Installs on the simulator
8. **Starts Metro Bundler** - Starts the development server (optional, app uses local bundle)
9. **Launches App** - Attempts multiple launch methods to start the app

## 🔧 Script Features

### Automatic Detection
- Detects if simulator is already booted
- Checks if bundle needs regeneration (older than 1 hour)
- Verifies app build status
- Validates Hermes framework

### Error Handling
- Graceful fallbacks if auto-launch fails
- Clear error messages and troubleshooting tips
- Multiple launch methods attempted

### Bundle Management
- Creates bundle automatically if missing
- Regenerates if bundle is stale
- Ensures bundle is included in app bundle

## 📱 Usage Examples

### Basic Launch
```bash
npm run ios:launch
```

### Manual Steps (if needed)
```bash
# 1. Create bundle
npm run bundle:ios

# 2. Build app
npx react-native run-ios --simulator="iPhone 17"

# 3. Launch manually
xcrun simctl launch <UDID> org.reactjs.native.example.SalahCompanion
```

## 🐛 Troubleshooting

### App Doesn't Launch Automatically

If the script installs the app but it doesn't launch:

1. **Manual Launch**: Open Simulator and tap the SalahCompanion icon
2. **Check Logs**: 
   ```bash
   xcrun simctl spawn <UDID> log stream --predicate 'processImagePath contains "SalahCompanion"'
   ```
3. **Rebuild**: 
   ```bash
   npm run bundle:ios
   npx react-native run-ios --simulator="iPhone 17"
   ```

### Hermes Framework Issues

If you see Hermes-related errors:

```bash
# The script automatically fixes this, but you can manually fix:
HERMES_SOURCE=$(find ios/Pods/hermes-engine -name "hermes.framework" -type d | grep "ios-arm64_x86_64-simulator" | head -1)
ditto "$HERMES_SOURCE" "ios/build/Build/Products/Debug-iphonesimulator/SalahCompanion.app/Frameworks/hermes.framework"
```

### Bundle Not Found

If the app can't find the bundle:

```bash
# Regenerate bundle
npm run bundle:ios

# Ensure it's in the app
cp ios/SalahCompanion/main.jsbundle ios/build/Build/Products/Debug-iphonesimulator/SalahCompanion.app/main.jsbundle

# Reinstall
xcrun simctl install <UDID> ios/build/Build/Products/Debug-iphonesimulator/SalahCompanion.app
```

## 📊 Script Output

The script provides detailed progress information:

```
🚀 iOS App Launch Automation
============================

📱 Step 1: Finding iPhone 17 simulator...
✅ Found: iPhone 17 (UDID: ...)

🔌 Step 2: Booting simulator...
✅ Simulator already booted

📦 Step 3: Creating JavaScript bundle...
✅ Bundle exists and is recent

🔨 Step 4: Building iOS app...
✅ App already built

🔧 Step 5: Checking Hermes framework...
✅ Hermes framework is valid

📦 Step 6: Ensuring bundle is in app...
✅ Bundle already in app

📥 Step 7: Installing app on simulator...
✅ App installed

🌐 Step 8: Starting Metro bundler...
✅ Metro bundler ready

🚀 Step 9: Launching app...
✅ App launched successfully

============================
✅ SUCCESS: App should now be running!
```

## 🔗 Related Commands

- `npm run bundle:ios` - Create JavaScript bundle only
- `npm run ios` - Standard React Native iOS build
- `npm run ios:iphone17` - Build for iPhone 17 specifically
- `npm run ios:test` - Bundle and build for testing

## 📝 Notes

- The app uses the local `main.jsbundle` file in DEBUG mode
- Metro bundler is started but the app doesn't require it (uses local bundle)
- The script handles all prerequisites automatically
- First build may take 5-10 minutes, subsequent builds are faster

