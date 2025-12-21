# **iOS Testing Guide - iPhone 12 Compatibility**

## **✅ iPhone 12 Compatibility Fixed**

The app is now configured to support iPhone 12 and older devices:
- **iOS Deployment Target**: Lowered from 15.1 to **14.0**
- **iPhone 12 Support**: ✅ Compatible (runs iOS 14.0+)

## **📱 Testing Methods**

### **Method 1: Using Xcode (Recommended)**

1. **Open the workspace:**
   ```bash
   open ios/SalahCompanion.xcworkspace
   ```

2. **Select scheme:**
   - In Xcode, click the scheme dropdown (top left)
   - Select **"SalahCompanion"**

3. **Select simulator:**
   - Click the device dropdown (next to scheme)
   - Select **"iPhone 12"** or any iPhone 12 variant

4. **Run the app:**
   - Press `Cmd + R` or click the Play button
   - Xcode will build and launch the app

### **Method 2: Command Line**

```bash
# Build and run on iPhone 12 simulator
xcodebuild -workspace ios/SalahCompanion.xcworkspace \
  -scheme SalahCompanion \
  -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 12' \
  build

# Then launch simulator and install app
xcrun simctl boot "iPhone 12"
xcrun simctl install booted build/Build/Products/Debug-iphonesimulator/SalahCompanion.app
xcrun simctl launch booted org.reactjs.native.example.SalahCompanion
```

### **Method 3: React Native CLI (If Scheme Issue Resolved)**

```bash
# Start Metro bundler
npm run dev

# Run on iPhone 12
npx react-native run-ios --simulator="iPhone 12"
```

### **Method 4: Test on Physical iPhone 12**

1. **Connect your iPhone 12 via USB**
2. **Trust the computer** on your iPhone
3. **In Xcode:**
   - Select your iPhone 12 from device dropdown
   - Press `Cmd + R` to build and install
   - App will install and launch on your device

## **🔧 Troubleshooting**

### **Scheme Not Found Error**

If you see "Could not find scheme SalahCompanion":

1. **Open Xcode workspace:**
   ```bash
   open ios/SalahCompanion.xcworkspace
   ```

2. **Verify scheme exists:**
   - Product → Scheme → Manage Schemes
   - Ensure "SalahCompanion" is checked and shared

3. **Recreate scheme if needed:**
   - Product → Scheme → New Scheme
   - Select SalahCompanion target
   - Save

### **Build Errors**

1. **Clean build folder:**
   ```bash
   cd ios
   xcodebuild clean
   cd ..
   ```

2. **Reinstall pods:**
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **Clear Metro cache:**
   ```bash
   npm start -- --reset-cache
   ```

### **Simulator Issues**

1. **List available simulators:**
   ```bash
   xcrun simctl list devices available
   ```

2. **Boot specific simulator:**
   ```bash
   xcrun simctl boot "iPhone 12"
   ```

3. **Reset simulator:**
   ```bash
   xcrun simctl erase "iPhone 12"
   ```

## **✅ Verification**

After the app launches, verify:

1. **Home Screen** - Shows greeting and next prayer
2. **Prayer Times** - Calculates and displays times
3. **Location Permission** - Requests access
4. **Navigation** - All tabs work
5. **Guided Salah** - Step-by-step guidance works

## **📊 Compatibility Status**

- ✅ **iPhone 12**: Compatible (iOS 14.0+)
- ✅ **iPhone 12 mini**: Compatible
- ✅ **iPhone 12 Pro**: Compatible
- ✅ **iPhone 12 Pro Max**: Compatible
- ✅ **iPhone 11 and older**: Compatible (iOS 14.0+)

---

**Note**: The app requires iOS 14.0 or later. iPhone 12 originally shipped with iOS 14.0, so all iPhone 12 devices are supported.

