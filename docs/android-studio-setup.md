# Android Studio Setup Guide

## Step-by-Step Installation

### Step 1: Download Android Studio

1. **Visit**: https://developer.android.com/studio
2. **Download** the macOS version
3. **File size**: ~1GB

### Step 2: Install Android Studio

1. **Open the downloaded `.dmg` file**
2. **Drag Android Studio** to Applications folder
3. **Launch Android Studio** from Applications

### Step 3: Initial Setup Wizard

When you first launch Android Studio:

1. **Welcome Screen**: Click "Next"
2. **Install Type**: Choose "Standard" (recommended)
3. **SDK Components**: Make sure these are selected:
   - ✅ Android SDK
   - ✅ Android SDK Platform
   - ✅ Android Virtual Device
   - ✅ Performance (Intel HAXM) - if on Intel Mac
4. **License Agreement**: Accept all licenses
5. **Finish**: Wait for download and installation

**Installation Time**: ~10-15 minutes (depends on internet speed)

### Step 4: Configure SDK Location

After installation:

1. **Android Studio** → **Preferences** (or **Settings** on Windows)
2. **Appearance & Behavior** → **System Settings** → **Android SDK**
3. **Note the SDK Location** (usually: `~/Library/Android/sdk`)
4. **SDK Platforms Tab**: Install API 33 or higher
5. **SDK Tools Tab**: Ensure these are installed:
   - ✅ Android SDK Build-Tools
   - ✅ Android SDK Platform-Tools
   - ✅ Android Emulator
   - ✅ Intel x86 Emulator Accelerator (HAXM) - if on Intel Mac

### Step 5: Create Android Virtual Device (AVD)

1. **Android Studio** → **Tools** → **Device Manager**
2. **Click "Create Device"**
3. **Select Device**: Choose "Pixel 5" (recommended)
4. **Select System Image**: 
   - Choose **API 33** or higher
   - Click **Download** if not installed
   - Wait for download
5. **AVD Configuration**:
   - Name: `Pixel_5_API_33` (or your choice)
   - Click **Finish**

### Step 6: Verify Installation

Run these commands in terminal:

```bash
# Check Android SDK location
ls ~/Library/Android/sdk

# Should show directories like:
# - platform-tools
# - platforms
# - emulator
# - tools
```

### Step 7: Configure Environment Variables

After Android Studio is installed, run:

```bash
npm run test:setup:android
source ~/.zshrc
```

This will automatically configure:
- `ANDROID_HOME`
- `PATH` for `adb`, `emulator`, etc.

### Step 8: Verify Complete Setup

```bash
# Check setup
npm run test:setup

# Should show:
# ✅ Android SDK: /Users/vizion/Library/Android/sdk
# ✅ adb: Available
# ✅ Android Emulator: Available
```

---

## Quick Start Commands

### Start Emulator
```bash
# List available emulators
emulator -list-avds

# Start emulator (replace with your AVD name)
emulator -avd Pixel_5_API_33 &
```

### Run App on Emulator
```bash
# Terminal 1: Start Metro
npm run dev

# Terminal 2: Run on Android
npm run android
```

---

## Troubleshooting

### Issue: "SDK location not found"
**Solution**: 
1. Open Android Studio
2. Preferences → Android SDK
3. Note the SDK location
4. Run: `npm run test:setup:android` and enter the path when prompted

### Issue: "No emulator found"
**Solution**:
1. Open Android Studio
2. Tools → Device Manager
3. Create a new AVD (see Step 5 above)

### Issue: "HAXM not installed" (Intel Macs)
**Solution**:
1. Download from: https://github.com/intel/haxm/releases
2. Install the `.dmg` file
3. Restart Android Studio

### Issue: "Emulator is slow"
**Solution**:
1. Enable hardware acceleration in AVD settings
2. Allocate more RAM (2GB+ recommended)
3. Use x86_64 system image (not ARM)

---

## System Requirements

- **RAM**: 8GB minimum, 16GB recommended
- **Disk Space**: 10GB+ for SDK and emulator
- **macOS**: 10.14 (Mojave) or later
- **Java**: JDK 17 (already installed ✅)

---

## Next Steps After Setup

1. ✅ Android Studio installed
2. ✅ Android SDK configured
3. ✅ AVD created
4. ✅ Environment variables set
5. ✅ Run `npm run android` to test

---

*Last Updated: December 12, 2024*

