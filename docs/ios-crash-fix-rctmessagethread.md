# iOS Crash Fix - RCTMessageThread Destructor (Updated)

**Date**: December 27, 2024  
**Issue**: App crashes during bridge error handling cleanup  
**Status**: 🔧 Fixed with enhanced lifecycle management

---

## 🔴 Problem Analysis

The app crashes with:

```
Exception Type: EXC_CRASH (SIGABRT)
Termination Reason: Namespace SIGNAL, Code 6, Abort trap: 6

Last Exception Backtrace:
facebook::react::RCTMessageThread::~RCTMessageThread() + 240 (RCTMessageThread.mm:34)
__28-[RCTCxxBridge handleError:]_block_invoke + 228 (RCTCxxBridge.mm:1175)
```

### Root Cause

1. **Bridge Deallocation During Error Handling**: When Metro bundler connection fails, React Native tries to handle the error
2. **Threading Issue**: The `RCTMessageThread` destructor is called while JavaScript thread is still active
3. **Premature Cleanup**: Bridge is being deallocated before error handling completes
4. **Memory Management**: Weak references or missing strong references cause premature release

---

## ✅ Solution Applied

### 1. Enhanced Bridge Lifecycle Management

**Key Changes**:
- Store `rootViewController` reference to keep bridge alive
- Add `applicationWillTerminate` to handle cleanup properly
- Prevent explicit bridge release (let it clean up naturally)

```swift
var rootViewController: UIViewController?  // ✅ Store reference

// In didFinishLaunchingWithOptions:
self.rootViewController = viewController  // ✅ Keep bridge alive
```

### 2. Prioritize Local Bundle Over Metro

**Why**: Prevents Metro connection errors that trigger the crash

**Priority Order**:
1. **Local bundle** (`main.jsbundle`) - Most reliable
2. Metro bundler (only if local bundle not found)
3. Manual localhost fallback (last resort)

```swift
// Priority 1: Local bundle (prevents Metro connection errors)
if let localBundle = Bundle.main.url(forResource: "main", withExtension: "jsbundle") {
  return localBundle
}
```

### 3. Enhanced Error Handling

**Added**:
- `bridge(_:didNotFindModule:)` delegate method
- Better logging for debugging
- Graceful fallback handling

```swift
func bridge(_ bridge: RCTBridge!, didNotFindModule moduleName: String!) -> Bool {
  print("⚠️  Bridge did not find module: \(moduleName ?? "unknown")")
  return false  // Let React Native handle the error
}
```

---

## 🔍 Why This Fixes the Crash

1. **Strong References**: Storing `rootViewController` keeps the bridge alive during error handling
2. **Local Bundle Priority**: Avoids Metro connection attempts that trigger error handling
3. **Natural Cleanup**: Prevents explicit deallocation that causes threading issues
4. **Error Delegation**: Lets React Native handle errors gracefully instead of crashing

---

## 🧪 Testing Steps

### 1. Clean Build
```bash
cd ios
xcodebuild clean -workspace SalahCompanion.xcworkspace -scheme SalahCompanion
cd ..
```

### 2. Ensure Bundle Exists
```bash
npm run bundle:ios
ls -lh ios/SalahCompanion/main.jsbundle
# Should show ~2.8 MB file
```

### 3. Rebuild App
```bash
npm run ios:launch
# Or manually:
npx react-native run-ios --simulator="iPhone 17"
```

### 4. Verify Launch
- App should launch without crash
- Check Xcode console for bundle URL logs
- App should use local bundle (not Metro)

---

## 📊 Expected Behavior

### ✅ Success Indicators
- App launches without crash
- Console shows: `✅ Using local bundle: file://...`
- No `RCTMessageThread` destructor errors
- App loads JavaScript successfully

### ⚠️ If Still Crashing

1. **Check Bundle Location**:
   ```bash
   ls -lh ios/build/Build/Products/Debug-iphonesimulator/SalahCompanion.app/main.jsbundle
   ```

2. **Verify Bundle in App**:
   ```bash
   # Bundle should be in app bundle
   cp ios/SalahCompanion/main.jsbundle ios/build/Build/Products/Debug-iphonesimulator/SalahCompanion.app/main.jsbundle
   ```

3. **Check Crash Logs**:
   ```bash
   xcrun simctl spawn <UDID> log show --predicate 'processImagePath contains "SalahCompanion"' --last 5m
   ```

4. **Rebuild from Scratch**:
   ```bash
   cd ios
   rm -rf build Pods Podfile.lock
   pod install
   cd ..
   npm run bundle:ios
   npm run ios:launch
   ```

---

## 🔧 Technical Details

### Bridge Lifecycle
```
App Launch
  ↓
Bridge Initialization (RCTBridge)
  ↓
RootView Creation (RCTRootView)
  ↓
JavaScript Thread Start (RCTMessageThread)
  ↓
Bundle Loading
  ↓
[If Error] Error Handling
  ↓
[If Bridge Released] CRASH ← We prevent this
  ↓
Natural Cleanup (Safe)
```

### Memory Management
- **Before**: Bridge could be deallocated during error handling
- **After**: Strong references keep bridge alive until natural cleanup

### Bundle Loading Strategy
- **Local Bundle**: File system access (fast, reliable)
- **Metro Bundler**: Network connection (can fail, triggers error handling)
- **Priority**: Local bundle first prevents connection errors

---

## 📝 Key Changes Summary

| Component | Change | Reason |
|-----------|--------|--------|
| `rootViewController` | Store reference | Keep bridge alive |
| Bundle Priority | Local first | Prevent Metro errors |
| Error Handling | Delegate method | Graceful error handling |
| Cleanup | Natural release | Prevent threading issues |

---

## ✅ Verification Checklist

- [ ] App launches without crash
- [ ] Console shows local bundle usage
- [ ] No `RCTMessageThread` errors
- [ ] JavaScript loads successfully
- [ ] App UI appears correctly
- [ ] No memory warnings

---

**Last Updated**: December 27, 2024  
**React Native Version**: 0.72.17  
**iOS Simulator**: iPhone 17 (iOS 26.2)

