#!/bin/bash

# Start Android Development Environment
# Run this script after rebooting to start Metro and install the app

set -e

echo "🚀 Starting Android Development Environment"
echo "=========================================="
echo ""

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "📁 Project root: $PROJECT_ROOT"
echo ""

# Check if Android emulator is running
echo "📱 Checking Android emulator status..."
if adb devices | grep -q "emulator"; then
    echo "✅ Android emulator is running"
    adb devices
else
    echo "⚠️  Android emulator not detected"
    echo "   Please start Android Studio emulator first"
    echo ""
    echo "   Or run: emulator -avd <avd_name>"
    exit 1
fi

echo ""

# Clear Metro bundler cache
echo "🧹 Clearing Metro bundler cache..."
npx react-native start --reset-cache &
METRO_PID=$!

echo "✅ Metro bundler starting (PID: $METRO_PID)"
echo "   Metro will run in the background"
echo ""

# Wait a moment for Metro to start
sleep 5

# Check if Metro is running
if curl -s http://localhost:8081/status > /dev/null 2>&1; then
    echo "✅ Metro bundler is running"
else
    echo "⚠️  Metro bundler may still be starting..."
    echo "   Check: http://localhost:8081/status"
fi

echo ""

# Install and run the app
echo "📦 Installing and running app on Android emulator..."
echo "   This may take a few minutes..."
echo ""

npx react-native run-android

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   - App should be installed and running on emulator"
echo "   - Metro bundler is running in background"
echo "   - To stop Metro: kill $METRO_PID"
echo "   - Or run: lsof -ti:8081 | xargs kill"

