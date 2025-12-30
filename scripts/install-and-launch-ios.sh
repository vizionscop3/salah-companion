#!/bin/bash
# Script to install and launch app on iOS simulator
# Usage: ./scripts/install-and-launch-ios.sh [path-to-app]

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Get iPhone 17 UDID
IPHONE17_UDID=$(xcrun simctl list devices booted | grep "iPhone 17" | grep -v "Pro" | grep -v "Max" | head -1 | grep -oE '[A-F0-9-]{36}' | head -1)

if [ -z "$IPHONE17_UDID" ]; then
    echo "❌ iPhone 17 simulator is not booted"
    echo "Booting iPhone 17..."
    IPHONE17_UDID=$(xcrun simctl list devices available | grep "iPhone 17" | grep -v "Pro" | grep -v "Max" | head -1 | grep -oE '[A-F0-9-]{36}' | head -1)
    xcrun simctl boot "$IPHONE17_UDID"
    sleep 3
fi

echo "📱 iPhone 17 UDID: $IPHONE17_UDID"

# Find the app bundle
if [ -n "$1" ]; then
    APP_PATH="$1"
else
    # Try to find the built app
    APP_PATH=$(find ios/build/Build/Products -name "SalahCompanion.app" -type d 2>/dev/null | head -1)
    
    if [ -z "$APP_PATH" ]; then
        # Try default Xcode build location
        APP_PATH=$(find ~/Library/Developer/Xcode/DerivedData -name "SalahCompanion.app" -type d 2>/dev/null | head -1)
    fi
fi

if [ -z "$APP_PATH" ] || [ ! -d "$APP_PATH" ]; then
    echo "❌ App bundle not found"
    echo "Please build the app first:"
    echo "  npx react-native run-ios --simulator=\"iPhone 17\""
    exit 1
fi

echo "📦 App bundle found: $APP_PATH"

# Install the app
echo ""
echo "📥 Installing app on simulator..."
xcrun simctl install "$IPHONE17_UDID" "$APP_PATH"

if [ $? -eq 0 ]; then
    echo "✅ App installed successfully"
    
    # Get bundle identifier
    BUNDLE_ID=$(/usr/libexec/PlistBuddy -c "Print :CFBundleIdentifier" "$APP_PATH/Info.plist" 2>/dev/null || echo "com.vizion.salahcompanion")
    
    echo ""
    echo "🚀 Launching app..."
    xcrun simctl launch "$IPHONE17_UDID" "$BUNDLE_ID"
    
    echo ""
    echo "✅ App should now be running on iPhone 17 simulator"
    echo "📱 Bundle ID: $BUNDLE_ID"
else
    echo "❌ Failed to install app"
    exit 1
fi

