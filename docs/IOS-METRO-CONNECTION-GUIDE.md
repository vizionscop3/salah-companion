# iOS Metro Bundler Connection Guide

**Date**: December 26, 2024

---

## ✅ Metro Bundler is Running

Metro bundler is confirmed running on port 8081 and can serve the JavaScript bundle.

---

## 🔄 Reload the App

The app needs to be reloaded to connect to Metro bundler. Try these methods:

### Method 1: Keyboard Shortcut (Easiest)
1. **Click on the simulator window** to focus it
2. Press **`⌘R`** (Command + R)
3. App should reload and connect to Metro

### Method 2: Developer Menu
1. Press **`⌘D`** (Command + D) or **`⌘⌃Z`** (Command + Control + Z)
2. Select **"Reload"** from the menu

### Method 3: Terminate and Relaunch
```bash
# Terminate app
xcrun simctl terminate booted org.reactjs.native.example.SalahCompanion

# Relaunch
xcrun simctl launch booted org.reactjs.native.example.SalahCompanion
```

### Method 4: Rebuild and Run
```bash
npm run ios
```
This will:
- Start Metro bundler (if not running)
- Build the app
- Install on simulator
- Launch and connect to Metro

---

## 🔍 Verification

After reloading, you should see:
- ✅ App loads without "No bundle URL" error
- ✅ JavaScript executes
- ✅ App displays correctly
- ✅ Metro bundler shows bundle requests in logs

Check Metro logs:
```bash
tail -f /tmp/metro-full.log
```

You should see requests like:
```
 BUNDLE  ./index.js
```

---

## 🐛 If Still Not Working

### Check Metro is Accessible
```bash
curl http://localhost:8081/status
# Should return: packager-status:running
```

### Check Bundle URL
```bash
curl "http://localhost:8081/index.bundle?platform=ios&dev=true" | head -10
# Should return JavaScript code
```

### Restart Everything
```bash
# Kill Metro
killall node

# Kill app
xcrun simctl terminate booted org.reactjs.native.example.SalahCompanion

# Restart Metro
npm run dev

# Wait 10 seconds, then relaunch app
sleep 10
xcrun simctl launch booted org.reactjs.native.example.SalahCompanion
```

### Check AppDelegate Configuration
The AppDelegate should use:
```swift
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
```

This automatically connects to Metro in DEBUG mode.

---

## 📝 Quick Reference

| Action | Shortcut | Description |
|--------|----------|-------------|
| Reload | `⌘R` | Reload JavaScript bundle |
| Dev Menu | `⌘D` or `⌘⌃Z` | Open developer menu |
| Shake | `⌘⌃Z` | Simulate device shake |

---

## ✅ Success Indicators

When everything is working:
- ✅ Metro bundler running on port 8081
- ✅ App loads without errors
- ✅ JavaScript executes
- ✅ Hot reload works (⌘R)
- ✅ Dev menu accessible (⌘D)

---

**Last Updated**: December 26, 2024

