# iOS Quick Fix - Hermes Framework Error

## The Error
```
Library not loaded: @rpath/hermes.framework/hermes
SalahCompanion cannot be opened because of a problem
```

## Quick Fix Steps

### Step 1: Reinstall Pods
```bash
cd ios
pod deintegrate
pod install
```

### Step 2: Clean Build
```bash
cd ios
rm -rf ~/Library/Developer/Xcode/DerivedData/SalahCompanion-*
```

### Step 3: Rebuild
```bash
cd ..
npm run ios
```

## What This Does

1. **pod deintegrate**: Removes all CocoaPods integration
2. **pod install**: Reinstalls all pods, including Hermes, with proper linking
3. **Clean DerivedData**: Removes old build artifacts
4. **Rebuild**: Creates fresh build with properly embedded Hermes framework

## Expected Result

After these steps:
- ✅ App launches successfully
- ✅ No "Library not loaded" errors
- ✅ Hermes framework properly embedded

## If Still Fails

Try opening in Xcode and building manually:
```bash
cd ios
open SalahCompanion.xcworkspace
```

Then in Xcode:
1. Product → Clean Build Folder (Shift+Cmd+K)
2. Product → Build (Cmd+B)
3. Check build log for any Hermes-related errors

## Files Updated

- ✅ `ios/fix-hermes-after-build.sh` - Improved to use Xcode build variables
- ✅ Post-build script runs after framework embedding

