# iOS Scheme Fix - SalahCompanion

## Issue
React Native CLI was looking for scheme "SalahCompanion" but only "SalahCompanionTemp" existed.

## Solution
Created a new scheme file `SalahCompanion.xcscheme` based on `SalahCompanionTemp.xcscheme` and updated all references to use "SalahCompanion" instead of "SalahCompanionTemp".

## Files Modified
- `ios/SalahCompanion.xcodeproj/xcshareddata/xcschemes/SalahCompanion.xcscheme` (created)

## Verification
```bash
xcodebuild -list -project SalahCompanion.xcodeproj
# Should show both schemes:
#   Schemes:
#       SalahCompanion
#       SalahCompanionTemp
```

## Usage
Now you can run:
```bash
npx react-native run-ios
# or
npx react-native run-ios --scheme SalahCompanion
```

The scheme now correctly points to the "SalahCompanion" target.
