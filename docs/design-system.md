# **Salah Companion - Material Neubrutomorphism Design System**

## **Design Philosophy**

Salah Companion uses a revolutionary **Material Neubrutomorphism** design system that combines:
- **Material UI's professional polish** for enterprise credibility
- **Neubrutomorphism's bold authenticity** for innovative boldness
- **Neumorphic depth and tactile feedback** for sophisticated micro-interactions

This fusion creates an accessible, beautiful, and spiritually respectful interface that serves all users—especially those with learning differences.

## **Color System**

### **Primary Palette**

```typescript
const colors = {
  primary: {
    main: '#1976D2', // Material Blue
    light: '#42A5F5',
    dark: '#1565C0',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#9C27B0', // Material Purple
    light: '#BA68C8',
    dark: '#7B1FA2',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#388E3C', // Material Green
    light: '#66BB6A',
    dark: '#2E7D32',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#F57C00', // Material Orange
    light: '#FFB74D',
    dark: '#E65100',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#D32F2F', // Material Red
    light: '#E57373',
    dark: '#C62828',
    contrastText: '#FFFFFF',
  },
  // Brutalist Accents
  accent: {
    bold: '#FF6B6B', // High-contrast brutalist accent
    calm: '#4ECDC4', // Calming brutalist accent
    dark: '#2C3E50', // Brutalist dark
  },
  // Neumorphic Surfaces
  surface: {
    light: '#F5F5F5',
    main: '#FFFFFF',
    dark: '#E0E0E0',
    elevated: '#FAFAFA',
  },
  // Text Colors
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
    hint: '#9E9E9E',
  },
  // Background
  background: {
    default: '#FFFFFF',
    paper: '#FAFAFA',
    dark: '#121212', // For dark mode
  },
};
```

### **Accessibility**

- All color combinations meet WCAG 2.1 AA standards (4.5:1 contrast ratio)
- High contrast mode available for users with visual impairments
- Color-blind friendly palette (tested with color blindness simulators)

## **Typography**

### **Font System**

```typescript
const typography = {
  // Material Base: Roboto
  fontFamily: {
    primary: 'Roboto, system-ui, sans-serif',
    // Brutalist Display: Lexend Mega, Archivo Black
    display: 'Lexend Mega, Archivo Black, system-ui, sans-serif',
    // Dyslexia Support: OpenDyslexic
    dyslexia: 'OpenDyslexic, system-ui, sans-serif',
  },
  // Material Hierarchy Enhanced with Brutalist Impact
  h1: {
    fontSize: 72, // Brutalist oversized
    fontWeight: 900, // Brutalist weight
    lineHeight: 1.2,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 48,
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: -0.25,
  },
  h3: {
    fontSize: 36,
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: 28,
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: 24,
    fontWeight: 500,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: 20,
    fontWeight: 500,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: 16, // Material readable
    fontWeight: 400,
    lineHeight: 1.6,
  },
  body2: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 1.6,
  },
  button: {
    fontSize: 16,
    fontWeight: 600, // Brutalist weight
    lineHeight: 1.5,
    textTransform: 'uppercase', // Brutalist style
    letterSpacing: 0.5,
  },
  caption: {
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 1.5,
  },
};
```

### **Arabic Typography**

```typescript
const arabicTypography = {
  fontFamily: 'Amiri, Noto Sans Arabic, system-ui',
  fontSize: {
    large: 32,
    medium: 24,
    small: 18,
  },
  lineHeight: 2.0, // Generous spacing for Arabic
  direction: 'rtl',
};
```

## **Elevation & Shadows**

### **Material Elevation System**

```typescript
const elevation = {
  0: 'none',
  1: '0px 1px 3px rgba(0,0,0,0.12), 0px 1px 2px rgba(0,0,0,0.24)',
  2: '0px 3px 6px rgba(0,0,0,0.16), 0px 3px 6px rgba(0,0,0,0.23)',
  4: '0px 10px 20px rgba(0,0,0,0.19), 0px 6px 6px rgba(0,0,0,0.23)',
  8: '0px 15px 25px rgba(0,0,0,0.15), 0px 5px 10px rgba(0,0,0,0.05)',
  16: '0px 20px 40px rgba(0,0,0,0.19), 0px 12px 12px rgba(0,0,0,0.23)',
  24: '0px 25px 50px rgba(0,0,0,0.25), 0px 15px 15px rgba(0,0,0,0.22)',
};
```

### **Brutalist Drop Shadows**

```typescript
const brutalistShadows = {
  small: '4px 4px 0px rgba(0,0,0,0.25)',
  medium: '6px 6px 0px rgba(0,0,0,0.25)',
  large: '8px 8px 0px rgba(0,0,0,0.25)',
  // 45-degree angle for geometric feel
  angle45: '6px 6px 0px rgba(0,0,0,0.3)',
};
```

### **Neumorphic Depth**

```typescript
const neumorphicDepth = {
  // Light source from top-left
  inset: 'inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.9)',
  raised: '4px 4px 8px rgba(0,0,0,0.1), -4px -4px 8px rgba(255,255,255,0.9)',
  pressed: 'inset 6px 6px 12px rgba(0,0,0,0.15), inset -6px -6px 12px rgba(255,255,255,0.8)',
};
```

## **Spacing System**

