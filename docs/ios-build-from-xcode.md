# Building iOS App from Xcode

## Current Setup
- ✅ Xcode is open with SalahCompanion project
- ✅ Target: "Any iOS Simulator Device (arm64, x86_64)"
- ✅ Scheme: SalahCompanion
- ✅ Metro bundler: Starting

## Build Steps in Xcode

### Option 1: Build and Run from Xcode (Recommended)

1. **Select a Simulator**:
   - Click the device dropdown (next to scheme selector)
   - Choose any iPhone simulator (e.g., iPhone 17, iPhone 15)

2. **Build and Run**:
   - Press `Cmd + R` or click the Play button (▶️)
   - Xcode will build and launch the app

3. **Monitor Build**:
   - Watch the build progress in Xcode's status bar
   - Check for any errors in the Issue Navigator (⌘ + 5)

### Option 2: Build from Command Line

```bash
# From project root
npx react-native run-ios
```

This will automatically:
- Build the app
- Launch a simulator
- Install the app
- Start Metro bundler (if not running)

## Troubleshooting

### If Build Fails

1. **Clean Build Folder**:
   - In Xcode: `Product → Clean Build Folder` (Shift + Cmd + K)

2. **Check Warnings**:
   - The screenshot shows 2 warnings about "Update to recommended settings"
   - These are usually safe to ignore, but you can click to update if needed

3. **Verify Metro is Running**:
   - Metro should be running on port 8081
   - If not: `npm run dev` in a separate terminal

### Common Issues

- **Sandbox Errors**: Clear DerivedData (already done)
- **Permission Errors**: Usually resolved by clean build
- **Missing Dependencies**: Run `pod install` in `ios/` directory

## Current Status

- ✅ Project: Open in Xcode
- ✅ Target: Any iOS Simulator Device
- ✅ Scheme: SalahCompanion
- ✅ Dependencies: Pods installed (71 pods)
- ✅ Metro: Starting
- ⏳ Ready to build

## Next Steps

1. **In Xcode**: Press `Cmd + R` to build and run
2. **Or from Terminal**: `npx react-native run-ios`
3. **Wait for build** (first build takes 5-10 minutes)
4. **App will launch** automatically on simulator
