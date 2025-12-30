# Android Emulator Library Path Fix

## Problem

The Android emulator is failing to start with this error:
```
dyld[50917]: Library not loaded: @rpath/libandroid-emu-tracing.dylib
```

## Root Cause

The emulator binary is looking for the library in the wrong path. The library exists at:
- `/Users/vizion/Library/Android/sdk/emulator/lib64/libandroid-emu-tracing.dylib`

But the binary is searching in:
- `/Users/vizion/Library/Android/sdk/lib64/qt/lib/libandroid-emu-tracing.dylib`
- `/Users/vizion/Library/Android/sdk/emulator/qemu/darwin-aarch64/libandroid-emu-tracing.dylib`

## Solutions

### Solution 1: Use Android Studio (Recommended)

**Easiest and most reliable method:**

1. Open Android Studio
2. Go to **Tools → Device Manager**
3. Click the **Play** button next to your AVD (Pixel_5)
4. Wait for emulator to boot
5. Then run: `npx react-native run-android`

### Solution 2: Fix Environment Variables

Add to your `~/.zshrc` or `~/.bash_profile`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$PATH
export DYLD_LIBRARY_PATH=$ANDROID_HOME/emulator/lib64:$DYLD_LIBRARY_PATH
```

Then reload:
```bash
source ~/.zshrc
```

### Solution 3: Create Symbolic Link (Workaround)

```bash
# Create the directory if it doesn't exist
mkdir -p /Users/vizion/Library/Android/sdk/lib64/qt/lib

# Create symbolic link
ln -s /Users/vizion/Library/Android/sdk/emulator/lib64/libandroid-emu-tracing.dylib \
      /Users/vizion/Library/Android/sdk/lib64/qt/lib/libandroid-emu-tracing.dylib
```

### Solution 4: Reinstall Android SDK Platform Tools

1. Open Android Studio
2. Go to **Tools → SDK Manager**
3. Go to **SDK Tools** tab
4. Uncheck and recheck **Android SDK Platform-Tools**
5. Click **Apply** to reinstall

## Verification

After applying a solution, verify the emulator works:

```bash
# Check if emulator command works
emulator -list-avds

# Try to start emulator
emulator -avd Pixel_5
```

## Current Status

- ✅ Android SDK is installed at: `/Users/vizion/Library/Android/sdk`
- ✅ Library exists at: `/Users/vizion/Library/Android/sdk/emulator/lib64/libandroid-emu-tracing.dylib`
- ✅ AVD "Pixel_5" exists
- ⚠️ Emulator binary has incorrect library path configuration

## Recommendation

**Use Android Studio to launch the emulator** - it handles all path configurations automatically and is the most reliable method.

Once the emulator is running (via Android Studio), you can then run:
```bash
npx react-native run-android
```

The app will connect to the running emulator automatically.

