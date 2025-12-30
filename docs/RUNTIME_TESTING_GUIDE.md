# Runtime Testing Guide - Material Neubrutomorphism

## 🚀 Current Status

Metro bundler and both iOS/Android builds are starting. Use this guide to verify the Material Neubrutomorphism design is working correctly.

## ⏱️ Expected Timeline

- **Metro Bundler**: ~10-30 seconds to start
- **iOS Build**: ~1-3 minutes (first build longer)
- **Android Build**: ~1-3 minutes (first build longer)

## ✅ What to Check When Apps Load

### 1. Initial Load
- [ ] App launches without crashes
- [ ] Font preloader shows briefly (if fonts not cached)
- [ ] Dark theme background appears (`#0F1419` - deep navy)
- [ ] No red error screens

### 2. Home Screen
- [ ] **Header**: Location "Al-aksa" with turquoise icon
- [ ] **Tabs**: Home and Notifications tabs visible
- [ ] **Greeting**: "As-salamu alaykum" in Poppins (bold, geometric)
- [ ] **Next Prayer Card**: 
  - Turquoise border (3-4px)
  - Hard shadow visible (offset shadow)
  - Press animation works
- [ ] **Quick Actions**: Buttons with turquoise styling

### 3. Prayer Times Screen
- [ ] **Hero Section**: Gradient background with location name
- [ ] **Sunrise/Sunset**: Icons and times display
- [ ] **Tabs**: Prayer, Adhaan, Iqamah, Alarm tabs
- [ ] **Active Tab**: Highlighted with turquoise indicator
- [ ] **Prayer List**: 
  - Each prayer has icon (🌙, ☀️, etc.)
  - Turquoise borders on cards
  - Active prayer highlighted
  - Times formatted correctly

### 4. Qibla Compass
- [ ] **Circular Design**: Bold turquoise border
- [ ] **Direction Markers**: N, E, S, W visible
- [ ] **Compass Needle**: Points to Qibla direction
- [ ] **Kaaba Icon**: Centered in compass
- [ ] **Degree Display**: Shows angle in turquoise badge
- [ ] **Distance**: Shows distance to Kaaba (if enabled)

### 5. Bottom Navigation
- [ ] **Bold Border**: 3px turquoise top border
- [ ] **Icons**: Material Community Icons display
- [ ] **Active State**: Turquoise color for active tab
- [ ] **Shadow**: Hard offset shadow visible
- [ ] **Navigation**: Tapping tabs switches screens

### 6. Typography
- [ ] **Headers**: Use Poppins (bold, geometric)
- [ ] **Body Text**: Use Inter (clean, readable)
- [ ] **Font Weights**: 
  - Regular (400) for body
  - SemiBold (600) for subheadings
  - Bold (700) for headings
  - ExtraBold (800) for display

### 7. Colors
- [ ] **Background**: Deep navy `#0F1419`
- [ ] **Cards**: Dark gray `#1A2332`
- [ ] **Primary**: Turquoise `#3DD9C5` on:
  - Borders
  - Active states
  - Buttons
  - Icons
- [ ] **Text**: White primary, light gray secondary

### 8. Shadows & Borders
- [ ] **Card Borders**: 3-4px turquoise borders
- [ ] **Shadows**: Hard offset shadows (6px, 6px, 0)
- [ ] **Shadow Color**: Turquoise tint visible
- [ ] **Press Effects**: Cards/buttons animate on press

### 9. Animations
- [ ] **Card Press**: Scales down (0.98) smoothly
- [ ] **Button Press**: Shadow moves (2px, 2px)
- [ ] **Screen Transitions**: Smooth navigation
- [ ] **Compass Needle**: Rotates smoothly
- [ ] **No Jank**: 60fps animations

## 🐛 Common Issues & Fixes

### Issue: Fonts Not Loading
**Symptoms**: System fonts instead of Poppins/Inter
**Fix**:
```bash
# Re-link fonts
npx react-native-asset

# For iOS, add to Info.plist (see FONT_SETUP.md)
# Then rebuild
cd ios && pod install && cd ..
npm run ios
```

### Issue: Shadows Not Visible
**Symptoms**: No shadows on cards/buttons
**Fix**:
- iOS: Should work automatically
- Android: Uses elevation instead of shadows
- Check `elevation` property is set in theme

### Issue: Colors Not Applied
**Symptoms**: Light theme or wrong colors
**Fix**:
- Verify `App.tsx` uses `theme.dark`
- Clear cache: `npm start -- --reset-cache`
- Rebuild app

### Issue: Animations Not Smooth
**Symptoms**: Janky or stuttering animations
**Fix**:
- Check `react-native-reanimated` is installed
- Enable Hermes (should be default)
- Check device performance

### Issue: Layout Issues
**Symptoms**: Elements overlapping or cut off
**Fix**:
- Check SafeAreaView usage
- Verify spacing values
- Test on different screen sizes

## 📱 Platform-Specific Checks

### iOS
- [ ] Safe area handling (notch/status bar)
- [ ] Status bar style (light content)
- [ ] Font rendering (Poppins/Inter)
- [ ] Shadow rendering (should be crisp)
- [ ] Touch targets (minimum 44x44px)

### Android
- [ ] Status bar styling
- [ ] Back button handling
- [ ] Font rendering
- [ ] Elevation shadows (instead of iOS shadows)
- [ ] Touch targets (minimum 48x48px)

## 🎯 Quick Test Checklist

Run through these quickly:

1. **Tap a card** → Should animate (scale down)
2. **Tap a button** → Shadow should move
3. **Switch tabs** → Smooth transition
4. **Scroll lists** → Smooth scrolling
5. **Check colors** → Dark theme, turquoise accents
6. **Check fonts** → Poppins headers, Inter body
7. **Check shadows** → Visible on cards/buttons

## 📊 Performance Checks

- [ ] Initial load < 3 seconds
- [ ] Smooth scrolling (60fps)
- [ ] No memory leaks
- [ ] Animations smooth
- [ ] No layout thrashing

## 🔍 Debugging Tools

### React Native Debugger
- Open DevTools
- Check console for errors
- Inspect component tree
- Monitor performance

### Flipper
- Network inspector
- Layout inspector
- Performance profiler
- Logs viewer

## ✅ Success Criteria

The implementation is successful if:
- ✅ Dark theme applied consistently
- ✅ Turquoise accents visible throughout
- ✅ Bold borders on all cards
- ✅ Shadows visible (iOS) or elevation (Android)
- ✅ Smooth animations
- ✅ Fonts load correctly
- ✅ No crashes or errors
- ✅ All screens functional

## 📝 Notes

- First build takes longer
- Metro bundler needs to be running
- Emulators should be started before builds
- Check console for any warnings

## 🆘 If Something's Wrong

1. **Check Metro bundler**: Should show "Metro waiting on..."
2. **Check console**: Look for errors/warnings
3. **Check device logs**: Use `adb logcat` (Android) or Xcode console (iOS)
4. **Restart**: Kill Metro and rebuild
5. **Clear cache**: `npm start -- --reset-cache`

---

**Current Status**: Metro bundler and builds starting...
**Next**: Wait for emulators to load, then verify checklist above

