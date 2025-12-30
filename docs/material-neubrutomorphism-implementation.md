# Material Neubrutomorphism UI/UX Implementation

## Overview

The Salah Companion app has been updated with a complete Material Neubrutomorphism design system, combining:
- **40% Neubrutalism** - Bold borders, hard offset shadows, high contrast
- **30% Neumorphism** - Soft inner shadows, tactile depth
- **30% Material Design** - Professional polish, elevation layers

## Design System

### Color Palette

- **Primary**: `#3DD9C5` (Turquoise) - Main brand color
- **Backgrounds**: 
  - Primary: `#0F1419` (Deep navy)
  - Secondary: `#1A2332` (Cards)
  - Tertiary: `#242F42` (Elevated)
- **Text**: White primary, `#A8B2C1` secondary, `#6B7280` muted
- **Accents**: Gold (#FFB84D), Rose (#FF6B9D), Purple (#A78BFA), Blue (#60A5FA)

### Shadow System

Triple-layer shadow system:
1. **Neumorphic Inner** - Creates pressed/extruded surface effect
2. **Outer Glow** - Adds depth and ambient light
3. **Brutal Offset** - Hard shadow with primary color (6px, 6px, 0)

### Typography

- **Display Font**: Poppins (Headers, Navigation, Buttons)
- **Body Font**: Inter (Paragraphs, Descriptions)
- **Scale**: Fibonacci-based (8px, 16px, 24px, 32px, 48px)

## Components Created

### 1. NeubrutalCard
Core card component with:
- Bold borders (3-4px)
- Triple-layer shadow system
- Press animations
- Configurable shadow sizes

**Location**: `src/components/NeubrutalCard.tsx`

### 2. NeubrutalButton
Bold button component with:
- Primary/Secondary/Outline variants
- Hard offset shadows
- Press animations
- Loading states

**Location**: `src/components/NeubrutalButton.tsx`

### 3. QiblaCompass (Updated)
Completely redesigned compass with:
- Circular neubrutal design
- Directional markers (N, E, S, W)
- Animated needle
- Kaaba icon at center
- Degree display badge

**Location**: `src/components/QiblaCompass.tsx`

### 4. MosqueFinder
New component for finding mosques:
- Search bar with neubrutal styling
- Map placeholder
- Mosque cards with distance
- Set button for selection

**Location**: `src/components/MosqueFinder.tsx`

### 5. NotificationList
Notification display component:
- Icon-based notifications
- Timestamp display
- Neubrutal card styling

**Location**: `src/components/NotificationList.tsx`

## Screens Updated

### 1. HomeScreen
- Header with location and tab switcher
- Next prayer card with neubrutal design
- Quick actions with neubrutal buttons
- Tab switching between Home and Notifications

**Location**: `src/screens/home/HomeScreen.tsx`

### 2. PrayerTimesScreen
- Hero section with gradient background
- Prayer tabs (Prayer, Adhaan, Iqamah, Alarm)
- Prayer list with icons and colors
- Active prayer highlighting
- Sunrise/Sunset display

**Location**: `src/screens/prayer-times/PrayerTimesScreen.tsx`

### 3. Bottom Navigation
- Neubrutal styling with bold border
- Primary color active states
- Material Community Icons
- Elevated shadow effect

**Location**: `src/screens/navigation/AppNavigator.tsx`

## Theme Configuration

Complete theme system updated in:
**Location**: `src/constants/theme.ts`

### Key Features:
- Material Neubrutomorphism color system
- Triple-layer shadow definitions
- Typography scale with Poppins/Inter
- Border radius scale
- Spacing system (Fibonacci-based)

## Design Principles Applied

1. **Bold Borders**: 3-4px borders with primary color
2. **Hard Shadows**: Offset shadows (6px, 6px, 0) with primary color
3. **High Contrast**: White text on dark backgrounds
4. **Tactile Feedback**: Press animations on interactive elements
5. **Consistent Spacing**: Fibonacci-based scale throughout
6. **Professional Polish**: Material Design elevation combined with brutalist elements

## Usage Examples

### Using NeubrutalCard
```tsx
import {NeubrutalCard} from '@components/index';

<NeubrutalCard shadowSize="medium" borderWidth={3}>
  <Text>Card Content</Text>
</NeubrutalCard>
```

### Using NeubrutalButton
```tsx
import {NeubrutalButton} from '@components/index';

<NeubrutalButton
  title="Submit"
  onPress={handleSubmit}
  variant="primary"
  size="medium"
/>
```

## Next Steps

1. **Add Fonts**: Ensure Poppins and Inter fonts are loaded
2. **Test Animations**: Verify all animations work smoothly
3. **Responsive Design**: Test on different screen sizes
4. **Accessibility**: Ensure WCAG compliance
5. **Performance**: Optimize shadow rendering if needed

## Files Modified/Created

### Created:
- `src/components/NeubrutalCard.tsx`
- `src/components/NeubrutalButton.tsx`
- `src/components/MosqueFinder.tsx`
- `src/components/NotificationList.tsx`

### Updated:
- `src/constants/theme.ts` - Complete theme overhaul
- `src/components/QiblaCompass.tsx` - Redesigned
- `src/screens/home/HomeScreen.tsx` - Redesigned
- `src/screens/prayer-times/PrayerTimesScreen.tsx` - Redesigned
- `src/screens/navigation/AppNavigator.tsx` - Bottom nav styling
- `src/components/index.ts` - Added new exports

## Design References

Based on the provided design files:
- `DESIGN_SYSTEM_GUIDE.md` - Visual guide
- `IMPLEMENTATION_TUTORIAL.md` - Step-by-step guide
- `SalahCompanionApp.jsx` - React web reference
- `styles.css` - CSS reference

All designs have been adapted for React Native with proper styling and animations.

