# Blank Screen Fix - Babel Module Resolver

**Date**: December 18, 2025  
**Status**: ✅ **FIXED**

---

## Issue

**Symptom**: App builds successfully but shows blank screen on Android emulator

**Root Cause**: 
- App uses TypeScript path aliases (`@context`, `@screens`, `@services`, etc.)
- TypeScript compiler understands these paths
- **Babel (used by Metro bundler) did NOT have module-resolver configured**
- Result: Imports fail at runtime → blank screen

---

## Solution

### 1. Installed Babel Plugin
```bash
npm install --save-dev babel-plugin-module-resolver
```

### 2. Updated `babel.config.js`

**Before**:
```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin', // Must be last
  ],
};
```

**After**:
```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@services': './src/services',
          '@utils': './src/utils',
          '@types': './src/types',
          '@hooks': './src/hooks',
          '@context': './src/context',
          '@constants': './src/constants',
        },
      },
    ],
    'react-native-reanimated/plugin', // Must be last
  ],
};
```

### 3. Restarted Metro with Cache Reset
```bash
npx react-native start --reset-cache
```

---

## Next Steps

1. **Reload the app**:
   - Shake device/emulator → "Reload"
   - OR: Press `r` in Metro terminal
   - OR: Run `adb shell input keyevent 82` then select "Reload"

2. **Verify**:
   - App should now render properly
   - Should see Login/Register screen or Home screen

---

## Why This Happened

React Native uses **Babel** (via Metro) to transform JavaScript/TypeScript code. While TypeScript's `tsconfig.json` defines path aliases for the IDE and type checking, **Babel needs its own configuration** to resolve these paths at runtime.

Without `babel-plugin-module-resolver`, imports like:
```typescript
import {AuthProvider} from '@context/AuthContext';
```

Fail because Babel doesn't know `@context` maps to `./src/context`.

---

## Verification

After reload, the app should:
- ✅ Display Login/Register screen (if not authenticated)
- ✅ Display Home screen (if authenticated)
- ✅ No blank screen
- ✅ No import errors in console

---

*Last Updated: December 18, 2025*
