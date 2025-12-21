# Quick Start: Testing Setup

## ✅ Current Status

- ✅ **Java 17**: Installed
- ⚠️ **Android Studio**: Needs installation
- ⚠️ **Android SDK**: Will be installed with Android Studio
- ✅ **Unit Tests**: All 51 passing

---

## 🚀 Next Steps (In Order)

### 1. Install Android Studio

**Download**: https://developer.android.com/studio

**Installation**:
1. Download the `.dmg` file
2. Drag to Applications
3. Launch Android Studio
4. Follow setup wizard (choose "Standard" installation)
5. Accept all licenses
6. Wait for SDK download (~10-15 minutes)

**See**: `docs/android-studio-setup.md` for detailed steps

### 2. Configure Environment

After Android Studio installation:

```bash
# Configure Android SDK paths
npm run test:setup:android

# Reload shell
source ~/.zshrc

# Verify setup
npm run test:setup
```

### 3. Create Android Emulator

1. Open Android Studio
2. **Tools** → **Device Manager**
3. Click **"Create Device"**
4. Select **Pixel 5**
5. Select **API 33** system image
6. Click **Finish**

### 4. Test on Emulator

```bash
# Terminal 1: Start Metro bundler
npm run dev

# Terminal 2: Run app
npm run android
```

---

## 📋 Verification Checklist

After setup, verify:

- [ ] `java -version` shows Java 17
- [ ] `npm run test:setup` shows all green checkmarks
- [ ] `adb devices` shows emulator or device
- [ ] `emulator -list-avds` shows your AVD
- [ ] App builds and runs on emulator

---

## 🐛 Common Issues

### Java Not Found
```bash
# Reload shell
source ~/.zshrc

# Verify
java -version
```

### Android SDK Not Found
```bash
# Run setup script
npm run test:setup:android

# Enter SDK path when prompted
# Default: ~/Library/Android/sdk
```

### No Emulator
- Open Android Studio
- Tools → Device Manager
- Create new AVD

---

## 📚 Full Documentation

- **Android Studio Setup**: `docs/android-studio-setup.md`
- **Testing Guide**: `docs/testing-setup-guide.md`
- **Device Testing**: `docs/device-testing-guide.md`
- **Test Results**: `docs/test-results-summary.md`

---

*Quick reference - see full guides for details*

