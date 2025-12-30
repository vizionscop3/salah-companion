# iOS Simulator Testing Guide

**Date**: December 22, 2024  
**Status**: 🟢 Ready for Use

---

## 🚀 Quick Start

### Automated Testing Script

Run the iOS device testing script:

```bash
./scripts/ios-device-test.sh
```

**What it does**:
- Checks Xcode installation
- Checks CocoaPods installation
- Installs/updates pods
- Lists available simulators
- Boots simulator
- Builds iOS app
- Runs app on simulator
- Checks Hermes configuration

---

## 📱 Manual Testing Steps

### Step 1: Start Metro Bundler

```bash
npm start
```

Or in a separate terminal:
```bash
npm start -- --reset-cache
```

### Step 2: Build and Run

**Option A: Using npm script**
```bash
npm run ios
```

**Option B: Using React Native CLI**
```bash
npx react-native run-ios
```

**Option C: Using Xcode**
1. Open `ios/SalahCompanion.xcworkspace` in Xcode
2. Select a simulator (e.g., iPhone 17 Pro)
3. Click Run (⌘R)

### Step 3: Select Simulator

To run on a specific simulator:
```bash
npx react-native run-ios --simulator="iPhone 17 Pro"
```

List available simulators:
```bash
xcrun simctl list devices available
```

---

## 🔍 Testing Checklist

### App Launch
- [ ] App launches without crashes
- [ ] Startup time < 3 seconds
- [ ] No error messages in console
- [ ] Hermes engine loads correctly

### Core Features
- [ ] Prayer times display correctly
- [ ] Location permission requested (if needed)
- [ ] Azan plays (if enabled)
- [ ] Qibla compass works
- [ ] Navigation between screens works

### Phase 2 Features
- [ ] Recitation practice screen loads
- [ ] Pronunciation academy screen loads
- [ ] Achievements screen displays
- [ ] Progress tracking works
- [ ] Audio playback works

### Performance
- [ ] App starts quickly (< 3s)
- [ ] Screen transitions are smooth
- [ ] No memory warnings
- [ ] FPS stays at 60
- [ ] No lag when scrolling

### Hermes Verification
- [ ] Check console for "Hermes" messages
- [ ] JavaScript executes correctly
- [ ] No Hermes-related errors
- [ ] Performance is good

---

## 🐛 Common Issues & Solutions

### Issue: Build Fails

**Solution**:
```bash
cd ios
pod install
cd ..
npm run ios
```

### Issue: Metro Bundler Not Starting

**Solution**:
```bash
# Kill existing Metro processes
killall node

# Clear cache and restart
npm start -- --reset-cache
```

### Issue: Simulator Not Booting

**Solution**:
```bash
# List simulators
xcrun simctl list devices

# Boot specific simulator
xcrun simctl boot <DEVICE_ID>

# Open Simulator app
open -a Simulator
```

### Issue: Hermes Not Working

**Solution**:
1. Check `ios/Podfile` - Hermes should be enabled
2. Run `cd ios && pod install`
3. Clean build: `cd ios && xcodebuild clean`
4. Rebuild: `npm run ios`

### Issue: App Crashes on Launch

**Solution**:
1. Check Xcode console for errors
2. Check Metro bundler logs
3. Verify all dependencies installed
4. Check Info.plist for required permissions

---

## 📊 Performance Monitoring

### Enable Performance Monitor

1. Shake simulator (⌘⌃Z) or press `⌘D`
2. Select "Show Perf Monitor"
3. Monitor:
   - FPS (should be 60)
   - Memory usage
   - UI thread time

### Check Logs

**Xcode Console**:
- View logs in Xcode console
- Filter by "SalahCompanion"

**Simulator Logs**:
```bash
xcrun simctl spawn booted log stream --predicate 'processImagePath contains "SalahCompanion"'
```

**Metro Bundler Logs**:
- Check terminal where Metro is running
- Look for errors or warnings

---

## 🔧 Hermes Verification

### Check Hermes is Enabled

1. **Check Podfile**:
   ```ruby
   # Should have hermes_enabled = true
   ```

2. **Check Build Settings**:
   - Open Xcode
   - Select project
   - Build Settings
   - Search for "Hermes"
   - Should be enabled

3. **Check Console**:
   - Look for "Hermes" in console logs
   - Should see Hermes initialization messages

### Verify Hermes Fix

The Hermes fix script (`ios/fix-hermes-after-build.sh`) should:
- Copy Hermes framework correctly
- Fix symlinks
- Ensure framework loads

**To verify**:
1. Build app
2. Check if Hermes framework exists in app bundle
3. Check console for Hermes messages
4. Verify JavaScript executes correctly

---

## 📝 Testing Report Template

```markdown
# iOS Simulator Testing Report

**Date**: __________  
**Simulator**: __________  
**iOS Version**: __________  
**Xcode Version**: __________

## Setup
- [ ] Xcode installed
- [ ] CocoaPods installed
- [ ] Pods installed
- [ ] Simulator booted
- [ ] App built successfully

## App Launch
- [ ] App launches
- [ ] Startup time: _____ seconds
- [ ] No crashes
- [ ] Hermes loads

## Core Features
- [ ] Prayer times
- [ ] Azan
- [ ] Navigation
- [ ] Qibla compass

## Phase 2 Features
- [ ] Recitation practice
- [ ] Pronunciation academy
- [ ] Achievements
- [ ] Audio playback

## Performance
- Startup Time: _____ seconds
- Memory Usage: _____ MB
- FPS: _____
- Issues: __________

## Hermes Verification
- [ ] Hermes enabled
- [ ] Hermes loads correctly
- [ ] No Hermes errors
- [ ] JavaScript works

## Issues Found
1. __________
2. __________
3. __________

## Overall Status
[ ] Pass [ ] Fail [ ] Needs Work
```

---

## 🎯 Success Criteria

iOS testing is successful when:
- [ ] App builds without errors
- [ ] App launches on simulator
- [ ] All core features work
- [ ] Hermes engine loads correctly
- [ ] Performance is acceptable
- [ ] No critical bugs found

---

## 🚀 Next Steps

After simulator testing:
1. Test on physical iOS device
2. Verify Hermes fix on device
3. Test all features
4. Document findings
5. Fix any issues found

---

**Last Updated**: December 22, 2024

