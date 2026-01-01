# iOS Bundle Setup & Testing Guide

## 📦 Bundle Configuration

### Bundle URL
The app is configured to use a local `.jsbundle` file for testing:

**Bundle Location**: `ios/SalahCompanion/main.jsbundle`  
**Bundle URL**: `file:///Users/vizion/Documents/SALAH/ios/SalahCompanion/main.jsbundle`

### AppDelegate Configuration
The `AppDelegate.swift` is configured with the following bundle loading priority:

1. **Local Bundle** (for testing): Checks for `main.jsbundle` in the app bundle
2. **Metro Bundler** (for development): Falls back to Metro bundler on localhost:8081
3. **Manual Fallback**: Direct localhost connection if Metro is available

## 🚀 Quick Commands

### Create Bundle
```bash
npm run bundle:ios
```

### Build & Run on iPhone 17 (iOS 26.2)
```bash
./scripts/run-ios-iphone17.sh
```

Or with bundle regeneration:
```bash
./scripts/run-ios-iphone17.sh --bundle
```

### Run Specific Test
```bash
./scripts/run-ios-test.sh [test-name]
```

Examples:
```bash
./scripts/run-ios-test.sh QiblaCompass
./scripts/run-ios-test.sh PrayerCard
./scripts/run-ios-test.sh progressService
```

## 📱 Available Tests

### Unit Tests (Components)
- `QiblaCompass.test.tsx`
- `PrayerCard.test.tsx`
- `CountdownTimer.test.tsx`
- `AzanPlayer.test.tsx`
- `ProgressCard.test.tsx`

### Unit Tests (Services)
- `quranFoundationClient.test.ts`
- `qiblaService.test.ts`
- `quranicTextService.test.ts`
- `progressService.test.ts`

### Integration Tests
- `data-persistence.test.ts`
- `navigation-flows.test.ts`
- `progress.test.ts`

### E2E Tests
- `core-features.test.ts`
- `recitation-practice.test.ts`
- `pronunciation-academy.test.ts`
- `achievement-system.test.ts`
- `audio-integration.test.ts`

## 🔧 Bundle Script Details

The bundle script (`scripts/bundle-ios.js`) creates a production-ready JavaScript bundle:

- **Platform**: iOS
- **Dev Mode**: false (production bundle)
- **Entry File**: `index.js`
- **Output**: `ios/SalahCompanion/main.jsbundle`
- **Assets**: Copied to `ios/SalahCompanion/`

## 📋 Testing Workflow

1. **Create Bundle** (if needed):
   ```bash
   npm run bundle:ios
   ```

2. **Build & Run App**:
   ```bash
   ./scripts/run-ios-iphone17.sh
   ```

3. **Run Tests**:
   ```bash
   # Run all tests
   npm test
   
   # Run specific test
   ./scripts/run-ios-test.sh [test-name]
   
   # Run with coverage
   npm run test:coverage
   ```

## 🎯 iPhone 17 Simulator Configuration

- **Device**: iPhone 17
- **iOS Version**: 26.2
- **Runtime**: `com.apple.CoreSimulator.SimRuntime.iOS-26-2`

The build script automatically:
- Finds the iPhone 17 simulator
- Boots it if not already running
- Builds the app with the bundle
- Launches the app

## 🔍 Troubleshooting

### Bundle Not Found
If the app can't find the bundle:
1. Regenerate: `npm run bundle:ios`
2. Verify file exists: `ls -lh ios/SalahCompanion/main.jsbundle`
3. Check bundle size (should be ~2-3 MB)

### Simulator Not Found
List available simulators:
```bash
xcrun simctl list devices available | grep "iPhone 17"
```

### Build Fails
1. Clean build: `cd ios && xcodebuild clean`
2. Reinstall pods: `cd ios && pod install`
3. Reset Metro cache: `npm start -- --reset-cache`

