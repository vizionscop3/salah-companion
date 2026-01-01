# Material Neubrutomorphism Testing Checklist

## Pre-Testing Setup

### 1. Font Setup ✅
- [ ] Run font setup script: `./scripts/setup-fonts.sh`
- [ ] Verify fonts are in `assets/fonts/` directory
- [ ] Run `npx react-native-asset` to link fonts
- [ ] For iOS: Add fonts to `Info.plist`
- [ ] Restart Metro bundler: `npm start -- --reset-cache`

### 2. Dependencies Check
- [ ] All packages installed: `npm install`
- [ ] iOS pods installed: `cd ios && pod install && cd ..`
- [ ] Android build tools ready

## Visual Testing

### Theme & Colors

#### Background Colors
- [ ] Primary background: `#0F1419` (Deep navy)
- [ ] Secondary background: `#1A2332` (Cards)
- [ ] Tertiary background: `#242F42` (Elevated)
- [ ] All screens use dark theme consistently

#### Primary Color
- [ ] Turquoise `#3DD9C5` used for:
  - [ ] Borders on cards
  - [ ] Active states
  - [ ] Primary buttons
  - [ ] Icons and accents
  - [ ] Shadow offsets

#### Text Colors
- [ ] Primary text: `#FFFFFF` (White)
- [ ] Secondary text: `#A8B2C1` (Light gray)
- [ ] Muted text: `#6B7280` (Gray)
- [ ] Good contrast ratios (WCAG AA compliant)

### Typography

#### Font Families
- [ ] Poppins used for:
  - [ ] Headers (h1-h6)
  - [ ] Navigation labels
  - [ ] Button text
- [ ] Inter used for:
  - [ ] Body text
  - [ ] Descriptions
  - [ ] Captions

#### Font Weights
- [ ] Regular (400) for body text
- [ ] Medium (500) for emphasis
- [ ] SemiBold (600) for subheadings
- [ ] Bold (700) for headings
- [ ] ExtraBold (800) for display text

### Shadows & Borders

#### Neubrutal Cards
- [ ] 3-4px borders with primary color
- [ ] Hard offset shadows (6px, 6px, 0)
- [ ] Shadow color matches primary (`#3DD9C5`)
- [ ] Cards have proper elevation

#### Buttons
- [ ] Bold borders (3px)
- [ ] Hard offset shadows
- [ ] Press animations work smoothly
- [ ] Shadow moves on press (2px, 2px)

### Components Testing

#### NeubrutalCard
- [ ] Renders with correct border width
- [ ] Shadow appears correctly
- [ ] Press animation works
- [ ] Hover states (if applicable)
- [ ] Different shadow sizes work (small, medium, large)

#### NeubrutalButton
- [ ] Primary variant: Turquoise background
- [ ] Secondary variant: Dark background with border
- [ ] Outline variant: Transparent with border
- [ ] Press animations smooth
- [ ] Loading states display correctly
- [ ] Disabled states work

#### QiblaCompass
- [ ] Circular design with bold border
- [ ] Direction markers (N, E, S, W) visible
- [ ] Compass needle animates smoothly
- [ ] Kaaba icon centered
- [ ] Degree display shows correctly
- [ ] Distance display works (if enabled)

#### PrayerTimesScreen
- [ ] Hero section with gradient
- [ ] Location name displays
- [ ] Sunrise/Sunset times show
- [ ] Prayer tabs work (Prayer, Adhaan, Iqamah, Alarm)
- [ ] Active tab highlighted
- [ ] Prayer list items styled correctly
- [ ] Active prayer highlighted
- [ ] Prayer icons display
- [ ] Times formatted correctly

#### HomeScreen
- [ ] Header with location
- [ ] Tab switcher works (Home/Notifications)
- [ ] Next prayer card displays
- [ ] Progress card shows
- [ ] Quick actions buttons work
- [ ] Qibla compass displays

