# Device Testing Automation Guide

**Date**: December 22, 2024  
**Status**: 🟢 Ready for Use

---

## 🚀 Quick Start

### Automated Device Testing Script

Run the device testing script to check device setup and run basic tests:

```bash
# Make executable (first time only)
chmod +x scripts/device-test.sh

# Run device tests
./scripts/device-test.sh
```

**What it does**:
- Checks if adb is available
- Verifies device connection
- Gets device information
- Checks app installation
- Runs basic functionality tests
- Checks memory usage
- Shows recent logs

---

## 📱 Device Testing Workflow

### Step 1: Setup

1. **Connect Device or Start Emulator**:
   ```bash
   # Check connected devices
   adb devices
   
   # Start emulator (if needed)
   emulator -avd <emulator_name> &
   ```

2. **Build and Install App**:
   ```bash
   # Android
   npm run android
   
   # iOS (if available)
   npm run ios
   ```

3. **Run Device Test Script**:
   ```bash
   ./scripts/device-test.sh
   ```

### Step 2: Manual Testing

Use the comprehensive checklist in `docs/DEVICE-TESTING-CHECKLIST.md`:

1. **Core Features**:
   - Prayer times
   - Azan playback
   - Guided Salah
   - Qibla compass

2. **Phase 2 Features**:
   - Recitation practice
   - Pronunciation academy
   - Achievements
   - Audio integration

3. **Navigation**:
   - All screens
   - Back button
   - Tab navigation

4. **Data Persistence**:
   - Progress tracking
   - Settings
   - Practice sessions

### Step 3: Performance Testing

1. **Run Performance Script**:
   ```bash
   ./scripts/performance-test.sh
   ```

2. **Enable Performance Monitor**:
   - Shake device → "Show Perf Monitor"
   - Monitor FPS, memory, CPU

3. **Profile with DevTools**:
   - Use React DevTools Profiler
   - Record profiles during testing

### Step 4: Document Findings

1. **Use Bug Tracking**:
   - Document bugs in `docs/BUG-TRACKING.md`
   - Include device info, steps, screenshots

2. **Update Test Results**:
   - Mark completed items in checklist
   - Note any issues found

---

## 🔧 Advanced Testing

### Logcat Monitoring

Monitor app logs in real-time:

```bash
# All logs
adb logcat

# Filter by tag
adb logcat -s ReactNativeJS:V

# Save to file
adb logcat > app-logs.txt

# Clear logs
adb logcat -c
```

### Memory Profiling

Monitor memory usage:

```bash
# Get memory info
adb shell dumpsys meminfo com.salahcompanion

# Monitor continuously
watch -n 1 "adb shell dumpsys meminfo com.salahcompanion | grep TOTAL"
```

### CPU Profiling

Monitor CPU usage:

```bash
# Get CPU usage
adb shell top -n 1 | grep com.salahcompanion

# Monitor continuously
watch -n 1 "adb shell top -n 1 | grep com.salahcompanion"
```

### Network Monitoring

Monitor network requests:

```bash
# Use Flipper Network Inspector
# Or use tcpdump
adb shell tcpdump -i any -p -s 0 -w /sdcard/capture.pcap
```

---

## 📋 Testing Scenarios

### Scenario 1: New User Flow

1. Install app
2. Complete onboarding
3. Register account
4. Set location
5. Test prayer times
6. Test guided salah
7. Test recitation practice
8. Test pronunciation academy

**Expected**: All features work, no crashes

### Scenario 2: Returning User Flow

1. Open app (already logged in)
2. Check prayer times
3. Test guided salah
4. Test recitation practice
5. Check progress
6. Check achievements

**Expected**: Data persists, features work

### Scenario 3: Offline Mode

1. Enable airplane mode
2. Test prayer times (should work)
3. Test guided salah (should work)
4. Test cached audio (should work)
5. Test recitation practice (should work)

**Expected**: Core features work offline

### Scenario 4: Performance Test

1. Measure startup time
2. Navigate through all screens
3. Test audio playback
4. Monitor memory usage
5. Check CPU usage
6. Monitor FPS

**Expected**: All metrics within targets

---

## 🐛 Common Issues & Solutions

### Issue: App Won't Install

**Solution**:
```bash
# Uninstall existing app
adb uninstall com.salahcompanion

# Clean build
cd android && ./gradlew clean && cd ..

# Rebuild and install
npm run android
```

### Issue: App Crashes on Launch

**Solution**:
1. Check logcat for errors
2. Verify all dependencies installed
3. Check for missing permissions
4. Verify database setup

### Issue: Performance Issues

**Solution**:
1. Enable performance monitor
2. Profile with DevTools
3. Check for memory leaks
4. Optimize slow operations

### Issue: Audio Not Playing

**Solution**:
1. Check device volume
2. Verify audio files exist
3. Check permissions
4. Test with different audio sources

---

## 📊 Test Results Template

```markdown
# Device Testing Results

**Date**: __________  
**Device**: __________  
**OS Version**: __________  
**Tester**: __________

## Setup
- [ ] Device connected
- [ ] App installed
- [ ] All permissions granted

## Core Features
- [ ] Prayer times work
- [ ] Azan plays
- [ ] Guided salah works
- [ ] Qibla compass works

## Phase 2 Features
- [ ] Recitation practice works
- [ ] Pronunciation academy works
- [ ] Achievements unlock
- [ ] Audio downloads

## Performance
- Startup Time: _____ ms
- Memory Usage: _____ MB
- CPU Usage: _____ %
- FPS: _____

## Issues Found
1. __________
2. __________
3. __________

## Overall Status
[ ] Pass [ ] Fail [ ] Needs Work
```

---

## 🎯 Success Criteria

Device testing is complete when:
- [ ] All features tested on Android 10+
- [ ] All features tested on iOS 14+ (if available)
- [ ] Performance metrics within targets
- [ ] No critical bugs found
- [ ] All issues documented
- [ ] Test results recorded

---

**Last Updated**: December 22, 2024

