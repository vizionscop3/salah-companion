# Android Error Fix - MaterialCommunityIcons

## Issue

**Error**: 
```
Error: Requiring unknown module "undefined"
TypeError: Cannot read property 'jsx' of undefined
```

**Location**: `DefaultIcon` component in `react-native-paper`

**Root Cause**: 
- `react-native-paper` uses dynamic `require()` to load `MaterialCommunityIcons`
- Metro bundler can't resolve the dynamic require at runtime
- Module isn't loaded before Paper tries to use it
- Result: `undefined` module → crash

## Solution

### Import MaterialCommunityIcons Globally

**File**: `index.js`

Added global import:
```javascript
// Ensure MaterialCommunityIcons is available globally before app loads
// This fixes the "Requiring unknown module 'undefined'" error in react-native-paper
import 'react-native-vector-icons/MaterialCommunityIcons';
```

## Why This Works

1. **`react-native-paper`** uses dynamic `require()` to load icons:
   ```typescript
   return require('react-native-vector-icons/MaterialCommunityIcons')
   ```

2. **Metro bundler** sometimes can't resolve dynamic requires at runtime
3. **By importing globally** in `index.js`, we ensure the module is:
   - Bundled by Metro
   - Available when Paper tries to require it
   - Loaded before any components render

4. **Result**: Module resolves correctly → icons work → app loads

## Next Steps

1. **Restart Metro** with cache reset:
   ```bash
   npm start -- --reset-cache
   ```

2. **Reload app** on Android emulator:
   - Press `r` in Metro terminal, or
   - Shake device → Reload, or
   - Run `npm run android` again

3. **Verify fix**:
   - App should load without crashes
   - Icons should render correctly
   - No more "undefined module" errors

## Other Errors (Non-Critical)

These are expected and don't block the app:

- ✅ **Location permission denied** - Expected, user needs to grant permission
- ✅ **Audio/TTS errors** - Expected, those features need audio files
- ✅ **404 errors for audio** - Expected, API endpoints need configuration

## Status

✅ **Fixed**: MaterialCommunityIcons global import added
⏳ **Next**: Restart Metro and reload app

