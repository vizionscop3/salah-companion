# Troubleshooting Blank Screen - Step by Step

**Date**: December 18, 2025

---

## Current Status

- ✅ Build successful
- ✅ Metro bundler running (port 8081)
- ✅ Babel module-resolver configured
- ⚠️ App shows blank screen

---

## Diagnostic Steps

### Step 1: Verify Metro Connection

**Check Metro is running**:
```bash
curl http://localhost:8081/status
# Should return: packager-status:running
```

**Check Metro can serve bundle**:
```bash
curl http://localhost:8081/index.bundle?platform=android
# Should return JavaScript bundle (large output)
```

---

### Step 2: Reload App with Fresh Logs

1. **Clear logcat**:
   ```bash
   adb logcat -c
   ```

2. **Start monitoring logs**:
   ```bash
   npx react-native log-android
   # OR
   adb logcat | grep -E "ReactNative|JS|Error|Exception"
   ```

3. **Reload the app**:
   - Shake device → "Reload"
   - OR: Press `r` in Metro terminal
   - OR: `adb shell input keyevent 82` then select "Reload"

4. **Watch for errors** in the logcat output

---

### Step 3: Check Common Issues

#### A. Module Resolution Errors
**Symptom**: `Unable to resolve module @context/AuthContext`

**Fix**: Already done - Babel module-resolver configured ✅

**Verify**: Check Metro terminal for any "Unable to resolve" errors

---

#### B. Initialization Errors
**Symptom**: Error in `initializeNotifications()` or context providers

**Check**: Look for errors in:
- `AuthContext.tsx` - `loadUser()` function
- `notificationService.ts` - `initializeNotifications()` function
- Any service that runs on app startup

**Fix**: Add try-catch blocks or make initialization non-blocking

---

#### C. Navigation Errors
**Symptom**: Navigation container fails to initialize

**Check**: `AppNavigator.tsx` - verify all screen imports resolve correctly

---

#### D. Metro Cache Issues
**Symptom**: Old bundle cached, new changes not reflected

**Fix**:
```bash
# Stop Metro
# Then restart with cache clear
npx react-native start --reset-cache
```

---

### Step 4: Enable Remote Debugging (Optional)

If app still blank, enable remote debugging:

1. Shake device → "Debug"
2. Open Chrome DevTools: `chrome://inspect`
3. Check Console for JavaScript errors

---

## Quick Fixes to Try

### Fix 1: Restart Everything
```bash
# 1. Stop Metro (Ctrl+C)
# 2. Clear Metro cache
rm -rf /tmp/metro-* /tmp/haste-*

# 3. Restart Metro
npx react-native start --reset-cache

# 4. In another terminal, rebuild app
npm run android
```

---

### Fix 2: Check for Import Errors

Look for any imports that might fail:
- Missing files
- Circular dependencies
- Incorrect path aliases

**Verify all imports in**:
- `src/App.tsx`
- `src/screens/navigation/AppNavigator.tsx`
- `src/context/AuthContext.tsx`
- `src/context/ThemeContext.tsx`

---

### Fix 3: Add Error Boundary

Add error boundary to catch and display errors:

```tsx
// src/components/ErrorBoundary.tsx
import React from 'react';
import {View, Text} from 'react-native';

class ErrorBoundary extends React.Component {
  state = {hasError: false, error: null};

  static getDerivedStateFromError(error) {
    return {hasError: true, error};
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{flex: 1, justifyContent: 'center', padding: 20}}>
          <Text style={{fontSize: 18, fontWeight: 'bold'}}>Error:</Text>
          <Text>{this.state.error?.toString()}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}
```

Wrap App with ErrorBoundary in `index.js` or `App.tsx`.

---

## Next Steps

1. **Clear logcat and reload app** (see Step 2)
2. **Share the error logs** you see
3. **Check Metro terminal** for bundle errors
4. **Verify all files exist** that are imported

---

*Last Updated: December 18, 2025*
