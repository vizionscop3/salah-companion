# Android Development Setup Requirements

## Current Status

✅ **Unit Tests**: All 51 tests passing  
⚠️ **Java Runtime**: Missing (required for Android builds)  
⚠️ **Android Studio**: Not installed yet  
⚠️ **Android SDK**: Not configured  

---

## Required Installations

### 1. Java Development Kit (JDK)

**Error**: `Unable to locate a Java Runtime`

**Solution**: Install JDK 17 (required for React Native)

#### Option A: Using Homebrew (Recommended)
```bash
# Install JDK 17
brew install openjdk@17

# Link it
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk

# Add to PATH (add to ~/.zshrc)
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH="$JAVA_HOME/bin:$PATH"

# Reload shell
source ~/.zshrc

# Verify
java -version
# Should show: openjdk version "17.x.x"
```

#### Option B: Download from Oracle
1. Visit: https://www.oracle.com/java/technologies/downloads/#java17
2. Download macOS installer
3. Install and set JAVA_HOME

### 2. Android Studio

**Download**: https://developer.android.com/studio

**Installation Steps**:
1. Download Android Studio
2. Run installer
3. During setup, install:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device (AVD)
   - SDK Platform API 33+ (recommended)

**After Installation**:
- Android SDK will be at: `~/Library/Android/sdk`
- Run the setup script: `npm run test:setup:android`

### 3. Environment Variables

After installing Android Studio, run:
```bash
npm run test:setup:android
source ~/.zshrc
```

This will configure:
- `ANDROID_HOME`
- `JAVA_HOME`
- PATH for `adb`, `emulator`, etc.

---

## Verification Steps

### 1. Check Java
```bash
java -version
# Should show Java 17
```

### 2. Check Android SDK
```bash
echo $ANDROID_HOME
# Should show: /Users/vizion/Library/Android/sdk
```

### 3. Check adb
```bash
adb version
# Should show version info
```

### 4. Run Setup Check
```bash
npm run test:setup
# Should show all green checkmarks
```

---

## Quick Setup Script

Run this after installing Java and Android Studio:

```bash
# 1. Install Java (if using Homebrew)
brew install openjdk@17

# 2. Set up Android environment
npm run test:setup:android

# 3. Reload shell
source ~/.zshrc

# 4. Verify
npm run test:setup
```

---

## Test Warnings (Optional Fix)

The tests pass but show some warnings:

1. **act() warnings**: React state updates in tests
   - These are warnings, not errors
   - Tests still pass correctly
   - Can be fixed later for cleaner output

2. **Location permission errors**: Expected in test environment
   - These are intentional (testing error handling)
   - Not actual errors

---

## Next Steps After Setup

1. ✅ Java installed and verified
2. ✅ Android Studio installed
3. ✅ Environment variables configured
4. ✅ Run `npm run test:setup` - all green
5. ✅ Create Android Virtual Device (AVD)
6. ✅ Run `npm run android` - app builds and runs

---

*Last Updated: December 12, 2024*

