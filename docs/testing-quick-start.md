# Quick Start Testing Guide

**Date**: December 18, 2025

---

## ✅ Setup Complete

- ✅ Port 8081 cleared
- ✅ Metro bundler running
- ✅ Prisma issue fixed (using AsyncStorage)
- ✅ App ready to test

---

## Testing Steps

### 1. Start Metro (Already Running)
```bash
npm run dev
```
**Status**: ✅ Running on port 8081

---

### 2. Launch App on Emulator
```bash
npm run android
```

**Expected**:
- App builds successfully
- App installs on emulator
- App launches

---

### 3. What You Should See

#### If Not Authenticated:
- **Login Screen** with:
  - "Welcome Back" title
  - Email input field
  - Password input field
  - "Sign In" button
  - "Create Account" link

#### If Authenticated:
- **Home Screen** with:
  - "As-salamu alaykum" greeting
  - Next prayer card
  - Progress card
  - Recent achievements
  - Qibla compass

---

### 4. Test Login Flow

1. **Register New Account**:
   - Tap "Create Account"
   - Enter email and password
   - Tap "Sign Up"
   - Should navigate to Home screen

2. **Login**:
   - Enter registered email/password
   - Tap "Sign In"
   - Should navigate to Home screen

---

### 5. Test Navigation

- **Bottom Tabs**:
  - Home
  - Prayer Times
  - Learning
  - Profile

- **Learning Screen**:
  - Tap "Recitation Practice"
  - Should show practice mode selection
  - Tap "Word-by-Word"
  - Should show Word Practice screen

---

## Troubleshooting

### If Still Blank Screen:

1. **Check Metro Terminal**:
   - Look for red error messages
   - Check for "Unable to resolve module" errors

2. **Check Logcat**:
   ```bash
   adb logcat | grep -E "ReactNative|Error|Exception"
   ```

3. **Reload App**:
   - Press `r` in Metro terminal
   - Or shake device → "Reload"

---

## Expected UI Elements

### Login Screen:
- White/light background
- Card with rounded corners
- Text inputs with labels
- Buttons with Material Design styling
- Error messages (if login fails)

### Home Screen:
- Greeting text
- Cards with elevation/shadows
- Progress indicators
- Icons and images
- Navigation tabs at bottom

---

*Last Updated: December 18, 2025*
