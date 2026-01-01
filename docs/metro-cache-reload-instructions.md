# Metro Cache Reload Instructions

**Date**: December 18, 2025

---

## Issue

After fixing code, errors persist because Metro bundler is serving cached JavaScript bundles.

---

## Solution: Force Fresh Bundle

### Step 1: Stop Metro and Clear Cache

```bash
# Kill Metro processes
pkill -f "react-native start"
pkill -f "metro"

# Clear Metro cache
rm -rf /tmp/metro-*
rm -rf /tmp/haste-*
```

### Step 2: Restart Metro with Cache Reset

```bash
npx react-native start --reset-cache
```

### Step 3: Rebuild Android App

```bash
# Clean build
cd android && ./gradlew clean && cd ..

# Rebuild and install
npx react-native run-android
```

### Step 4: Reload App on Emulator

**Option A: Shake device/emulator**
- Shake device → Select "Reload"

**Option B: Via ADB**
```bash
adb shell input keyevent 82  # Open dev menu
# Then select "Reload" from menu
```

**Option C: Force restart app**
```bash
adb shell am force-stop com.salahcompaniontemp
adb shell am start -n com.salahcompaniontemp/.MainActivity
```

---

## Quick One-Liner

```bash
pkill -f metro && npx react-native start --reset-cache &
sleep 5 && cd android && ./gradlew clean && cd .. && npx react-native run-android
```

---

## Verification

After reload:
1. Check Metro terminal - should show "Bundling..." messages
2. App should load with latest code
3. Errors should be resolved

---

*Last Updated: December 18, 2025*
