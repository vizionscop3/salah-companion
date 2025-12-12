# **Quick Start Guide - Salah Companion**

## **Prerequisites**

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **React Native CLI**: `npm install -g react-native-cli`
- **Xcode** (for iOS development on macOS)
- **Android Studio** (for Android development)
- **PostgreSQL** 14+ (for database)
- **Redis** 6+ (for caching, optional for development)

## **Installation Steps**

### **1. Install Dependencies**

```bash
# Navigate to project directory
cd /Users/vizion/Documents/SALAH

# Install npm dependencies
npm install

# Install iOS dependencies (macOS only)
cd ios && pod install && cd ..
```

### **2. Set Up Environment Variables**

Create a `.env` file in the root directory:

```bash
# Copy the example (if not blocked)
cp .env.example .env

# Edit .env with your configuration
# Add your database URL, API keys, etc.
```

### **3. Set Up Database**

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Seed database with initial data
npm run db:seed
```

### **4. Start Metro Bundler**

In one terminal window:

```bash
npm run dev
# or
npx react-native start
```

### **5. Run on iOS**

In another terminal window (macOS only):

```bash
npm run ios
# or
npx react-native run-ios
```

### **5. Run on Android**

In another terminal window:

```bash
# Make sure Android emulator is running or device is connected
npm run android
# or
npx react-native run-android
```

## **Development Workflow**

### **Running Tests**

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### **Linting & Formatting**

```bash
# Check for linting errors
npm run lint

# Fix linting errors automatically
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check
```

### **Database Operations**

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Create a new migration
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio
```

## **Project Structure Overview**

```
SALAH/
├── src/                 # Source code
│   ├── components/     # Reusable components
│   ├── screens/        # Screen components
│   ├── services/       # Business logic
│   ├── utils/          # Helper functions
│   ├── types/          # TypeScript types
│   ├── hooks/          # Custom hooks
│   ├── context/        # Context providers
│   └── constants/      # Constants & theme
├── prisma/             # Database schema
├── tests/              # Test files
├── docs/               # Documentation
└── assets/             # Static assets
```

## **Common Issues & Solutions**

### **Metro Bundler Issues**

```bash
# Clear Metro cache
npx react-native start --reset-cache
```

### **iOS Build Issues**

```bash
# Clean iOS build
cd ios && xcodebuild clean && cd ..

# Reinstall pods
cd ios && pod deintegrate && pod install && cd ..
```

### **Android Build Issues**

```bash
# Clean Android build
cd android && ./gradlew clean && cd ..
```

### **TypeScript Errors**

```bash
# Regenerate types
npm run type-check

# Clear TypeScript cache
rm -rf node_modules/.cache
```

## **Next Steps**

1. **Review Documentation**:
   - [Strategic Plan](plan.md)
   - [Project Roadmap](project-roadmap.md)
   - [Database Schema](database-schema.md)
   - [Design System](design-system.md)

2. **Start Development**:
   - Follow [Daily Todos](daily-todos.md)
   - Begin Phase 1, Week 1-2 tasks
   - Implement prayer time engine

3. **Join the Community**:
   - Read [CONTRIBUTING.md](../CONTRIBUTING.md)
   - Review [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md)

## **Getting Help**

- **Documentation**: Check `docs/` directory
- **Issues**: Create a GitHub issue
- **Security**: Email security@salahcompanion.app

---

**Happy Coding!** 🚀

*May your development be blessed and productive.*

