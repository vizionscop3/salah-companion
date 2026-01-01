# Testing Guide - Quick Reference

## 🚀 Quick Start

### 1. Check Your Setup
```bash
npm run test:setup
```
This will verify all requirements are met.

### 2. Set Up Android Environment (First Time Only)
```bash
npm run test:setup:android
# Then reload shell: source ~/.zshrc
```

### 3. Run Unit Tests
```bash
npm test
```

### 4. Test on Device
```bash
# Terminal 1: Start Metro
npm run dev

# Terminal 2: Run on Android
npm run android
```

---

## 📋 Testing Checklist

### Pre-Testing
- [ ] Run `npm run test:setup` - all checks pass
- [ ] Android Studio installed
- [ ] Emulator or device connected
- [ ] `adb devices` shows your device

### Core Tests
- [ ] Unit tests: `npm test` (51 tests should pass)
- [ ] Type check: `npm run type-check`
- [ ] Lint: `npm run lint`

### Device Tests
- [ ] App builds and installs
- [ ] Prayer times calculate
- [ ] Location permission works
- [ ] Navigation works
- [ ] Authentication works
- [ ] Audio playback (when files added)

---

## 🐛 Common Issues

### `adb: command not found`
```bash
npm run test:setup:android
source ~/.zshrc
```

### `No devices found`
```bash
adb kill-server
adb start-server
adb devices
```

### Metro bundler issues
```bash
npm start -- --reset-cache
```

---

## 📚 Full Documentation

See `docs/testing-setup-guide.md` for complete details.

---

*Quick reference - see full guide for detailed instructions*

