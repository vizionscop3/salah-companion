# iOS Metro Bundler Connection Fix

**Date**: December 26, 2024  
**Issue**: "No bundle URL present" error after app launch

---

## 🔴 Problem

After fixing the Hermes framework issue, the app launches but shows:

```
No bundle URL present.
Make sure you're running a packager server or have included a .jsbundle file in your application bundle.
```

**Root Cause**: Metro bundler (React Native's JavaScript bundler) is not running or the app cannot connect to it.

---

## ✅ Solution

### Quick Fix

1. **Start Metro Bundler**:
   ```bash
   npm start
   ```
   
   Or with cache reset:
   ```bash
   npm start -- --reset-cache
   ```

2. **Reload App in Simulator**:
   - Press `⌘R` in the simulator
   - Or shake device → "Reload"
   - Or press `⌘D` → "Reload"

### Alternative: Run App with Metro

```bash
npm run ios
```

This command will:
- Start Metro bundler automatically
- Build and install the app
- Launch the app on simulator
- Connect app to Metro bundler

---

## 🔍 Verification

### Check Metro Bundler Status

```bash
# Check if Metro is running
curl http://localhost:8081/status

# Should return: {"status":"running"}
```

### Check Metro Logs

```bash
# View Metro bundler output
tail -f /tmp/metro.log
```

### Check App Connection

1. Open app in simulator
2. Shake device (⌘⌃Z) or press `⌘D`
3. Select "Debug" or "Open Dev Menu"
4. Should see Metro bundler connection status

---

## 🐛 Troubleshooting

### Issue: Metro bundler won't start

**Solution**:
```bash
# Kill existing Metro processes
killall node

# Clear Metro cache
rm -rf /tmp/metro-*
rm -rf /tmp/haste-*

# Start fresh
npm start -- --reset-cache
```

### Issue: App can't connect to Metro

**Solution**:
1. Check Metro is running: `curl http://localhost:8081/status`
2. Check firewall isn't blocking port 8081
3. Try reloading app: `⌘R` in simulator
4. Check app logs for connection errors

### Issue: "Unable to resolve module" errors

**Solution**:
```bash
# Clear all caches
npm start -- --reset-cache

# Reinstall node modules if needed
rm -rf node_modules
npm install
```

### Issue: Metro bundler crashes

**Solution**:
1. Check Node.js version: `node --version` (should be 16+)
2. Check available memory
3. Restart Metro with more memory:
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm start
   ```

---

## 📋 Development Workflow

### Recommended Setup

1. **Terminal 1 - Metro Bundler**:
   ```bash
   npm start
   ```

2. **Terminal 2 - Build/Run**:
   ```bash
   npm run ios
   ```

3. **In Simulator**:
   - Press `⌘R` to reload
   - Press `⌘D` for dev menu
   - Press `⌘⌃Z` to shake device

### Quick Reload

- **⌘R**: Reload JavaScript bundle
- **⌘D**: Open developer menu
- **⌘⌃Z**: Shake device (same as ⌘D)

---

## 🎯 Expected Behavior

After starting Metro bundler:
- ✅ Metro bundler shows "Metro waiting on port 8081"
- ✅ App connects to Metro bundler
- ✅ JavaScript bundle loads
- ✅ App displays correctly
- ✅ Hot reload works (⌘R)

---

## 📝 Notes

- Metro bundler must be running for development builds
- Production builds include bundled JavaScript (no Metro needed)
- Metro bundler runs on port 8081 by default
- App connects to Metro via localhost in simulator
- For physical devices, need to configure IP address

---

**Last Updated**: December 26, 2024

