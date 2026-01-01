# Google Sign-In Setup Guide

**Date**: December 18, 2025  
**Status**: ✅ **IMPLEMENTED** (Configuration Required)

---

## Overview

Google Sign-In has been implemented in the Salah Companion app. Users can now sign in or register using their Google (Gmail) account for a seamless authentication experience.

---

## Implementation Status

✅ **Code Implementation Complete**:
- Google Sign-In package installed (`@react-native-google-signin/google-signin`)
- Auth service updated with Google Sign-In functions
- AuthContext updated with `loginWithGoogle` method
- LoginScreen and RegisterScreen updated with Google Sign-In buttons
- App initialization configured

⚠️ **Configuration Required**:
- Google Cloud Console project setup
- OAuth 2.0 credentials configuration
- Android SHA-1 fingerprint configuration
- Web Client ID configuration

---

## Setup Instructions

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google Sign-In API**:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google Sign-In API"
   - Click "Enable"

### Step 2: Configure OAuth Consent Screen

1. Navigate to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type (unless you have Google Workspace)
3. Fill in required information:
   - App name: "Salah Companion"
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes:
   - `email`
   - `profile`
   - `openid`
5. Save and continue through the steps

### Step 3: Create OAuth 2.0 Credentials

1. Navigate to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application" as application type
4. Name it: "Salah Companion Web Client"
5. **Important**: Add authorized redirect URIs (if needed)
6. Click "Create"
7. **Copy the Client ID** (this is your Web Client ID)

### Step 4: Get Android SHA-1 Fingerprint

**For Debug Build**:
```bash
cd android
./gradlew signingReport
```

Look for the SHA-1 fingerprint in the output (under `debug` variant).

**Or use keytool**:
```bash
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Copy the SHA-1 fingerprint (looks like: `AA:BB:CC:DD:EE:FF:...`)

### Step 5: Create Android OAuth Client

1. In Google Cloud Console → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Android" as application type
4. Name it: "Salah Companion Android"
5. Enter package name: `com.salahcompaniontemp`
6. **Paste your SHA-1 fingerprint**
7. Click "Create"
8. **Copy the Client ID** (Android Client ID - optional, for additional features)

### Step 6: Configure App with Web Client ID

**File**: `src/services/auth/authService.ts`

Find this line:
```typescript
webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
```

Replace `YOUR_WEB_CLIENT_ID` with your actual Web Client ID from Step 3.

**Example**:
```typescript
webClientId: '123456789-abcdefghijklmnop.apps.googleusercontent.com',
```

---

## Testing

### Test Google Sign-In

1. **Build and run the app**:
   ```bash
   npx react-native run-android
   ```

2. **On Login/Register screen**:
   - Tap "Sign in with Google" or "Sign up with Google"
   - Select your Google account
   - Grant permissions if prompted
   - Should automatically sign in and navigate to Home screen

### Troubleshooting

**Error: "Sign in was cancelled"**
- User cancelled the sign-in flow
- This is normal behavior

**Error: "Google Play Services not available"**
- Ensure Google Play Services is installed on the device/emulator
- For emulator: Use an image with Google Play Store

**Error: "Failed to get user information from Google"**
- Check that OAuth consent screen is configured correctly
- Verify Web Client ID is correct
- Check that required scopes are added

**Error: "DEVELOPER_ERROR"**
- SHA-1 fingerprint doesn't match
- Package name doesn't match
- Re-check Step 4 and Step 5

---

## Security Notes

1. **Never commit Web Client ID to version control** in production
2. Use environment variables or secure configuration
3. For production, use separate OAuth clients for debug and release builds
4. Keep SHA-1 fingerprints secure

---

## Files Modified

- ✅ `src/services/auth/authService.ts` - Added Google Sign-In functions
- ✅ `src/context/AuthContext.tsx` - Added `loginWithGoogle` method
- ✅ `src/screens/auth/LoginScreen.tsx` - Added Google Sign-In button
- ✅ `src/screens/auth/RegisterScreen.tsx` - Added Google Sign-In button
- ✅ `src/App.tsx` - Added Google Sign-In initialization

---

## Next Steps

1. **Complete Google Cloud Console setup** (Steps 1-6 above)
2. **Update Web Client ID** in `authService.ts`
3. **Test Google Sign-In** on device/emulator
4. **For production**: Set up separate OAuth clients and use environment variables

---

*Last Updated: December 18, 2025*
