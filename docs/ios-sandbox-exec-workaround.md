# iOS sandbox-exec Workaround - Xcode 26.x Issue

## Critical Issue

Even with **Full Disk Access enabled** and **Mac restarted**, the build is still failing with sandbox errors:

```
error: Sandbox: rsync(XXXX) deny(1) file-read-data
error: Sandbox: ditto(XXXX) deny(1) file-write-create  
error: Sandbox: cp(XXXX) deny(1) file-write-create
```

## Root Cause

**`sandbox-exec`** is a separate security mechanism from Full Disk Access:
- Full Disk Access applies to the Xcode **application**
- `sandbox-exec` applies to **build scripts** run by Xcode
- They have **separate sandbox profiles**
- Xcode 26.x uses extremely restrictive sandbox profiles

## Why All Copy Methods Fail

The build script tries:
1. ✅ `rsync` → Blocked by sandbox
2. ✅ `ditto` → Blocked by sandbox  
3. ✅ `cp` → Blocked by sandbox
4. ⚠️ `symlink` → Added as last resort (may work but not ideal)

All file operations are blocked because `sandbox-exec` enforces its own restrictions regardless of Full Disk Access.

## Solutions (Try in Order)

### Solution 1: Build from Xcode GUI (Recommended First)

The Xcode GUI sometimes has different sandbox permissions than command line:

1. **Open Xcode**:
   ```bash
   open ios/SalahCompanion.xcworkspace
   ```

2. **In Xcode**:
   - Select **iPhone 17** simulator
   - **Product > Clean Build Folder** (Shift+Cmd+K)
   - **Product > Build** (Cmd+B)

3. **Why this might work**:
   - GUI builds may use different sandbox profiles
   - Sometimes has more permissive settings
   - React Native CLI uses `xcodebuild` which has stricter sandbox

### Solution 2: Use Static Libraries Instead of Frameworks

Modify `ios/Podfile` to avoid framework copying:

```ruby
# Comment out or remove use_frameworks!
# use_frameworks! :linkage => linkage.to_sym

# Use static libraries instead
target 'SalahCompanion' do
  # ... rest of config
end
```

Then:
```bash
cd ios
pod install
```

**Note**: This may require code changes if your code expects frameworks.

### Solution 3: Manual Pre-Copy Script

Create a script that copies the framework before build:

```bash
# Create pre-build script
cat > ios/pre-copy-hermes.sh << 'EOF'
#!/bin/bash
HERMES_SOURCE="Pods/hermes-engine/destroot/Library/Frameworks/universal/hermes.xcframework/ios-arm64_x86_64-simulator/hermes.framework"
HERMES_DEST="$HOME/Library/Developer/Xcode/DerivedData/SalahCompanion-*/Build/Products/Debug-iphonesimulator/SalahCompanion.app/Frameworks/hermes.framework"

# Pre-create destination
mkdir -p "$(dirname "$HERMES_DEST")"
# Copy if source exists
if [ -d "$HERMES_SOURCE" ]; then
  cp -R "$HERMES_SOURCE" "$HERMES_DEST" 2>/dev/null || true
fi
EOF

chmod +x ios/pre-copy-hermes.sh
```

Run before building:
```bash
./ios/pre-copy-hermes.sh
npx react-native run-ios --simulator="iPhone 17"
```

### Solution 4: Disable Sandbox for Script Phase (Advanced)

This requires modifying the Xcode project file directly. **Not recommended** unless other solutions fail.

### Solution 5: Use Symlink (Current Fallback)

The script now tries symlink as last resort. This may work but:
- ⚠️ May cause runtime issues
- ⚠️ Framework must remain in original location
- ⚠️ Not ideal for production

## Current Status

✅ **Fallback chain implemented**: rsync → ditto → cp → symlink  
❌ **All copy methods blocked**: Even with Full Disk Access  
⚠️ **Symlink fallback**: May work but not ideal

## Recommended Next Steps

1. **Try building from Xcode GUI** (Solution 1) - most likely to work
2. **If that fails**, try static libraries (Solution 2)
3. **If still failing**, use pre-copy script (Solution 3)

## Known Issue

This is a **known bug in Xcode 26.x** with React Native projects. The sandbox restrictions are overly aggressive and block legitimate build operations.

**Workaround**: Build from Xcode GUI or use static libraries.

## References

- [Xcode 26 Release Notes](https://developer.apple.com/documentation/xcode-release-notes)
- [React Native iOS Build Issues](https://reactnative.dev/docs/troubleshooting)
- [macOS Sandbox Documentation](https://developer.apple.com/documentation/security/app_sandbox)
