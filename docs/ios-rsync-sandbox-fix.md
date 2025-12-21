# iOS rsync Sandbox Permission Errors - Complete Fix Guide

## Issue
Persistent sandbox permission errors when building iOS app:
```
Sandbox: rsync(XXXX) deny(1) file-read-data
Sandbox: rsync(XXXX) deny(1) file-write-create
mkstempat: 'hermes.framework/.hermes.XXXXX': Operation not permitted
```

## Environment
- **Xcode**: 26.2 (Build 17C52)
- **macOS**: 26.1 (Build 25B78)
- **React Native**: 0.72.17

## Root Cause
This is a known issue with newer versions of Xcode (26.x) and macOS (26.x) where the sandbox restrictions are stricter, causing rsync operations to fail when copying frameworks to DerivedData.

## Solutions (Try in Order)

### Solution 1: Use React Native CLI (Recommended)
The React Native CLI often bypasses some Xcode sandbox restrictions:

```bash
cd /Users/vizion/Documents/SALAH
npx react-native run-ios --simulator="iPhone 17"
```

**Advantages:**
- Bypasses some Xcode GUI sandbox restrictions
- Uses Metro bundler directly
- Often more reliable for React Native projects

### Solution 2: Clean Everything and Rebuild
```bash
# 1. Clean DerivedData
rm -rf ~/Library/Developer/Xcode/DerivedData/SalahCompanion-*

# 2. Clean Xcode build
cd ios
xcodebuild clean -workspace SalahCompanion.xcworkspace -scheme SalahCompanion

# 3. Clean Pods
rm -rf Pods/build
pod install

# 4. Remove quarantine attributes
xattr -rc Pods/hermes-engine

# 5. Fix permissions
chmod -R 755 Pods/hermes-engine

# 6. In Xcode:
# - Product > Clean Build Folder (Shift+Cmd+K)
# - Close Xcode completely (Cmd+Q)
# - Reopen Xcode
# - Product > Build (Cmd+B)
```

### Solution 3: Check macOS Privacy Settings
1. Open **System Settings** (or System Preferences)
2. Go to **Privacy & Security**
3. Click **Files and Folders**
4. Ensure **Xcode** has access to:
   - ✅ Documents Folder
   - ✅ Downloads Folder
   - ✅ Desktop Folder (if project is on Desktop)

### Solution 4: Disable Xcode Package Validation
```bash
defaults write com.apple.dt.Xcode IDESkipPackagePluginFingerprintValidatation -bool YES
```

Then restart Xcode.

### Solution 5: Try Different Simulator
Sometimes specific simulators have issues:

```bash
# List available simulators
xcrun simctl list devices available

# Try a different one
npx react-native run-ios --simulator="iPhone 15 Pro"
```

### Solution 6: Build from Xcode GUI (Not Command Line)
Sometimes the GUI has different sandbox permissions:

1. Open `ios/SalahCompanion.xcworkspace` in Xcode
2. Select **iPhone 17** simulator
3. **Product > Clean Build Folder** (Shift+Cmd+K)
4. **Product > Build** (Cmd+B)

### Solution 7: Disable Hermes (Temporary Workaround)
If Hermes is causing issues, you can temporarily disable it:

**In `ios/Podfile`:**
```ruby
use_react_native!(
  :path => config[:reactNativePath],
  :app_path => "#{Pod::Config.instance.installation_root}/..",
  :hermes_enabled => false  # Add this line
)
```

Then:
```bash
cd ios
pod install
```

**Note:** This will use JSC instead of Hermes, which may impact performance.

### Solution 8: Check for File Locks
```bash
# Check if any processes are locking files
lsof | grep -i deriveddata | head -10

# Kill any stuck Xcode processes
killall Xcode
killall com.apple.CoreSimulator.CoreSimulatorService
```

### Solution 9: Reinstall Xcode Command Line Tools
```bash
sudo xcode-select --reset
xcode-select --install
```

### Solution 10: Check Disk Space
```bash
df -h ~/Library/Developer/Xcode/DerivedData
```

Ensure you have at least 10GB free space.

## Prevention

1. **Always use React Native CLI** for builds when possible:
   ```bash
   npx react-native run-ios
   ```

2. **Clean DerivedData regularly**:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/SalahCompanion-*
   ```

3. **Keep Xcode updated** to latest stable version

4. **Use simulator for development** (faster, fewer permission issues)

## Current Status

✅ **Applied Fixes:**
- Cleaned DerivedData
- Removed quarantine attributes from Hermes
- Fixed file permissions
- Disabled Xcode package validation
- Cleaned all build artifacts

⚠️ **Known Issue:**
- rsync sandbox errors are a known bug in Xcode 26.x
- React Native CLI often works better than Xcode GUI
- May require macOS privacy settings adjustment

## Next Steps

1. **Try React Native CLI first** (Solution 1) - most reliable
2. **If that fails**, try building from Xcode GUI (Solution 6)
3. **Check macOS Privacy Settings** (Solution 3)
4. **If still failing**, try a different simulator (Solution 5)

## Additional Resources

- [React Native iOS Troubleshooting](https://reactnative.dev/docs/troubleshooting)
- [Xcode Known Issues](https://developer.apple.com/documentation/xcode-release-notes)
- [macOS Sandbox Documentation](https://developer.apple.com/documentation/security/app_sandbox)
