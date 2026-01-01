# Metro Restart Fix - MaterialCommunityIcons Error

## Current Error

```
Error: Requiring unknown module "undefined"
TypeError: Cannot read property 'jsx' of undefined
```

**Location**: `DefaultIcon` in `react-native-paper` (used by `Chip`, `Icon`, etc.)

## Root Cause

Even though:
- ✅ `MaterialCommunityIcons` is imported globally in `index.js`
- ✅ `PaperProvider` is configured with icon settings
- ✅ Build completed successfully

**Metro bundler** still has the old bundle cached and hasn't picked up the fix.

## Solution

### Step 1: Stop Current Metro Bundler

Press `Ctrl+C` in the Metro terminal to stop it.

### Step 2: Clear Metro Cache and Restart

```bash
# Clear cache and restart Metro
npm start -- --reset-cache
```

### Step 3: Reload App on Android

Once Metro shows "Metro waiting on...", reload the app:

**Option A**: Press `r` in Metro terminal
**Option B**: Shake device → Reload
**Option C**: Run `npm run android` again

## Verification

After restart, you should see:
- ✅ App loads without crashes
- ✅ Icons render correctly
- ✅ No "undefined module" errors
- ✅ Material Neubrutomorphism design visible

## Expected Behavior After Fix

1. **Home Screen**: 
   - Dark theme background
   - Turquoise accents
   - Icons display correctly

2. **Prayer Times Screen**:
   - Hero section with gradient
   - Prayer tabs work
   - Icons in prayer list display

3. **Navigation**:
   - Bottom tabs with icons
   - Smooth transitions

## Other Errors (Non-Critical)

These are expected and don't block the app:

- ⚠️ **Location permission denied** - User needs to grant permission (expected)
- ⚠️ **Audio/TTS errors** - Features need audio files (expected)
- ⚠️ **404 errors for audio** - API endpoints need configuration (expected)

## If Error Persists

If after restarting Metro the error still occurs:

1. **Check Metro logs** for any bundling errors
2. **Verify** `index.js` has the import:
   ```javascript
   import 'react-native-vector-icons/MaterialCommunityIcons';
   ```
3. **Verify** `App.tsx` has PaperProvider settings:
   ```typescript
   settings={{
     icon: (props) => <MaterialCommunityIcons {...props} />,
   }}
   ```
4. **Clean build**:
   ```bash
   cd android && ./gradlew clean && cd ..
   npm run android
   ```

## Status

✅ **Fix Applied**: Global import in `index.js`
⏳ **Action Required**: Restart Metro with `--reset-cache`

