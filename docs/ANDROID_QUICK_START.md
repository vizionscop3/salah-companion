# Android Quick Start Guide

Quick reference for starting the development environment after reboot.

## After Reboot - Quick Start

### Option 1: Use the Automated Script

```bash
cd /Users/vizion/Documents/SALAH
./scripts/start-android-dev.sh
```

This script will:
- Check if Android emulator is running
- Clear Metro bundler cache
- Start Metro bundler
- Install and run the app on Android emulator

### Option 2: Manual Steps

#### 1. Start Android Emulator

Open Android Studio and start an emulator, or run:
```bash
emulator -avd <your_avd_name>
```

Wait for emulator to fully boot.

#### 2. Verify Emulator Connection

```bash
adb devices
```

You should see your emulator listed (e.g., `emulator-5554`).

#### 3. Clear Metro Cache and Start Metro Bundler

```bash
cd /Users/vizion/Documents/SALAH
npx react-native start --reset-cache
```

Keep this terminal open. Metro bundler will run here.

#### 4. Install and Run App (New Terminal)

Open a new terminal and run:
```bash
cd /Users/vizion/Documents/SALAH
npx react-native run-android
```

This will:
- Build the Android app
- Install it on the emulator
- Launch the app

## Troubleshooting

### Metro Bundler Not Connecting

1. Clear cache and restart:
   ```bash
   npx react-native start --reset-cache
   ```

2. Check if Metro is running:
   ```bash
   curl http://localhost:8081/status
   ```

3. Kill existing Metro process:
   ```bash
   lsof -ti:8081 | xargs kill
   ```

### App Not Installing

1. Uninstall existing app:
   ```bash
   adb uninstall com.salahcompaniontemp
   ```

2. Clean build:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

3. Rebuild and install:
   ```bash
   npx react-native run-android
   ```

### Emulator Not Detected

1. List available emulators:
   ```bash
   emulator -list-avds
   ```

2. Start emulator:
   ```bash
   emulator -avd <avd_name>
   ```

3. Verify connection:
   ```bash
   adb devices
   ```

## Quick Commands Reference

```bash
# Check emulator status
adb devices

# Start Metro (with cache clear)
npx react-native start --reset-cache

# Install and run app
npx react-native run-android

# Uninstall app
adb uninstall com.salahcompaniontemp

# View logs
npx react-native log-android

# Kill Metro
lsof -ti:8081 | xargs kill
```

## Notes

- Metro bundler must be running before installing the app
- Keep Metro bundler terminal open while developing
- Use `--reset-cache` if you encounter caching issues
- App will hot-reload automatically when you make code changes