### **Material 8dp Grid + Brutalist Intentional Gaps**

```typescript
const spacing = {
  // Material 8dp base
  xs: 4,   // 0.5 * 8
  sm: 8,   // 1 * 8
  md: 16,  // 2 * 8
  lg: 24,  // 3 * 8
  xl: 32,  // 4 * 8
  xxl: 48, // 6 * 8
  // Brutalist intentional gaps
  brutalist: {
    small: 12,
    medium: 20,
    large: 40,
  },
};
```

## **Component Specifications**

### **Button System**

```typescript
// Material Base + Brutalist Shadow + Neumorphic Depth
const buttonStyles = {
  primary: {
    backgroundColor: colors.primary.main,
    color: colors.primary.contrastText,
    elevation: 2,
    brutalistShadow: brutalistShadows.small,
    borderRadius: 4, // Material subtle
    padding: `${spacing.md}px ${spacing.lg}px`,
    // Neumorphic on press
    pressed: neumorphicDepth.pressed,
  },
  secondary: {
    backgroundColor: colors.secondary.main,
    color: colors.secondary.contrastText,
    // Similar structure
  },
  // Brutalist variant
  brutalist: {
    backgroundColor: colors.accent.bold,
    color: '#FFFFFF',
    borderRadius: 0, // Sharp corners
    brutalistShadow: brutalistShadows.medium,
    border: '4px solid #000000',
  },
};
```

### **Card System**

```typescript
const cardStyles = {
  default: {
    backgroundColor: colors.surface.main,
    elevation: 2,
    borderRadius: 8,
    padding: spacing.lg,
    // Material elevation
  },
  brutalist: {
    backgroundColor: colors.surface.main,
    border: '4px solid #000000',
    brutalistShadow: brutalistShadows.medium,
    borderRadius: 0,
    padding: spacing.lg,
  },
  neumorphic: {
    backgroundColor: colors.surface.light,
    boxShadow: neumorphicDepth.raised,
    borderRadius: 16,
    padding: spacing.lg,
  },
};
```

### **Input Fields**

```typescript
const inputStyles = {
  default: {
    border: `2px solid ${colors.text.disabled}`,
    borderRadius: 4,
    padding: spacing.md,
    focus: {
      borderColor: colors.primary.main,
      elevation: 1,
    },
  },
  brutalist: {
    border: '4px solid #000000',
    borderRadius: 0,
    brutalistShadow: brutalistShadows.small,
    focus: {
      borderColor: colors.accent.bold,
      brutalistShadow: brutalistShadows.medium,
    },
  },
  neumorphic: {
    boxShadow: neumorphicDepth.inset,
    border: 'none',
    borderRadius: 12,
    focus: {
      boxShadow: neumorphicDepth.raised,
    },
  },
};
```

## **Animation & Motion**

### **Material Motion + Brutalist Directness**

```typescript
const animations = {
  // Material easing
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
  },
  // Brutalist instant feedback
  duration: {
    instant: 0,
    fast: 150,
    standard: 300,
    slow: 500,
  },
  // Neumorphic smooth transitions
  transitions: {
    depth: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
    shadow: 'box-shadow 0.2s ease-in-out',
  },
};
```

## **Accessibility Features**

### **For Users with Learning Differences**

1. **ADHD Support**
   - Bite-sized visual chunks
   - Clear focus indicators
   - Minimal distractions
   - Visual timers

2. **Dyslexia Support**
   - OpenDyslexic font option
   - High contrast mode
   - Audio-first interface option
   - Color-coded visual cues

3. **Universal Accessibility**
   - VoiceOver/TalkBack compatibility
   - Adjustable text sizes
   - Color-blind friendly palette
   - Haptic feedback options
   - Keyboard navigation

## **Dark Mode**

```typescript
const darkMode = {
  background: {
    default: '#121212',
    paper: '#1E1E1E',
    elevated: '#2C2C2C',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
  },
  // Adjusted brutalist shadows for dark mode
  brutalistShadows: {
    small: '4px 4px 0px rgba(255,255,255,0.1)',
    medium: '6px 6px 0px rgba(255,255,255,0.15)',
  },
};
```

## **Design Tokens**

Complete design token system exported as JSON/TypeScript for use across the application.

See [design-tokens.md](design-tokens.md) for full token specifications.

## **Component Library**

### **Prayer-Specific Components**

1. **PrayerTimeCard**: Material elevation + brutalist typography
2. **AzanPlayer**: Neumorphic controls + brutalist play button
3. **RecitationPractice**: Neumorphic recording interface
4. **ProgressRing**: Brutalist geometric progress indicator
5. **AchievementBadge**: Neumorphic depth + brutalist border

### **Navigation Components**

1. **BottomNavigation**: Material tabs + brutalist active indicator
2. **Drawer**: Material drawer + brutalist geometric structure
3. **Header**: Material AppBar + brutalist title treatment

## **Implementation Guidelines**

1. **Consistency**: Use design tokens, never hardcode values
2. **Accessibility**: Test with screen readers and keyboard navigation
3. **Performance**: Optimize animations and shadows
4. **Responsive**: Mobile-first, adapt to tablet/desktop
5. **Cultural Sensitivity**: Respectful Islamic aesthetic

---

*This design system is implemented using Material-UI with custom theme extensions for brutalist and neumorphic elements.*

