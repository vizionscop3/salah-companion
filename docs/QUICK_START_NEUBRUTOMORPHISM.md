# Quick Start - Material Neubrutomorphism Setup

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Fonts

```bash
# Make script executable (if not already)
chmod +x scripts/setup-fonts.sh

# Run font setup
./scripts/setup-fonts.sh

# Link fonts
npx react-native-asset
```

### Step 2: iOS Configuration (iOS only)

Add fonts to `ios/SalahCompanion/Info.plist`:

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

### Step 3: Clean & Rebuild

```bash
# Clear Metro cache
npm start -- --reset-cache

# iOS
cd ios && pod install && cd ..
npm run ios

# Android
npm run android
```

## ✅ Verification

1. **Check fonts loaded:**
   - Open app
   - Check headers use Poppins (bold, geometric)
   - Check body text uses Inter (clean, readable)

2. **Check design:**
   - Dark background (`#0F1419`)
   - Turquoise borders (`#3DD9C5`)
   - Bold shadows on cards
   - Smooth animations

3. **Test components:**
   - Tap cards - should animate
   - Tap buttons - shadow should move
   - Check Qibla compass - should have circular design
   - Check prayer times - should have hero section

## 🎨 Customization

### Change Primary Color

Edit `src/constants/theme.ts`:

```typescript
export const colors = {
  primary: {
    main: '#YOUR_COLOR', // Change this
    // ...
  },
};
```

### Adjust Shadow Intensity

```typescript
// More brutal (larger shadows)
export const brutalistShadows = {
  medium: {
    shadowOffset: {width: 10, height: 10}, // Increase from 6
    // ...
  },
};

// More subtle
export const brutalistShadows = {
  medium: {
    shadowOffset: {width: 3, height: 3}, // Decrease from 6
    // ...
  },
};
```

### Change Border Width

```typescript
export const colors = {
  border: {
    width: 5, // Increase from 3 for more brutal
    // ...
  },
};
```

## 🐛 Troubleshooting

### Fonts Not Loading

1. Check files exist:
   ```bash
   ls -la assets/fonts/
   ```

2. Re-link:
   ```bash
   npx react-native-asset
   ```

3. Clear cache:
   ```bash
   npm start -- --reset-cache
   ```

### Shadows Not Showing

- Shadows work best on iOS
- Android uses elevation instead
- Check `elevation` property is set

### Colors Not Applied

- Check theme is using `theme.dark` (updated in App.tsx)
- Verify color values in `theme.ts`
- Clear cache and rebuild

## 📱 Testing

Run the app and check:

- [ ] Dark theme applied
- [ ] Turquoise accents visible
- [ ] Bold borders on cards
- [ ] Shadows appear
- [ ] Animations smooth
- [ ] Fonts load correctly

## 📚 Next Steps

1. Review `TESTING_CHECKLIST.md` for comprehensive testing
2. Customize colors/shadows to your preference
3. Test on real devices
4. Optimize performance if needed

## 🎯 Key Files

- `src/constants/theme.ts` - Theme configuration
- `src/components/NeubrutalCard.tsx` - Card component
- `src/components/NeubrutalButton.tsx` - Button component
- `src/App.tsx` - App root with font preloader

## 💡 Tips

- Use `FontPreloader` to ensure fonts load before rendering
- Test on both iOS and Android
- Use React Native Debugger for debugging
- Check performance with Flipper

---

**Need help?** Check `FONT_SETUP.md` for detailed font setup or `TESTING_CHECKLIST.md` for testing guide.

