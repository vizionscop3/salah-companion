# iOS Device vs Simulator - Build Configuration

## Issue: Physical Device Selected Instead of Simulator

When React Native detects both a physical device and simulator, it may try to use the physical device first. If Developer Mode is not enabled on the physical device, the build will fail.

## Error Message
```
error: Developer Mode disabled
To use Lee's iPhone for development, enable Developer Mode in Settings → Privacy & Security.
```

## Solutions

### Option 1: Use Simulator (Recommended for Testing)

Force React Native to use the simulator:

```bash
# Specify simulator explicitly
npx react-native run-ios --simulator="iPhone 17"

# Or use any available simulator
npx react-native run-ios --simulator="iPhone 15"
```

### Option 2: Enable Developer Mode on Physical Device

If you want to test on your physical iPhone:

1. **On your iPhone:**
   - Go to **Settings → Privacy & Security**
   - Scroll down to **Developer Mode**
   - Toggle **Developer Mode** ON
   - Your iPhone will restart

2. **After restart:**
   - A prompt will appear asking to enable Developer Mode
   - Tap **Turn On**
   - Enter your passcode

3. **Trust the computer:**
   - Connect iPhone via USB
   - When prompted on iPhone: "Trust This Computer?" → Tap **Trust**
   - Enter your passcode

4. **In Xcode:**
   - Open `ios/SalahCompanion.xcworkspace`
   - Select your iPhone from device dropdown
   - Configure code signing (may need Apple ID)
   - Build and run

### Option 3: Disconnect Physical Device

Simply disconnect your iPhone via USB, and React Native will automatically use the simulator.

## Check Available Destinations

```bash
# List all available simulators
xcrun simctl list devices available | grep iPhone

# List booted devices
xcrun simctl list devices booted
```

## Recommended Workflow

For development and testing, use the **simulator**:
- Faster builds
- No code signing required
- Easy to reset/clean
- Multiple device sizes available

For final testing before release, use **physical device**:
- Real performance testing
- Test actual hardware features
- Verify App Store submission

## Current Setup

- ✅ Simulator: iPhone 17 (booted and ready)
- ⚠️ Physical Device: Lee's iPhone (Developer Mode disabled)
- ✅ Metro Bundler: Running on port 8081

**Recommendation:** Use simulator for now:
```bash
npx react-native run-ios --simulator="iPhone 17"
```
