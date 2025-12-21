# iOS Verification Commands

## Correct Directory for Xcode Commands

When running `xcodebuild` commands, you need to be in the `ios/` directory OR use the full path.

### ❌ Wrong (from project root):
```bash
cd /Users/vizion/Documents/SALAH
xcodebuild -list -project SalahCompanion.xcodeproj
# Error: 'SalahCompanion.xcodeproj' does not exist
```

### ✅ Correct Option 1 (change to ios directory):
```bash
cd /Users/vizion/Documents/SALAH/ios
xcodebuild -list -project SalahCompanion.xcodeproj
```

### ✅ Correct Option 2 (use full path from project root):
```bash
cd /Users/vizion/Documents/SALAH
xcodebuild -list -project ios/SalahCompanion.xcodeproj
```

### ✅ Correct Option 3 (use workspace from project root):
```bash
cd /Users/vizion/Documents/SALAH
xcodebuild -list -workspace ios/SalahCompanion.xcworkspace
```

## Common Verification Commands

### List Schemes:
```bash
cd ios
xcodebuild -list -project SalahCompanion.xcodeproj
```

### List Workspace Schemes:
```bash
cd ios
xcodebuild -list -workspace SalahCompanion.xcworkspace
```

### Check Build Configuration:
```bash
cd ios
xcodebuild -showBuildSettings -project SalahCompanion.xcodeproj -scheme SalahCompanion
```

## React Native CLI Commands

These work from the project root (they handle paths automatically):

```bash
# From project root
cd /Users/vizion/Documents/SALAH

# Run on iOS simulator
npx react-native run-ios

# Run on specific simulator
npx react-native run-ios --simulator="iPhone 17"

# Run with specific scheme
npx react-native run-ios --scheme SalahCompanion
```

## Quick Reference

| Command | Directory | Path |
|---------|-----------|------|
| `xcodebuild -list -project` | `ios/` | `SalahCompanion.xcodeproj` |
| `xcodebuild -list -workspace` | `ios/` | `SalahCompanion.xcworkspace` |
| `npx react-native run-ios` | Project root | Auto-detects |
| `pod install` | `ios/` | N/A |
