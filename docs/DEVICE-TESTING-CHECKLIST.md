# Device Testing Checklist

**Date**: December 22, 2024  
**Status**: 🟢 Ready for Testing

---

## 📱 Android Device Testing

### Pre-Testing Setup

- [ ] Android Studio installed
- [ ] Android SDK (API 29+) installed
- [ ] Device connected via USB or emulator running
- [ ] `adb devices` shows device
- [ ] App builds successfully: `npm run android`

---

### Android 10+ (API 29) Testing

**Device**: _________________  
**OS Version**: Android 10  
**Test Date**: ___________

#### Installation & Launch
- [ ] App installs successfully
- [ ] App launches without crashes
- [ ] Launch time < 2 seconds
- [ ] No "Library not loaded" errors

#### Core Features
- [ ] Prayer times calculate correctly
- [ ] Location permission requested and works
- [ ] Qibla compass shows correct direction
- [ ] Azan playback works
- [ ] Guided Salah works for all 5 prayers
- [ ] Progress tracking saves correctly

#### Phase 2 Features
- [ ] Recitation Practice - Word mode works
- [ ] Recitation Practice - Ayah mode works
- [ ] Recitation Practice - Surah mode works
- [ ] Pronunciation Academy displays letters
- [ ] Letter practice records and analyzes
- [ ] Achievements unlock correctly
- [ ] Audio downloads and plays

#### Navigation
- [ ] All screens navigate correctly
- [ ] Back button works
- [ ] Tab navigation works
- [ ] Deep linking works (if applicable)

#### Data Persistence
- [ ] User data persists after app restart
- [ ] Progress data persists
- [ ] Settings persist
- [ ] Practice sessions saved

#### Performance
- [ ] App responsive (no freezes)
- [ ] Memory usage acceptable
- [ ] Battery usage acceptable
- [ ] No memory leaks

#### Error Handling
- [ ] Network errors handled gracefully
- [ ] Permission denials handled
- [ ] API failures handled
- [ ] Error messages user-friendly

**Issues Found**: _________________________

---

### Android 11+ (API 30) Testing

**Device**: _________________  
**OS Version**: Android 11  
**Test Date**: ___________

#### All Android 10+ Tests
- [ ] All above tests pass

#### Android 11 Specific
- [ ] Scoped storage works correctly
- [ ] Background restrictions handled
- [ ] File access works correctly

**Issues Found**: _________________________

---

### Android 12+ (API 31) Testing

**Device**: _________________  
**OS Version**: Android 12  
**Test Date**: ___________

#### All Previous Tests
- [ ] All Android 10+ and 11+ tests pass

#### Android 12 Specific
- [ ] Material You theming works (if implemented)
- [ ] Privacy dashboard compliance
- [ ] Notification permissions work

**Issues Found**: _________________________

---

### Android 13+ (API 33) Testing

**Device**: _________________  
**OS Version**: Android 13  
**Test Date**: ___________

#### All Previous Tests
- [ ] All previous tests pass

#### Android 13 Specific
- [ ] Runtime permissions work correctly
- [ ] Notification permissions requested
- [ ] Media permissions work

**Issues Found**: _________________________

---

### Android Emulator Testing

#### Screen Sizes

