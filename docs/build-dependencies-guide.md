# **Build Dependencies & Early Build Stage Guide**

## **Understanding Early Build Stages**

When building a React Native app, certain dependencies must compile **before** your app code can build:

1. **Native Dependencies (Pods)** - Must compile first
   - RCT-Folly
   - React-Core
   - Hermes-engine
   - Firebase pods
   - Other native modules

2. **Your App Code** - Compiles after dependencies
   - AppDelegate.swift
   - Your React Native JavaScript bundle

## **Common Early Build Failures**

### **1. RCT-Folly clockid_t Error**

**Symptom:** Build fails during Pod compilation with:
```
error: typedef redefinition with different types ('uint8_t' vs 'enum clockid_t')
```

**Cause:** iOS SDK 26.1+ defines `clockid_t` as enum, but RCT-Folly tries to typedef it.

**Fix:** Apply patch after every `pod install`:
```bash
./scripts/patch-folly-time.sh
```

**Why it happens:** The patch is in the Podfile, but sometimes needs manual application.

### **2. Missing React Native Headers**

**Symptom:** "Cannot find type 'RCTBridge' in scope"

**Cause:** Pods not properly installed or headers not generated.

**Fix:**
```bash
cd ios
pod install
cd ..
```

### **3. Metro Bundler Not Running**

**Symptom:** App builds but crashes on launch with "Unable to load script"

**Cause:** Metro bundler needs to be running for DEBUG builds.

**Fix:** Start Metro in a separate terminal:
```bash
npm run dev
```

## **Build Order**

1. **Install Dependencies:**
   ```bash
   npm install
   cd ios && pod install && cd ..
   ```

2. **Apply Patches:**
   ```bash
   ./scripts/patch-folly-time.sh
   ```

3. **Clean Build:**
   - In Xcode: Product → Clean Build Folder (Shift+Cmd+K)

4. **Start Metro (if needed):**
   ```bash
   npm run dev
   ```

5. **Build in Xcode:**
   - Select simulator
   - Press Cmd+R

## **Verification Checklist**

Before building, verify:

- [ ] `node_modules/` exists and is complete
- [ ] `ios/Pods/` exists and is complete
- [ ] `ios/Pods/RCT-Folly/folly/portability/Time.h` is patched
- [ ] Xcode DerivedData is clean (optional but recommended)
- [ ] Metro bundler is running (for DEBUG builds)

## **Quick Fix Script**

Create a script to run before building:

```bash
#!/bin/bash
# pre-build.sh

echo "🔧 Pre-build Setup"
echo "=================="

# Check node_modules
if [ ! -d "node_modules" ]; then
  echo "Installing npm dependencies..."
  npm install
fi

# Check Pods
if [ ! -d "ios/Pods" ]; then
  echo "Installing pods..."
  cd ios && pod install && cd ..
fi

# Apply patches
echo "Applying patches..."
./scripts/patch-folly-time.sh

echo "✅ Ready to build!"
```

## **Troubleshooting**

### **If build still fails after patches:**

1. **Clean everything:**
   ```bash
   # Clean npm
   rm -rf node_modules package-lock.json
   npm install
   
   # Clean pods
   cd ios
   rm -rf Pods Podfile.lock
   pod install
   cd ..
   
   # Clean Xcode
   rm -rf ~/Library/Developer/Xcode/DerivedData/SalahCompanion-*
   ```

2. **Reapply patches:**
   ```bash
   ./scripts/patch-folly-time.sh
   ```

3. **Rebuild:**
   - In Xcode: Clean Build Folder
   - Build again

## **Status**

- ✅ Patch script created
- ✅ Documentation added
- ⚠️  Remember to run patch after `pod install`

---

**Note:** The clockid_t patch needs to be reapplied after every `pod install` because CocoaPods regenerates the files.

