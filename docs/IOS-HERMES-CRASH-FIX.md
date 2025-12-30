# iOS Hermes Framework Crash Fix

**Date**: December 26, 2024  
**Issue**: App crashes on launch with "Library not loaded: @rpath/hermes.framework/hermes"

---

## 🔴 Problem

The app crashes immediately on launch with this error:

```
Termination Reason: Namespace DYLD, Code 1, Library missing
Library not loaded: @rpath/hermes.framework/hermes
```

**Root Cause**: The Hermes JavaScript engine framework is not being embedded in the iOS app bundle during the build process.

---

## ✅ Solution

### Quick Fix (After Build)

If the app is already built and installed, manually copy the framework:

```bash
# Get app path
APP_PATH=$(xcrun simctl get_app_container booted org.reactjs.native.example.SalahCompanion)

# Create Frameworks directory
mkdir -p "$APP_PATH/Frameworks"

# Copy Hermes framework
HERMES_SOURCE="ios/Pods/hermes-engine/destroot/Library/Frameworks/universal/hermes.xcframework/ios-arm64_x86_64-simulator/hermes.framework"
ditto "$HERMES_SOURCE" "$APP_PATH/Frameworks/hermes.framework"

# Launch app
xcrun simctl launch booted org.reactjs.native.example.SalahCompanion
```

Or use the automated script:

```bash
./scripts/fix-hermes-manual.sh
```

### Permanent Fix (Rebuild)

1. **Clean Build**:
   ```bash
   cd ios
   xcodebuild clean -workspace SalahCompanion.xcworkspace -scheme SalahCompanion
   cd ..
   ```

2. **Reinstall Pods**:
   ```bash
   cd ios
   pod deintegrate
   pod install
   cd ..
   ```

3. **Rebuild**:
   ```bash
   npm run ios
   ```

The post-build script (`ios/fix-hermes-after-build.sh`) should automatically copy the framework during the build process.

---

## 🔍 Verification

After applying the fix, verify the framework is present:

```bash
# Check if framework exists
APP_PATH=$(xcrun simctl get_app_container booted org.reactjs.native.example.SalahCompanion)
ls -la "$APP_PATH/Frameworks/hermes.framework"

# Should show:
# - hermes (binary)
# - Info.plist
# - Headers/ (directory)
```

---

## 📝 Build Script Configuration

The fix script is configured in Xcode project:
- **Build Phase**: "[Post-Embed] Fix Hermes Framework"
- **Script**: `${SRCROOT}/fix-hermes-after-build.sh`
- **Runs**: After framework embedding, before validation

If the script isn't running, check:
1. Build phase is enabled
2. Script path is correct
3. Script has execute permissions: `chmod +x ios/fix-hermes-after-build.sh`

---

## 🐛 Troubleshooting

### Issue: Framework still missing after rebuild

**Solution**:
1. Check Xcode build logs for script execution
2. Verify script has execute permissions
3. Manually run the fix script after build
4. Check if `ENABLE_USER_SCRIPT_SANDBOXING` is blocking the script

### Issue: Script runs but framework not copied

**Solution**:
1. Check script logs in Xcode build output
2. Verify `TARGET_BUILD_DIR` and `FRAMEWORK_FOLDER_PATH` are set
3. Check if sandboxing is preventing file operations
4. Try disabling script sandboxing temporarily

### Issue: Framework copied but app still crashes

**Solution**:
1. Verify framework binary exists: `ls -la "$APP_PATH/Frameworks/hermes.framework/hermes"`
2. Check framework architecture matches simulator: `file "$APP_PATH/Frameworks/hermes.framework/hermes"`
3. Verify Info.plist exists
4. Check code signing

---

## 📊 Expected Results

After fix:
- ✅ App launches without crash
- ✅ Hermes framework in `Frameworks/` directory
- ✅ Framework has binary and Info.plist
- ✅ JavaScript executes correctly
- ✅ No DYLD errors in console

---

**Last Updated**: December 26, 2024

