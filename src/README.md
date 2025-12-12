# **Source Code Directory**

This directory contains all the application source code.

## **Directory Structure**

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (Button, Card, etc.)
│   ├── prayer/         # Prayer-specific components
│   ├── learning/       # Learning module components
│   └── ...
├── screens/            # Screen components
│   ├── home/          # Home screen
│   ├── prayer-times/  # Prayer times screen
│   ├── learning/      # Learning center screen
│   ├── profile/       # Profile screen
│   └── navigation/   # Navigation configuration
├── services/           # API and business logic
│   ├── api/           # API service layer
│   ├── prayer/        # Prayer time calculations
│   ├── audio/         # Audio playback service
│   ├── storage/       # Local storage service
│   └── ...
├── utils/              # Helper functions
│   ├── date/          # Date utilities
│   ├── format/        # Formatting utilities
│   └── ...
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
├── context/            # React context providers
│   ├── ThemeContext.tsx
│   └── ...
└── constants/          # App constants
    ├── theme.ts        # Theme configuration
    └── ...
```

## **Naming Conventions**

- **Components**: PascalCase (e.g., `PrayerCard.tsx`)
- **Screens**: PascalCase with "Screen" suffix (e.g., `HomeScreen.tsx`)
- **Services**: camelCase (e.g., `prayerService.ts`)
- **Utils**: camelCase (e.g., `dateUtils.ts`)
- **Hooks**: camelCase with "use" prefix (e.g., `usePrayerTimes.ts`)
- **Types**: PascalCase (e.g., `PrayerTime.ts`)

## **Path Aliases**

Use path aliases for cleaner imports:

```typescript
// Instead of:
import {Button} from '../../../components/common/Button';

// Use:
import {Button} from '@components/common/Button';
```

Available aliases:
- `@/` → `src/`
- `@components/` → `src/components/`
- `@screens/` → `src/screens/`
- `@services/` → `src/services/`
- `@utils/` → `src/utils/`
- `@types/` → `src/types/`
- `@hooks/` → `src/hooks/`
- `@context/` → `src/context/`
- `@constants/` → `src/constants/`

## **Component Guidelines**

1. **Functional Components**: Use functional components with hooks
2. **TypeScript**: All components should be typed
3. **Props Interface**: Define props interfaces above components
4. **Styles**: Use StyleSheet.create for styles
5. **Accessibility**: Include accessibility props

## **Example Component**

```typescript
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '@context/ThemeContext';

interface PrayerCardProps {
  name: string;
  time: string;
}

export const PrayerCard: React.FC<PrayerCardProps> = ({name, time}) => {
  const {currentTheme} = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.name, {color: currentTheme.colors.text}]}>
        {name}
      </Text>
      <Text style={[styles.time, {color: currentTheme.colors.primary}]}>
        {time}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  time: {
    fontSize: 16,
  },
});
```

---

*This structure follows S.A.F.E. D.R.Y. principles for maintainability and scalability.*

