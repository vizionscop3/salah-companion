# iOS Hermes Framework Fix

**Date**: December 22, 2024

## Issue

**Error**: 
```
Library not loaded: @rpath/hermes.framework/hermes
Termination Reason: Namespace DYLD, Code 1, Library missing
```

**Root Cause**: 
The Hermes JavaScript engine framework is not being embedded in the iOS app bundle during the build process.

## Solution

### 1. Reinstall Pods

The Hermes framework needs to be properly linked. Reinstall CocoaPods:

```bash
cd ios
pod deintegrate
pod install
```

### 2. Clean Build

Clean the Xcode build:

```bash
cd ios
xcodebuild clean -workspace SalahCompanion.xcworkspace -scheme SalahCompanion
```

Or in Xcode:
- Product → Clean Build Folder (Shift+Cmd+K)

### 3. Rebuild

Rebuild the app:

```bash
npm run ios
```

Or in Xcode:
- Product → Build (Cmd+B)
- Product → Run (Cmd+R)

## What Was Fixed

✅ Updated `fix-hermes-after-build.sh` to:
- Use Xcode build variables (`TARGET_BUILD_DIR`, `FRAMEWORKS_FOLDER_PATH`)
- Support both simulator and device architectures
- Handle missing directories gracefully
- Verify framework has both binary and Info.plist

✅ Post-build script runs after framework embedding to ensure Hermes is copied

## Verification

After rebuild, check that:
- ✅ App launches without crashing
- ✅ No "Library not loaded" errors
- ✅ Hermes framework exists in app bundle

## If Issue Persists

1. **Check Pods Installation**:
   ```bash
   cd ios
   ls -la Pods/hermes-engine/destroot/Library/Frameworks/universal/hermes.xcframework/
   ```

2. **Verify Framework Exists**:
   ```bash
   ls -la Pods/hermes-engine/destroot/Library/Frameworks/universal/hermes.xcframework/ios-arm64_x86_64-simulator/hermes.framework/
   ```

3. **Check Xcode Build Phases**:
   - Open `SalahCompanion.xcworkspace` in Xcode
   - Select project → Build Phases
   - Verify "[CP] Embed Pods Frameworks" runs
   - Verify "[Post-Embed] Fix Hermes Framework" runs after it

4. **Manual Fix** (if needed):
   ```bash
   cd ios
   ./fix-hermes-after-build.sh
   ```

## Alternative: Disable Hermes (Not Recommended)

If Hermes continues to cause issues, you can disable it (not recommended for production):

1. Edit `ios/Podfile`:
   ```ruby
   use_react_native!(
     :path => config[:reactNativePath],
     :app_path => "#{Pod::Config.instance.installation_root}/..",
     :hermes_enabled => false  # Add this
   )
   ```

2. Reinstall pods:
   ```bash
   cd ios
   pod install
   ```

3. Rebuild app

**Note**: Disabling Hermes will reduce JavaScript performance significantly.

