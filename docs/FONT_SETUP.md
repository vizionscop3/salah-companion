# Font Setup Guide - Poppins & Inter

This guide explains how to set up Poppins and Inter fonts for the Salah Companion app.

## Quick Setup

### Option 1: Automatic Setup (Recommended)

Run the setup script:

```bash
chmod +x scripts/setup-fonts.sh
./scripts/setup-fonts.sh
```

Then link the fonts:

```bash
npx react-native-asset
```

### Option 2: Manual Setup

#### Step 1: Download Fonts

Download Poppins and Inter from [Google Fonts](https://fonts.google.com/):

**Poppins:**
- Regular (400)
- Medium (500)
- SemiBold (600)
- Bold (700)
- ExtraBold (800)

**Inter:**
- Regular (400)
- Medium (500)
- SemiBold (600)

#### Step 2: Place Fonts

Place all `.ttf` files in `assets/fonts/` directory:

```
assets/
└── fonts/
    ├── Poppins-Regular.ttf
    ├── Poppins-Medium.ttf
    ├── Poppins-SemiBold.ttf
    ├── Poppins-Bold.ttf
    ├── Poppins-ExtraBold.ttf
    ├── Inter-Regular.ttf
    ├── Inter-Medium.ttf
    └── Inter-SemiBold.ttf
```

#### Step 3: Link Fonts

The `react-native.config.js` is already configured to link fonts automatically. Run:

```bash
npx react-native-asset
```

Or manually:

```bash
# iOS
cd ios && pod install && cd ..

# Android (fonts should work automatically)
```

#### Step 4: iOS Configuration

For iOS, add fonts to `ios/SalahCompanion/Info.plist`:

```xml
<key>UIAppFonts</key>
<array>
  <string>Poppins-Regular.ttf</string>
  <string>Poppins-Medium.ttf</string>
  <string>Poppins-SemiBold.ttf</string>
  <string>Poppins-Bold.ttf</string>
  <string>Poppins-ExtraBold.ttf</string>
  <string>Inter-Regular.ttf</string>
  <string>Inter-Medium.ttf</string>
  <string>Inter-SemiBold.ttf</string>
</array>
```

#### Step 5: Android Configuration

Android should automatically detect fonts in `assets/fonts/`. No additional configuration needed.

## Verification

After setup, fonts should be available in your app. The theme system will automatically use:
- **Poppins** for display text (headers, navigation, buttons)
- **Inter** for body text (paragraphs, descriptions)

## Troubleshooting

### Fonts Not Loading

1. **Check font files exist:**
   ```bash
   ls -la assets/fonts/
   ```

2. **Verify react-native.config.js:**
   ```javascript
   assets: ['./assets/fonts/']
   ```

3. **Re-link assets:**
   ```bash
   npx react-native-asset
   ```

4. **Clear cache:**
   ```bash
   # Metro bundler
   npm start -- --reset-cache
   
   # iOS
   cd ios && pod install && cd ..
   
   # Android
   cd android && ./gradlew clean && cd ..
   ```

### Fonts Not Applied

1. **Check font family names:**
   - Use exact names: `'Poppins'` and `'Inter'`
   - Check for typos in theme.ts

2. **Verify font weights:**
   - Ensure font files match the weights used in code
   - Check fontWeight values in typography config

3. **Test with system fonts:**
   - Temporarily use system fonts to verify styling works
   - Then switch back to custom fonts

## Alternative: Using System Fonts

If you prefer to use system fonts temporarily, update `theme.ts`:

```typescript
export const typography = {
  h1: {
    fontSize: 48,
    fontWeight: '800' as const,
    // Remove fontFamily or use 'System'
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  // ... etc
};
```

## Font Loading in Code

The app uses `FontPreloader` component to ensure fonts are loaded before rendering. This is handled automatically in `App.tsx`.

## Resources

- [Google Fonts - Poppins](https://fonts.google.com/specimen/Poppins)
- [Google Fonts - Inter](https://fonts.google.com/specimen/Inter)
- [React Native Fonts Guide](https://reactnative.dev/docs/text#limited-style-inheritance)