#### Bottom Navigation
- [ ] Bold top border (3px)
- [ ] Primary color active states
- [ ] Icons display correctly
- [ ] Labels visible
- [ ] Shadow effect present
- [ ] Navigation works smoothly

## Animation Testing

### Press Animations
- [ ] Cards scale down on press (0.98)
- [ ] Buttons move shadow on press (2px, 2px)
- [ ] Animations are smooth (60fps)
- [ ] No jank or stuttering

### Transitions
- [ ] Screen transitions smooth
- [ ] Tab switching animations work
- [ ] Compass needle rotates smoothly
- [ ] Loading states animate

### Gestures
- [ ] Pull-to-refresh works
- [ ] Scroll gestures smooth
- [ ] Touch targets minimum 44x44px

## Functional Testing

### Navigation
- [ ] All tabs navigate correctly
- [ ] Stack navigation works
- [ ] Back button works
- [ ] Deep linking (if applicable)

### Prayer Times
- [ ] Times calculate correctly
- [ ] Next prayer detection works
- [ ] Countdown timer accurate
- [ ] Refresh functionality works

### Qibla Compass
- [ ] Location permission requested
- [ ] Qibla direction calculates
- [ ] Compass updates with device orientation
- [ ] Distance to Kaaba displays

### Notifications
- [ ] Notification list displays
- [ ] Icons show correctly
- [ ] Timestamps format correctly
- [ ] Tap actions work

## Performance Testing

### Rendering
- [ ] No layout thrashing
- [ ] Smooth scrolling
- [ ] Fast initial load
- [ ] No memory leaks

### Shadows
- [ ] Shadows render efficiently
- [ ] No performance impact
- [ ] Works on low-end devices

## Accessibility Testing

### Screen Readers
- [ ] All text readable
- [ ] Buttons have labels
- [ ] Images have alt text
- [ ] Navigation accessible

### Touch Targets
- [ ] Minimum 44x44px
- [ ] Adequate spacing
- [ ] No overlapping elements

### Contrast
- [ ] Text readable on backgrounds
- [ ] WCAG AA compliant
- [ ] High contrast mode works

## Device Testing

### iOS
- [ ] iPhone SE (small screen)
- [ ] iPhone 14 (standard)
- [ ] iPhone 14 Pro Max (large)
- [ ] iPad (tablet)
- [ ] Dark mode compatibility

### Android
- [ ] Small screen (320dp)
- [ ] Standard screen (360dp)
- [ ] Large screen (420dp)
- [ ] Tablet
- [ ] Different Android versions

## Edge Cases

### Empty States
- [ ] No prayer times available
- [ ] Location denied
- [ ] Network errors
- [ ] Loading states

### Long Text
- [ ] Long location names
- [ ] Long mosque names
- [ ] Long notification text
- [ ] Text truncation works

### Orientation
- [ ] Portrait mode
- [ ] Landscape mode (if supported)
- [ ] Rotation handling

## Browser/Platform Specific

### iOS Specific
- [ ] Safe area handling
- [ ] Status bar styling
- [ ] Font rendering
- [ ] Shadow rendering

### Android Specific
- [ ] Status bar styling
- [ ] Back button handling
- [ ] Font rendering
- [ ] Elevation shadows

## Checklist Summary

### Critical Issues
- [ ] No crashes
- [ ] All screens load
- [ ] Navigation works
- [ ] Core features functional

### Design Quality
- [ ] Consistent styling
- [ ] Proper spacing
- [ ] Good contrast
- [ ] Smooth animations

### Performance
- [ ] Fast load times
- [ ] Smooth scrolling
- [ ] Efficient rendering
- [ ] No memory issues

## Testing Commands

```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run tests
npm test

# Type check
npm run type-check

# Lint
npm run lint
```

## Reporting Issues

When reporting issues, include:
1. Device/OS version
2. Steps to reproduce
3. Expected vs actual behavior
4. Screenshots/videos
5. Console logs

## Notes

- Test on real devices when possible
- Use React Native Debugger for debugging
- Check performance with Flipper
- Monitor memory usage
- Test with slow network

