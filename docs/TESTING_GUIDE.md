# Testing Guide - Material Neubrutomorphism Implementation

**Date**: December 21, 2024

## Overview

This guide helps you test the updated Material Neubrutomorphism design system and improved error handling across all practice screens.

## Pre-Testing Checklist

- [ ] Metro bundler is running (`npm start`)
- [ ] Android emulator is running OR iOS simulator is running
- [ ] App is built and installed on device/emulator
- [ ] Location permissions are available (for QiblaCompass testing)

## Testing Material Neubrutomorphism Design

### 1. GuidedSalahScreen

**What to Test:**
- [ ] Dark theme background (#0F1419)
- [ ] Turquoise accent color (#3DD9C5) on buttons and borders
- [ ] Bold 3px borders on cards
- [ ] Triple-layer shadow system visible on cards
- [ ] Position tags with icons display correctly
- [ ] Step number in turquoise color
- [ ] Arabic text uses Amiri font
- [ ] English text uses Poppins font
- [ ] Play Audio button has proper styling
- [ ] Previous/Next buttons have proper variants
- [ ] Progress bar shows turquoise color

**Navigation:**
- Home → Quick Actions → "Start Guided Prayer"

### 2. WordPracticeScreen

**What to Test:**
- [ ] Dark theme background
- [ ] Word display card with turquoise border
- [ ] Arabic word displayed in large Amiri font
- [ ] Play Reference button (outline variant)
- [ ] Record Your Recitation card
- [ ] Start Recording button (primary variant)
- [ ] Feedback card displays correctly
- [ ] Accuracy score with color coding
- [ ] Previous/Next Word buttons
- [ ] Progress bar shows correctly

**Navigation:**
- Learning → Recitation Practice → Word-by-Word → Start Practice

### 3. AyahPracticeScreen

**What to Test:**
- [ ] Dark theme background
- [ ] Ayah display card with large Arabic text
- [ ] Transliteration and translations display
- [ ] Play Reference button
- [ ] Recording functionality
- [ ] Feedback with overall accuracy
- [ ] Tajweed score display
- [ ] Word-by-word analysis
- [ ] Color-coded accuracy indicators

**Navigation:**
- Learning → Recitation Practice → Ayah Mode → Start Practice

### 4. SurahPracticeScreen

**What to Test:**
- [ ] Dark theme background
- [ ] Surah information header
- [ ] Play Reference button
- [ ] Start Recording button
- [ ] All ayahs displayed in card
- [ ] Current ayah highlighted during recording
- [ ] Progress bar during recording
- [ ] Feedback card with scores
- [ ] Practice Again button

**Navigation:**
- Learning → Recitation Practice → Full Surah → Start Practice

## Testing Error Handling

### Audio Error Handling

**What to Test:**
- [ ] Audio errors don't show toast notifications
- [ ] Audio playback failures don't block UI
- [ ] App continues to function when audio fails
- [ ] No error messages appear to user
- [ ] Audio buttons still work (just no sound)

**How to Test:**
1. Navigate to GuidedSalahScreen
2. Try to play audio (may fail if audio files not available)
3. Verify no error toasts appear
4. Verify UI remains functional
5. Check Metro console for dev-only logs

### Location Permission Handling

**What to Test:**
- [ ] Clear error message when permission denied
- [ ] Specific error for GPS unavailable
- [ ] Timeout handling (15 seconds)
- [ ] Retry button works correctly
- [ ] Error messages are user-friendly

**How to Test:**
1. Deny location permission when prompted
2. Verify error message appears
3. Click Retry button
4. Grant permission and verify compass works
5. Test with GPS disabled (airplane mode)
6. Test timeout by waiting 15+ seconds

## Testing Animations and Interactions

### Button Animations

**What to Test:**
- [ ] Buttons scale down on press (0.98x)
- [ ] Buttons have offset shadow animation
- [ ] Buttons return to normal on release
- [ ] Smooth spring animations
- [ ] No janky or stuttering animations

**How to Test:**
1. Press any NeubrutalButton
2. Observe scale and shadow animation
3. Release and observe return animation
4. Test on multiple buttons

### Card Interactions

**What to Test:**
- [ ] Cards have proper shadow depth
- [ ] Cards have bold borders
- [ ] Cards respond to touch (if interactive)
- [ ] Shadow system creates depth effect

**How to Test:**
1. View cards on different screens
2. Observe shadow layers
3. Verify border thickness (3px)
4. Check shadow colors (turquoise glow)

## Visual Consistency Checks

### Color Scheme

- [ ] Background: #0F1419 (deep navy)
- [ ] Cards: #1A2332 (dark gray)
- [ ] Primary: #3DD9C5 (turquoise)
- [ ] Text Primary: White/Light gray
- [ ] Text Secondary: Gray with opacity

### Typography

- [ ] Headings use Poppins font
- [ ] Body text uses Inter font
- [ ] Arabic text uses Amiri font
- [ ] Font weights are correct (700 for headings)
- [ ] Line heights are appropriate

### Spacing

- [ ] Consistent spacing using Fibonacci scale
- [ ] Cards have proper padding
- [ ] Buttons have proper spacing
- [ ] Text has proper margins

## Performance Testing

**What to Test:**
- [ ] Screens load quickly
- [ ] Animations are smooth (60fps)
- [ ] No lag when navigating
- [ ] No memory leaks
- [ ] Audio doesn't block UI thread

## Device-Specific Testing

### Android

- [ ] Material Neubrutomorphism renders correctly
- [ ] Shadows display properly
- [ ] Animations are smooth
- [ ] Location permissions work
- [ ] Audio playback works (if files available)

### iOS

- [ ] Material Neubrutomorphism renders correctly
- [ ] Shadows display properly
- [ ] Animations are smooth
- [ ] Location permissions work
- [ ] Audio playback works (if files available)

## Known Issues

1. **Audio Files**: Audio may not play if files aren't in bundle (expected - silent fallback)
2. **Location**: Requires actual device or emulator with location services enabled
3. **Fonts**: Custom fonts (Poppins, Inter, Amiri) must be properly linked

## Reporting Issues

When reporting issues, include:
- Screen name
- Device/Emulator type
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if possible

## Success Criteria

✅ All screens display Material Neubrutomorphism design
✅ No error toasts appear for audio failures
✅ Location errors show clear, actionable messages
✅ Animations are smooth and responsive
✅ Color scheme is consistent across all screens
✅ Typography is consistent and readable
✅ Shadows and borders create proper depth effect

