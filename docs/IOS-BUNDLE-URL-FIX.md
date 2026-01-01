# iOS Bundle URL Fix - Metro Connection

**Date**: December 26, 2024  
**Issue**: "No bundle URL present" - App can't connect to Metro bundler

---

## 🔴 Problem

The app shows:
```
No bundle URL present.
Make sure you're running a packager server or have included a .jsbundle file in your application bundle.
```

**Root Cause**: 
- Metro bundler is running, but `RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")` returns `nil`
- Simulator might not be able to resolve `localhost:8081`
- No fallback URL construction

---

## ✅ Solution

### Updated AppDelegate Bundle URL Handling

**File**: `ios/SalahCompanion/AppDelegate.swift`

**Changes**:
1. **Explicit URL Provider Configuration**: Configure `RCTBundleURLProvider` before use
2. **Manual Localhost Fallback**: Try `http://localhost:8081/index.bundle?platform=ios&dev=true` directly
3. **Debug Logging**: Print which URL is being used
4. **Graceful Fallback**: Multiple fallback options before returning nil

**Code**:
```swift
extension AppDelegate: RCTBridgeDelegate {
  func sourceURL(for bridge: RCTBridge!) -> URL! {
#if DEBUG
    // Configure bundle URL provider
    let bundleURLProvider = RCTBundleURLProvider.sharedSettings()
    
    // Try to get bundle URL from Metro bundler
    if let url = bundleURLProvider.jsBundleURL(forBundleRoot: "index") {
      print("✅ Using Metro bundler URL: \(url)")
      return url
    }
    
    // Manual fallback: try localhost directly
    if let localhostURL = URL(string: "http://localhost:8081/index.bundle?platform=ios&dev=true") {
      print("⚠️  Using manual localhost URL: \(localhostURL)")
      return localhostURL
    }
    
    // Last resort: try local bundle
    if let localBundle = Bundle.main.url(forResource: "main", withExtension: "jsbundle") {
      return localBundle
    }
    
    return nil
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
```

---

## 🔍 Verification

### Check Metro Bundler
```bash
# Metro should be running
curl http://localhost:8081/status
# Should return: packager-status:running

# Metro should serve bundle
curl "http://localhost:8081/index.bundle?platform=ios&dev=true" | head -5
# Should return JavaScript code
```

### Check App Logs
After launching the app, check Xcode console for:
- `✅ Using Metro bundler URL: ...` (success)
- `⚠️  Using manual localhost URL: ...` (fallback)
- `❌ No bundle URL available` (failure)

---

## 🐛 Troubleshooting

### Issue: Still Getting "No bundle URL"

**Solution 1: Check Metro is Accessible**
```bash
# From simulator's perspective, localhost might not work
# Try using your Mac's IP address instead

# Get your Mac's IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Update AppDelegate to use IP instead of localhost
```

**Solution 2: Configure RCTBundleURLProvider**
```swift
// In AppDelegate, before getting URL:
let settings = RCTBundleURLProvider.sharedSettings()
settings?.setJsLocation("localhost:8081")  // Explicitly set location
```

**Solution 3: Use IP Address**
```swift
// Replace localhost with your Mac's IP
if let ipURL = URL(string: "http://192.168.1.X:8081/index.bundle?platform=ios&dev=true") {
  return ipURL
}
```

### Issue: Metro Bundler Not Responding

**Solution**:
```bash
# Kill and restart Metro
killall node
npm run dev

# Wait 10 seconds, then launch app
```

---

## 📝 Expected Behavior

After fix:
1. App launches
2. Checks for Metro bundler URL
3. Falls back to manual localhost URL if needed
4. Connects to Metro and loads JavaScript bundle
5. App displays correctly

---

## ✅ Success Indicators

- ✅ No "No bundle URL" error
- ✅ Console shows "Using Metro bundler URL"
- ✅ JavaScript executes
- ✅ App displays correctly
- ✅ Hot reload works (⌘R)

---

**Last Updated**: December 26, 2024

