# Testing Guide

This directory contains all tests for the Salah Companion application.

## Test Structure

```
tests/
├── setup.ts              # Global test setup and mocks
├── utils/                 # Test utilities and helpers
│   └── testHelpers.tsx   # Common test components and functions
├── unit/                  # Unit tests
│   ├── components/        # Component tests
│   └── services/         # Service tests
└── integration/          # Integration tests
    └── progress.test.ts   # Progress service integration tests
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- PrayerCard.test.tsx
```

### Run tests matching a pattern
```bash
npm test -- --testNamePattern="Progress"
```

## Test Coverage Goals

- **Components**: 80%+ coverage
- **Services**: 90%+ coverage
- **Hooks**: 80%+ coverage
- **Overall**: 70%+ coverage

Current coverage thresholds are set in `jest.config.js`.

## Writing Tests

### Component Tests

Use React Testing Library for component tests:

```typescript
import {render, screen} from '@testing-library/react-native';
import {TestWrapper} from '@tests/utils/testHelpers';
import {MyComponent} from '@components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(
      <TestWrapper>
        <MyComponent />
      </TestWrapper>
    );
    
    expect(screen.getByText('Expected Text')).toBeTruthy();
  });
});
```

### Service Tests

Mock Prisma client for service tests:

```typescript
import {prisma} from '@services/database/prismaClient';
import {myService} from '@services/myService';

jest.mock('@services/database/prismaClient');

describe('MyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('performs action correctly', async () => {
    (prisma.model.findMany as jest.Mock).mockResolvedValue([...]);
    
    const result = await myService.getData();
    
    expect(result).toEqual(expectedResult);
  });
});
```

### Integration Tests

Test the flow between services and database:

```typescript
describe('Feature Integration', () => {
  it('completes full workflow', async () => {
    // Setup mocks
    // Execute workflow
    // Verify results
  });
});
```

## Mocking

### Prisma Client

Prisma client is automatically mocked in `tests/setup.ts`. Use:

```typescript
(prisma.model.method as jest.Mock).mockResolvedValue(data);
```

### React Native Modules

Common React Native modules are mocked in `tests/setup.ts`:
- AsyncStorage
- react-native-reanimated
- react-native-sound
- react-native-push-notification

### Custom Mocks

Create custom mocks in test files or in `tests/utils/`:

```typescript
jest.mock('@services/myService', () => ({
  myService: {
    method: jest.fn(),
  },
}));
```

## Test Utilities

### TestWrapper

Provides all necessary providers for component tests:

```typescript
import {TestWrapper} from '@tests/utils/testHelpers';

render(
  <TestWrapper>
    <YourComponent />
  </TestWrapper>
);
```

### Helper Functions

- `mockDate(dateString)` - Create mock dates
- `createMockPrayerTimes()` - Generate mock prayer times
- `waitForAsync(ms)` - Wait for async operations

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Use `beforeEach` and `afterEach` to reset state
3. **Descriptive Names**: Test names should clearly describe what they test
4. **AAA Pattern**: Arrange, Act, Assert
5. **Mock External Dependencies**: Don't test third-party libraries
6. **Test Behavior**: Test what the component/service does, not implementation details

## Continuous Integration

Tests run automatically on:
- Pull requests
- Pushes to main/develop branches
- Scheduled nightly runs

Coverage reports are generated and uploaded to CI.

## Troubleshooting

### Tests failing with "Cannot find module"
- Check that module paths match `jest.config.js` moduleNameMapper
- Ensure TypeScript paths are correctly configured

### Prisma client errors
- Ensure Prisma client is mocked in test setup
- Check that mock implementations match actual Prisma API

### Async timing issues
- Use `waitFor` from React Testing Library
- Use `act()` for state updates
- Consider using `waitForAsync` helper

---

For more information, see the [Jest documentation](https://jestjs.io/docs/getting-started) and [React Testing Library documentation](https://testing-library.com/docs/react-native-testing-library/intro/).

