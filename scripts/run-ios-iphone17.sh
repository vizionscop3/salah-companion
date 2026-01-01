#!/bin/bash
# Script to build and run iOS app on iPhone 17 simulator with iOS 26.2
# Usage: ./scripts/run-ios-iphone17.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "📱 iOS Build & Run Script - iPhone 17 (iOS 26.2)"
echo "================================================"

# Step 1: Find iPhone 17 simulator with iOS 26.2
echo ""
echo "🔍 Finding iPhone 17 simulator with iOS 26.2..."

# Get iPhone 17 simulators
IPHONE17_UDID=$(xcrun simctl list devices available | grep "iPhone 17" | grep -v "Pro" | grep -v "Max" | head -1 | grep -oE '[A-F0-9-]{36}' | head -1)

if [ -z "$IPHONE17_UDID" ]; then
    echo "❌ No iPhone 17 simulator found"
    echo "Available devices:"
    xcrun simctl list devices available | grep "iPhone"
    exit 1
fi

echo "✅ Found iPhone 17: $IPHONE17_UDID"

# Get iOS version for this device
IOS_VERSION=$(xcrun simctl list devices "$IPHONE17_UDID" | grep -oE 'iOS [0-9.]+' | head -1)
echo "📱 iOS Version: $IOS_VERSION"

# Step 2: Boot the simulator if not already booted
echo ""
echo "🚀 Booting simulator..."
xcrun simctl boot "$IPHONE17_UDID" 2>/dev/null || echo "ℹ️  Simulator already booted"

# Wait for simulator to be ready
echo "⏳ Waiting for simulator to be ready..."
sleep 3

# Step 3: Create bundle if it doesn't exist or if requested
if [ "$1" == "--bundle" ] || [ ! -f "ios/SalahCompanion/main.jsbundle" ]; then
    echo ""
    echo "📦 Creating JavaScript bundle..."
    npm run bundle:ios
else
    echo ""
    echo "ℹ️  Using existing bundle (use --bundle to regenerate)"
fi

# Step 4: Build and run
echo ""
echo "🔨 Building and running app..."
echo ""

# Use React Native CLI to build and run
npx react-native run-ios \
    --simulator="iPhone 17" \
    --udid="$IPHONE17_UDID"

echo ""
echo "✅ App should now be running on iPhone 17 simulator"
echo "📱 Simulator UDID: $IPHONE17_UDID"
echo "🔗 Bundle URL: file://$(pwd)/ios/SalahCompanion/main.jsbundle"

