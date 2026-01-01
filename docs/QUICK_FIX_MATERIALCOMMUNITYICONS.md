# Quick Fix - MaterialCommunityIcons Error

## The Error
```
Requiring unknown module "undefined"
Cannot read property 'jsx' of undefined
```

## Quick Solution

**Option 1: Restart Metro with cache clear**
```bash
npm run dev -- --reset-cache
```

**Option 2: Just rebuild and run (easiest)**
```bash
npm run android
```
This will automatically start Metro and rebuild the app.

## What Was Fixed

✅ Global import of MaterialCommunityIcons in `index.js`
✅ IconWrapper component created
✅ PaperProvider configured with IconWrapper
✅ Metro config updated for module resolution

## After Restart

The app should:
- ✅ Load without crashes
- ✅ Show icons correctly
- ✅ Display Material Neubrutomorphism design
- ✅ No more "undefined module" errors

## If Error Persists

1. Check that `index.js` has the MaterialCommunityIcons import
2. Verify `src/App.tsx` uses IconWrapper in PaperProvider
3. Make sure fonts are in `android/app/src/main/assets/fonts/`
4. Try: `cd android && ./gradlew clean` then `npm run android`