**Small (4.7" - 320dp)**:
- [ ] All UI elements visible
- [ ] No text cutoff
- [ ] Navigation works
- [ ] Touch targets accessible

**Normal (5" - 360dp)**:
- [ ] All UI elements visible
- [ ] Layout looks good
- [ ] Navigation works

**Large (6" - 411dp)**:
- [ ] All UI elements visible
- [ ] Layout scales correctly
- [ ] Navigation works

**XL (7" - 480dp)**:
- [ ] All UI elements visible
- [ ] Tablet layout works (if applicable)
- [ ] Navigation works

#### Orientations

**Portrait**:
- [ ] All screens work in portrait
- [ ] Layout correct
- [ ] No UI glitches

**Landscape**:
- [ ] All screens work in landscape
- [ ] Layout adapts correctly
- [ ] No UI glitches

**Orientation Changes**:
- [ ] App handles rotation smoothly
- [ ] State preserved
- [ ] No crashes

---

## 🍎 iOS Device Testing

### Pre-Testing Setup

- [ ] Xcode installed
- [ ] CocoaPods installed
- [ ] iOS device connected or simulator running
- [ ] Hermes fix verified (see `docs/IOS_HERMES_FIX.md`)
- [ ] App builds successfully: `npm run ios`

---

### iOS 14+ Testing

**Device**: _________________  
**OS Version**: iOS 14  
**Test Date**: ___________

#### Installation & Launch
- [ ] App installs successfully
- [ ] App launches without crashes
- [ ] Launch time < 2 seconds
- [ ] **Hermes framework loads correctly** (no "Library not loaded" error)
- [ ] JavaScript executes correctly

#### Core Features
- [ ] Prayer times calculate correctly
- [ ] Location permission requested and works
- [ ] Qibla compass shows correct direction
- [ ] Azan playback works
- [ ] Guided Salah works for all 5 prayers
- [ ] Progress tracking saves correctly

#### Phase 2 Features
- [ ] Recitation Practice - Word mode works
- [ ] Recitation Practice - Ayah mode works
- [ ] Recitation Practice - Surah mode works
- [ ] Pronunciation Academy displays letters
- [ ] Letter practice records and analyzes
- [ ] Achievements unlock correctly
- [ ] Audio downloads and plays

#### Navigation
- [ ] All screens navigate correctly
- [ ] Back button/swipe works
- [ ] Tab navigation works
- [ ] Deep linking works (if applicable)

#### Data Persistence
- [ ] User data persists after app restart
- [ ] Progress data persists
- [ ] Settings persist
- [ ] Practice sessions saved

#### Performance
- [ ] App responsive (no freezes)
- [ ] Memory usage acceptable
- [ ] Battery usage acceptable
- [ ] No memory leaks

#### Error Handling
- [ ] Network errors handled gracefully
- [ ] Permission denials handled
- [ ] API failures handled
- [ ] Error messages user-friendly

**Issues Found**: _________________________

---

### iOS 15+ Testing

**Device**: _________________  
**OS Version**: iOS 15  
**Test Date**: ___________

#### All iOS 14+ Tests
- [ ] All above tests pass

#### iOS 15 Specific
- [ ] Focus modes handled correctly
- [ ] Notification grouping works

**Issues Found**: _________________________

---

### iOS 16+ Testing

**Device**: _________________  
**OS Version**: iOS 16  
**Test Date**: ___________

#### All Previous Tests
- [ ] All iOS 14+ and 15+ tests pass

#### iOS 16 Specific
- [ ] Lock Screen widgets work (if implemented)
- [ ] Dynamic Island support (if applicable)

**Issues Found**: _________________________

---

### iOS Simulator Testing

#### Device Types

**iPhone SE (2nd gen)**:
- [ ] All features work
- [ ] Layout scales correctly

**iPhone 12/13/14**:
- [ ] All features work
- [ ] Layout looks good

**iPhone 14 Pro Max**:
- [ ] All features work
- [ ] Large screen layout works

**iPad** (if supported):
- [ ] All features work
- [ ] Tablet layout works

---

## 🔍 Hermes Framework Verification (iOS)

### Build Verification

- [ ] Run: `cd ios && pod install`
- [ ] Run: `xcodebuild clean -workspace SalahCompanion.xcworkspace -scheme SalahCompanion`
- [ ] Run: `npm run ios`
- [ ] App builds without errors

### Runtime Verification

- [ ] App launches without "Library not loaded: @rpath/hermes.framework/hermes" error
- [ ] Hermes framework exists in app bundle
- [ ] JavaScript executes correctly
- [ ] No crashes on startup
- [ ] All features work

### Framework Location Check

```bash
# Verify framework exists
ls -la Pods/hermes-engine/destroot/Library/Frameworks/universal/hermes.xcframework/

# Check app bundle (after build)
# Framework should be in: Build/Products/Debug-iphonesimulator/SalahCompanion.app/Frameworks/
```

**Status**: [ ] Pass [ ] Fail  
**Notes**: _________________________

---

## 📊 Performance Testing

### Metrics to Measure

#### App Launch
- [ ] Time to first screen: < 2 seconds
- [ ] Time to interactive: < 3 seconds
- [ ] Memory usage: < 150MB

#### Screen Transitions
- [ ] Navigation time: < 300ms
- [ ] Screen render time: < 500ms

#### Audio Operations
- [ ] Audio load time: < 1 second
- [ ] Audio playback latency: < 200ms
- [ ] Recording start time: < 500ms

#### API Calls
- [ ] Prayer time calculation: < 100ms
- [ ] Quran text fetch: < 2 seconds
- [ ] Audio download: < 5 seconds

#### Database Operations
- [ ] Query time: < 50ms
- [ ] Write time: < 100ms

**Performance Issues Found**: _________________________

---

## 🐛 Bug Tracking

### Critical Bugs (Fix Immediately)
- [ ] Bug 1: _________________________
- [ ] Bug 2: _________________________

### High Priority Bugs
- [ ] Bug 1: _________________________
- [ ] Bug 2: _________________________

### Medium Priority Bugs
- [ ] Bug 1: _________________________
- [ ] Bug 2: _________________________

### Low Priority Bugs
- [ ] Bug 1: _________________________
- [ ] Bug 2: _________________________

---

## ✅ Testing Completion

### Android Testing
- [ ] All Android versions tested
- [ ] All screen sizes tested
- [ ] All orientations tested
- [ ] All bugs documented

### iOS Testing
- [ ] All iOS versions tested
- [ ] Hermes fix verified
- [ ] All device types tested
- [ ] All bugs documented

### Performance Testing
- [ ] All metrics measured
- [ ] Performance acceptable
- [ ] Optimizations identified

### Bug Fixes
- [ ] All critical bugs fixed
- [ ] All high priority bugs fixed
- [ ] Medium/low priority bugs documented

---

## 📝 Notes

**General Notes**: _________________________

**Device-Specific Notes**: _________________________

**Performance Notes**: _________________________

**Recommendations**: _________________________

---

**Testing Completed By**: _________________  
**Date**: _________________  
**Status**: [ ] Complete [ ] In Progress

*Last Updated: December 22, 2024*

